import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  StoryCardComponent,
  Story,
} from '../../shared/components/story-card/story-card.component';
import {
  UserCardComponent,
  UserProfile,
} from '../../shared/components/user-card/user-card.component';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

type LibraryTab =
  | 'bookmarks'
  | 'downloaded'
  | 'history'
  | 'completed'
  | 'following'
  | 'favorites'
  | 'collections';

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
          <p>Manage your entire reading journey</p>
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
              placeholder="Search library..."
            />
          </div>

          <div class="filter-group">
            <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()">
              <option value="recent">Recently Added</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author</option>
            </select>

            <select [(ngModel)]="filterGenre" (ngModelChange)="applyFilters()">
              <option value="">All Genres</option>
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
              Bookmarks
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'downloaded'"
              (click)="activeTab.set('downloaded')"
            >
              Downloaded
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'history'"
              (click)="activeTab.set('history')"
            >
              Reading History
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'completed'"
              (click)="activeTab.set('completed')"
            >
              Completed
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'following'"
              (click)="activeTab.set('following')"
            >
              Following
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'favorites'"
              (click)="activeTab.set('favorites')"
            >
              Favorites
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'collections'"
              (click)="activeTab.set('collections')"
            >
              Collections
            </button>
          </div>
        </div>

        <!-- Tab Contents -->
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

          <!-- DOWNLOADED -->
          <div *ngSwitchCase="'downloaded'">
            @if (!canDownload) {
              <div class="premium-upgrade">
                <div class="premium-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="var(--gold)"
                  >
                    <path
                      d="M12 2.25C10.4812 2.25 9.25 3.48122 9.25 5C9.25 5.78328 9.57756 6.48937 10.1018 6.98967C10.0375 7.10378 9.97102 7.22294 9.90223 7.34628L8.10504 10.5686C7.92732 10.8873 7.82158 11.0749 7.7325 11.2018C7.70459 11.2415 7.68483 11.2655 7.67287 11.2788C7.5918 11.2208 7.47104 11.1231 7.05879 10.7138L6.97976 10.635C6.6607 10.317 6.37058 10.0279 6.10664 9.79144C6.19926 9.54508 6.25 9.27824 6.25 9C6.25 7.75736 5.24264 6.75 4 6.75C2.75736 6.75 1.75 7.75736 1.75 9C1.75 9.98302 2.3804 10.8188 3.25898 11.1251C3.26199 11.1822 3.26564 11.2399 3.26976 11.298C3.29277 11.6228 3.33458 12.0116 3.38243 12.4564L3.5671 14.1733C3.59705 14.4517 3.62574 14.7289 3.65412 15.0031C3.76616 16.0856 3.87332 17.121 4.03322 17.994C4.1343 18.5459 4.26178 19.0659 4.43833 19.5172C4.61339 19.9648 4.8549 20.3925 5.21187 20.712C5.84173 21.2758 6.60137 21.522 7.50819 21.6381C8.38307 21.75 9.48625 21.75 10.8602 21.75H13.1398C14.5137 21.75 15.6169 21.75 16.4918 21.6381C17.3986 21.522 18.1583 21.2758 18.7881 20.712C19.1451 20.3925 19.3866 19.9648 19.5617 19.5172C19.7382 19.0659 19.8657 18.5459 19.9668 17.994C20.1267 17.1211 20.2338 16.0858 20.3459 15.0034C20.3742 14.7293 20.403 14.4516 20.4329 14.1733L20.6176 12.4565C20.6654 12.0116 20.7072 11.6228 20.7302 11.298C20.7344 11.2399 20.738 11.1822 20.741 11.1251C21.6196 10.8188 22.25 9.98302 22.25 9C22.25 7.75736 21.2426 6.75 20 6.75C18.7574 6.75 17.75 7.75736 17.75 9C17.75 9.27824 17.8007 9.54509 17.8934 9.79145C17.6294 10.0279 17.3393 10.317 17.0202 10.635L16.9412 10.7138C16.6825 10.9715 16.529 11.1231 16.4082 11.2208C16.3699 11.2518 16.344 11.2695 16.3288 11.2791C16.1784 11.0749 16.0727 10.8873 15.895 10.5686L14.0977 7.34619C14.0289 7.22288 13.9625 7.10375 13.8982 6.98967C14.4224 6.48937 14.75 5.78328 14.75 5C14.75 3.48122 13.5188 2.25 12 2.25ZM10.75 5C10.75 4.30964 11.3096 3.75 12 3.75C12.6904 3.75 13.25 4.30964 13.25 5C13.25 5.48504 12.9739 5.90689 12.5668 6.11457C12.3975 6.20095 12.2056 6.25 12 6.25C11.7944 6.25 11.6025 6.20095 11.4332 6.11457C11.0261 5.90689 10.75 5.48504 10.75 5Z"
                    />
                  </svg>
                </div>
                <h2>Upgrade to Download</h2>
                <p>
                  Your current subscription plan doesn't include offline
                  downloads.
                </p>
                <button
                  class="btn-primary"
                  routerLink="/settings"
                  [queryParams]="{ tab: 'subscription' }"
                >
                  Choose a different plan
                </button>
              </div>
            } @else {
              <ng-container
                *ngTemplateOutlet="
                  storyGrid;
                  context: { list: filteredDownloaded }
                "
              ></ng-container>
            }
          </div>

          <!-- HISTORY -->
          <div *ngSwitchCase="'history'">
            <ng-container
              *ngTemplateOutlet="storyGrid; context: { list: filteredHistory }"
            ></ng-container>
          </div>

          <!-- COMPLETED -->
          <div *ngSwitchCase="'completed'">
            <ng-container
              *ngTemplateOutlet="
                storyGrid;
                context: { list: filteredCompleted }
              "
            ></ng-container>
          </div>

          <!-- FOLLOWING -->
          <div *ngSwitchCase="'following'">
            @if (filteredFollowing.length > 0) {
              <div class="authors-list">
                @for (author of filteredFollowing; track author.id) {
                  <app-user-card [user]="author"></app-user-card>
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
                    <path d="M12 20h9"></path>
                    <path
                      d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                    ></path>
                  </svg>
                </div>
                <h2>No Authors Found</h2>
                <p>You aren't following any authors that match this search.</p>
                <button class="btn-primary" routerLink="/">Find Authors</button>
              </div>
            }
          </div>

          <!-- FAVORITES -->
          <div *ngSwitchCase="'favorites'">
            <ng-container
              *ngTemplateOutlet="storyGrid; context: { list: [] }"
            ></ng-container>
          </div>

          <!-- COLLECTIONS -->
          <div *ngSwitchCase="'collections'">
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h2>No Collections Yet</h2>
              <p>
                Create playlists of your favorite stories to organize your
                library.
              </p>
              <button
                class="btn-primary"
                (click)="alert('Collections coming soon!')"
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
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
          <h2>Nothing here yet</h2>
          <p>We couldn't find any items matching your criteria.</p>
          <button class="btn-primary" routerLink="/">Discover Stories</button>
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
        appearance: none;
        font-size: 14px;
        font-family: var(--sans);
        cursor: pointer;
        outline: none;
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
  subService = inject(SubscriptionService);
  api = inject(ApiService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  activeTab = signal<LibraryTab>('bookmarks');

  // Raw Data
  allBookmarks: Story[] = [];
  allHistory: Story[] = [];
  allFollowing: UserProfile[] = [];
  allDownloaded: Story[] = [];

  // Filtered Data
  filteredBookmarks: Story[] = [];
  filteredHistory: Story[] = [];
  filteredCompleted: Story[] = [];
  filteredDownloaded: Story[] = []; // Currently mock data
  filteredFollowing: UserProfile[] = [];

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
            'following',
            'favorites',
            'collections',
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
    // 1. Bookmarks
    this.authService.getLibrary().subscribe((books) => {
      this.allBookmarks = books.map((b) => this.mapToStory(b));
      this.extractGenres(this.allBookmarks);
      this.applyFilters();
    });

    // 2. Following
    this.authService.getFollowing().subscribe((authors) => {
      this.allFollowing = authors.map((a) => ({
        id: a._id,
        name: a.username,
        avatar: this.getAvatarUrl(a.avatar, a.username),
        followers: a.followersCount || 0,
      }));
      this.applyFilters();
    });

    // 3. History (also used for Completed)
    this.authService.getReadingProgress().subscribe((progressItems) => {
      this.allHistory = progressItems.map((p: any) => {
        const s = this.mapToStory(p.book);
        s.rating = p.progressPercentage || 0; // Temporarily map progress percentage to rating for filter
        return s;
      });
      this.extractGenres(this.allHistory);
      this.applyFilters();
    });

    // 4. Downloaded (Mock from LocalStorage)
    const storedDownloads = JSON.parse(
      localStorage.getItem('downloaded_books') || '[]',
    );
    this.allDownloaded = storedDownloads.map((b: any) => ({
      id: b.id,
      title: b.title || 'Unknown Title',
      author:
        typeof b.author === 'object'
          ? b.author?.username
          : b.author || 'Unknown Author',
      cover: b.coverImage || b.cover || this.api.getFallbackCover(),
      genre: b.genres?.[0] || b.genre || '',
    }));
    this.extractGenres(this.allDownloaded);
    this.applyFilters();
  }

  private mapToStory(b: any): Story {
    return {
      id: b._id,
      title: b.title || 'Unknown Title',
      author:
        typeof b.author === 'object'
          ? b.author?.username
          : b.author || 'Unknown Author',
      cover: b.cover || this.api.getFallbackCover(),
      genre: b.genre || '',
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
    this.filteredHistory = filterAndSort(this.allHistory);
    this.filteredCompleted = filterAndSort(this.allHistory, true);
    this.filteredDownloaded = filterAndSort(this.allDownloaded);

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
