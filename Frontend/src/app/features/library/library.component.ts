import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  StoryCardComponent,
  Story,
} from '../../shared/components/story-card/story-card.component';
import { Subject, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import {
  UserCardComponent,
  UserProfile,
} from '../../shared/components/user-card/user-card.component';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { AuthorService } from '../../core/services/author.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

type LibraryTab =
  | 'bookmarks'
  | 'downloaded'
  | 'history'
  | 'completed'
  | 'favorites'
  | 'collections'
  | 'competitions';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StoryCardComponent,
    UserCardComponent,
    RouterModule,
    TranslatePipe,
  ],
  template: `
    <div class="library-page">
      <div class="hero-section">
        <div class="wrap">
          <h1>{{ 'libraryPage.title' | translate }}</h1>
          <p>{{ 'libraryPage.subtitle' | translate }}</p>
        </div>
      </div>

      <div class="wrap library-content">
        <!-- Controls Bar -->
        <div class="controls-bar">
          <div class="search-box">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="applyFilters()"
              [placeholder]="'libraryPage.searchPlaceholder' | translate"
            />
          </div>

          <div class="filter-group">
            <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()">
              <option value="recent">{{ 'libraryPage.recentlyAdded' | translate }}</option>
              <option value="title">{{ 'libraryPage.titleAZ' | translate }}</option>
              <option value="author">{{ 'libraryPage.author' | translate }}</option>
            </select>

            <select [(ngModel)]="filterGenre" (ngModelChange)="applyFilters()">
              <option value="">{{ 'libraryPage.allGenres' | translate }}</option>
              <option *ngFor="let g of availableGenres" [value]="g">
                {{ g }}
              </option>
            </select>
          </div>
        </div>

        <!-- Tabs (Horizontal Scrollable) -->
        <div class="tabs-container">
          <div class="tabs">
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'bookmarks'"
              (click)="activeTab.set('bookmarks')"
            >
              {{ 'libraryPage.bookmarks' | translate }}
            </button>

            <button
              class="tab-btn"
              [class.active]="activeTab() === 'history'"
              (click)="activeTab.set('history')"
            >
              {{ 'libraryPage.readingHistory' | translate }}
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'favorites'"
              (click)="activeTab.set('favorites')"
            >
              {{ 'libraryPage.favorites' | translate }}
            </button>
          </div>
        </div>

        <!-- Tab Contents -->
        @if (isLoading()) {
          <div class="story-grid" style="margin-top: 24px;">
            <div class="skeleton-card" *ngFor="let i of [1, 2, 3, 4, 5, 6, 7, 8]">
              <div class="skeleton skeleton-cover"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
          </div>
        } @else {
          <div class="tab-content" [ngSwitch]="activeTab()">
          <!-- BOOKMARKS -->
          <div *ngSwitchCase="'bookmarks'">
            <ng-container
              *ngTemplateOutlet="
                storyGrid;
                context: { list: filteredBookmarks }
              "
            ></ng-container>
          </div>



          <!-- HISTORY -->
          <div *ngSwitchCase="'history'">
            <ng-container
              *ngTemplateOutlet="storyGrid; context: { list: filteredHistory }"
            ></ng-container>
          </div>

          <!-- FAVORITES -->
          <div *ngSwitchCase="'favorites'">
            <ng-container
              *ngTemplateOutlet="storyGrid; context: { list: filteredFavorites }"
            ></ng-container>
          </div>


          </div>
        }
      </div>
    </div>

    <ng-template #storyGrid let-list="list">
      @if (list.length > 0) {
        <div class="story-grid">
          @for (story of list; track story.id) {
            <app-story-card [story]="story"></app-story-card>
          }
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              ></path>
            </svg>
          </div>
          <h2>{{ 'libraryPage.emptyTitle' | translate }}</h2>
          <p>{{ 'libraryPage.emptyDesc' | translate }}</p>
          <button class="btn-primary" routerLink="/">{{ 'libraryPage.discover' | translate }}</button>
        </div>
      }
    </ng-template>
  `,
  styles: [
    `
      .library-page {
        min-height: calc(100vh - 72px);
        background: var(--paper-warm);
        padding-bottom: 80px;
      }

      .hero-section {
        background: var(--card);
        padding: 48px 0;
        text-align: left;
        border-bottom: 1px solid var(--border-soft);
        margin-bottom: 32px;
      }

      .hero-section h1 {
        font-family: var(--display);
        font-size: 26px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 8px;
      }

      .hero-section p {
        font-size: 15px;
        color: var(--ink-soft);
      }

      /* Controls Bar */
      .controls-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        gap: 16px;
        flex-wrap: wrap;
      }

      .search-box {
        position: relative;
        flex: 1;
        min-width: 250px;
      }

      .search-box svg {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--ink-faint, #a09a90);
      }

      .search-box input {
        width: 100%;
        padding: 10px 16px 10px 40px;
        border: 1px solid var(--border);
        border-radius: 100px;
        background: var(--card);
        color: var(--ink);
        font-size: 14px;
        font-family: var(--sans);
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .search-box input:focus {
        border-color: var(--forest);
      }

      .filter-group {
        display: flex;
        gap: 12px;
      }

      .filter-group select {
        padding: 10px 32px 10px 16px;
        border: 1px solid var(--border);
        border-radius: 100px;
        background: var(--card)
          url('data:image/svg+xml;utf8,<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>')
          no-repeat right 12px center;
        color: var(--ink);
        appearance: none;
        font-size: 14px;
        font-family: var(--sans);
        cursor: pointer;
        outline: none;
      }

      :host-context(.dark-mode) .filter-group select,
      body.dark-mode .filter-group select {
        background-image: url('data:image/svg+xml;utf8,<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>');
      }

      /* Horizontal Tabs */
      .tabs-container {
        width: 100%;
        overflow-x: auto;
        margin-bottom: 32px;
        border-bottom: 1px solid var(--border-soft);
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .tabs-container::-webkit-scrollbar {
        display: none;
      }

      .tabs {
        display: flex;
        gap: 32px;
        width: max-content;
        padding-right: 24px;
      }

      .tab-btn {
        padding: 12px 0;
        font-family: var(--display);
        font-size: 15px;
        font-weight: 600;
        color: var(--ink-soft);
        position: relative;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: color 0.2s;
        white-space: nowrap;
      }

      .tab-btn:hover {
        color: var(--ink);
      }
      .tab-btn.active {
        color: var(--forest-deep);
      }

      .tab-btn.active::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 2px;
        background: var(--forest);
        border-radius: 2px 2px 0 0;
      }

      .story-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 24px;
      }

      .authors-list {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }

      /* Empty & Premium States */
      .empty-state {
        text-align: center;
        padding: 64px 20px;
        background: var(--card);
        border-radius: var(--radius-l);
        border: 1px dashed var(--border);
      }

      .empty-icon {
        margin-bottom: 16px;
        color: var(--ink-faint, #a09a90);
        display: flex;
        justify-content: center;
      }

      .empty-state h2 {
        font-family: var(--display);
        font-size: 20px;
        font-weight: 600;
        color: var(--ink);
        margin-bottom: 8px;
      }

      .empty-state p {
        font-size: 14px;
        color: var(--ink-soft);
        max-width: 400px;
        margin: 0 auto 24px;
      }

      .premium-upgrade {
        text-align: center;
        padding: 80px 20px;
        background: var(--card);
        border-radius: var(--radius-l);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid var(--gold);
      }

      .premium-icon {
        margin-bottom: 16px;
      }

      .premium-upgrade h2 {
        font-family: var(--display);
        font-size: 24px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 8px;
      }

      .premium-upgrade p {
        font-size: 15px;
        color: var(--ink-soft);
        max-width: 350px;
        margin: 0 auto 24px;
      }

      .btn-primary {
        background: var(--forest);
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: 100px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-primary:hover {
        background: var(--forest-deep);
      }

      .wrap {
        max-width: 1240px;
        margin: 0 auto;
        padding: 0 32px;
      }

      @media (max-width: 768px) {
        .wrap {
          padding: 0 16px;
        }
        .hero-section {
          padding: 32px 0;
        }
        .controls-bar {
          flex-direction: column;
          align-items: stretch;
        }
        .filter-group {
          display: flex;
          width: 100%;
        }
        .filter-group select {
          flex: 1;
        }
        .tabs {
          gap: 20px;
        }
        .tab-btn {
          font-size: 14px;
        }
        .story-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
      }
    `,
  ],
})
export class LibraryComponent implements OnInit {
  authService = inject(AuthService);
  authorService = inject(AuthorService);
  subService = inject(SubscriptionService);
  api = inject(ApiService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  activeTab = signal<LibraryTab>('bookmarks');
  isLoading = signal(true);

  // Raw Data
  allBookmarks: Story[] = [];
  allFavorites: Story[] = [];
  allHistory: Story[] = [];
  allFollowing: UserProfile[] = [];
  allDownloaded: Story[] = [];
  allCompetitions: Story[] = [];

  // Filtered Data
  filteredBookmarks: Story[] = [];
  filteredFavorites: Story[] = [];
  filteredHistory: Story[] = [];
  filteredCompleted: Story[] = [];
  filteredDownloaded: Story[] = []; // Currently mock data
  filteredFollowing: UserProfile[] = [];
  filteredCompetitions: Story[] = [];

  // Control States
  searchQuery = '';
  sortBy = 'recent';
  filterGenre = '';

  // Premium check
  canDownload = false;

  // Extract dynamic genres
  availableGenres: string[] = [];

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        const tab = params['tab'] as LibraryTab;
        if (
          [
            'bookmarks',
            'downloaded',
            'history',
            'completed',
            'favorites',
            'collections',
            'competitions',
          ].includes(tab)
        ) {
          this.activeTab.set(tab);
        }
      }
    });

    this.checkSubscription();
    this.loadData();
  }

  checkSubscription() {
    this.subService.getMySubscription().subscribe({
      next: (sub) => {
        // Assume active premium plan allows downloads
        // or more explicitly: sub?.subscription?.plan?.structuredBenefits?.downloads === true
        this.canDownload = !!sub?.active;
      },
      error: () => (this.canDownload = false),
    });
  }

  loadData() {
    this.isLoading.set(true);

    forkJoin({
      books: this.authService.getLibrary(),
      favorites: this.authService.getFavorites(),
      authors: this.authService.getFollowing(),
      progressItems: this.authService.getReadingProgress()
    }).subscribe({
      next: ({ books, favorites, authors, progressItems }) => {
        // 1. Bookmarks
        this.allBookmarks = books.map((b) => this.mapToStory(b));
        this.extractGenres(this.allBookmarks);
        
        // 1.5. Favorites
        this.allFavorites = favorites.map((b) => this.mapToStory(b));
        this.extractGenres(this.allFavorites);

        // 2. Following
        this.allFollowing = authors.map((a) => ({
          id: a._id,
          name: a.username,
          avatar: this.getAvatarUrl(a.avatar, a.username),
          followers: a.followersCount || 0,
        }));

        // 3. History
        this.allHistory = progressItems.map((p: any) => {
          const s = this.mapToStory(p.book);
          s.rating = p.progressPercentage || 0; 
          return s;
        });
        this.extractGenres(this.allHistory);

        // 4. Downloaded (Mock from LocalStorage)
        const storedDownloads = JSON.parse(
          localStorage.getItem('downloaded_books') || '[]',
        );
        this.allDownloaded = storedDownloads.map((b: any) => ({
          id: b.id,
          title: b.title || 'Unknown Title',
          author: typeof b.author === 'object' ? (b.author?.username || b.author?.name) : b.author || 'Unknown Author',
          cover: b.coverImage || b.cover || this.api.getFallbackCover(),
          genre: b.genres?.[0] || b.genre || '',
        }));
        this.extractGenres(this.allDownloaded);

        // 5. Competitions
        if (this.authService.user()?.role === 'writer' || this.authService.user()?.role === 'superadmin') {
          this.authorService.getAuthorProfile(this.authService.user()!.id).subscribe({
            next: (profile) => {
              const allBooks = profile.books || [];
              this.allCompetitions = allBooks
                .filter((b: any) => b.competitionTag)
                .map((b: any) => this.mapToStory(b));
              this.extractGenres(this.allCompetitions);
              this.applyFilters();
              this.isLoading.set(false);
            },
            error: () => {
              this.applyFilters();
              this.isLoading.set(false);
            }
          });
        } else {
          this.applyFilters();
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
  private mapToStory(b: any): Story {
    return {
      id: b._id,
      title: b.title || 'Unknown Title',
      author:
        typeof b.author === 'object'
          ? (b.author?.username || b.author?.name)
          : b.author || 'Unknown Author',
      cover: b.cover || this.api.getFallbackCover(),
      genre: b.genre || '',
      isMature: !!b.isMature,
      accessType: b.accessType,
      isAudio: !!b.isAudio,
    };
  }

  private extractGenres(stories: Story[]) {
    stories.forEach((s) => {
      if (s.genre && !this.availableGenres.includes(s.genre)) {
        this.availableGenres.push(s.genre);
      }
    });
    this.availableGenres.sort();
  }

  applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();

    const filterAndSort = (stories: Story[], requireComplete = false) => {
      let filtered = stories;

      if (requireComplete) {
        filtered = filtered.filter((s) => s.rating === 100);
      }

      if (q) {
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            (typeof s.author === 'string' &&
              s.author.toLowerCase().includes(q)),
        );
      }

      if (this.filterGenre) {
        filtered = filtered.filter((s) => s.genre === this.filterGenre);
      }

      filtered = [...filtered].sort((a, b) => {
        if (this.sortBy === 'title') return a.title.localeCompare(b.title);
        if (this.sortBy === 'author') {
          const aAuth = typeof a.author === 'string' ? a.author : '';
          const bAuth = typeof b.author === 'string' ? b.author : '';
          return aAuth.localeCompare(bAuth);
        }
        return 0;
      });

      return filtered;
    };

    this.filteredBookmarks = filterAndSort(this.allBookmarks);
    this.filteredFavorites = filterAndSort(this.allFavorites);
    this.filteredHistory = filterAndSort(this.allHistory);
    this.filteredCompleted = filterAndSort(this.allHistory, true);
    this.filteredDownloaded = filterAndSort(this.allDownloaded);
    this.filteredCompetitions = filterAndSort(this.allCompetitions);

    // Filter Following
    let fol = this.allFollowing;
    if (q) {
      fol = fol.filter((a) => a.name.toLowerCase().includes(q));
    }
    if (this.sortBy === 'title' || this.sortBy === 'author') {
      fol = [...fol].sort((a, b) => a.name.localeCompare(b.name));
    }
    this.filteredFollowing = fol;
  }

  getAvatarUrl(path: string | undefined, name?: string): string {
    if (!path) return this.api.getFallbackAvatar(name);
    return this.api.getImageUrl(path);
  }

  alert(msg: string) {
    window.alert(msg);
  }
}
