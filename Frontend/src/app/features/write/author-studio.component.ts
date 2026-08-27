import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

interface AuthorStory {
  id: string;
  title: string;
  cover: string;
  status: 'Published' | 'Ongoing' | 'Draft';
  views: string;
  likes: string;
  chapters: number;
  lastUpdated: string;
}

@Component({
  selector: 'app-author-studio',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeUrlPipe],
  template: `
    <div class="studio-page">
      <div class="hero-section">
        <div class="wrap">
          <div class="hero-header">
            <div>
              <h1>Author Studio</h1>
              <p>
                Manage your stories, view analytics, and connect with your
                readers.
              </p>
            </div>
            <button
              class="btn-primary"
              routerLink="/write/new"
              [queryParams]="{ clear: 'true' }"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Create New Story
            </button>
          </div>
        </div>
      </div>

      <div class="wrap content-area">
        <!-- Analytics Dashboard -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon reads">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Total Reads</p>
              <h3 class="stat-value">{{ totalReads | number }}</h3>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon followers">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Followers</p>
              <h3 class="stat-value">{{ userFollowers | number }}</h3>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon likes">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z"
                />
              </svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Total Likes</p>
              <h3 class="stat-value">{{ totalLikes | number }}</h3>
            </div>
          </div>
        </div>

        <!-- My Stories -->
        <div class="stories-section">
          <div class="section-header">
            <h2>My Works</h2>
            <div class="filter-tabs">
              <button
                class="filter-btn"
                [class.active]="currentFilter === 'All'"
                (click)="setFilter('All')"
              >
                All
              </button>
              <button
                class="filter-btn"
                [class.active]="currentFilter === 'Published'"
                (click)="setFilter('Published')"
              >
                Published
              </button>
              <button
                class="filter-btn"
                [class.active]="currentFilter === 'Ongoing'"
                (click)="setFilter('Ongoing')"
              >
                Ongoing
              </button>
              <button
                class="filter-btn"
                [class.active]="currentFilter === 'Drafts'"
                (click)="setFilter('Drafts')"
              >
                Drafts
              </button>
            </div>
          </div>

          @if (isLoading) {
            <div
              class="loading-state"
              style="padding: 48px; text-align: center;"
            >
              Loading stories...
            </div>
          } @else {
            <div class="stories-list">
              @for (story of filteredStories; track story._id) {
                <div class="story-card">
                  <div class="cover-wrapper">
                    <img
                      [src]="
                        (api.getImageUrl(story.cover) | safeUrl) ||
                        'assets/default-cover.png'
                      "
                      [alt]="story.title"
                      class="story-cover"
                      (error)="onCoverError($event)"
                    />
                  </div>

                  <div class="story-details">
                    <div class="story-header">
                      <h3>{{ story.title }}</h3>
                      <span
                        class="status-badge"
                        [ngClass]="
                          story.completionStatus === 'completed'
                            ? 'completed'
                            : story.status
                        "
                        >{{
                          story.completionStatus === 'completed'
                            ? 'Completed'
                            : story.status
                        }}</span
                      >
                    </div>

                    <div class="story-stats">
                      <span>{{ story.chapters || 0 }} Chapters</span>
                      <span>•</span>
                      <span>{{ story.views || 0 }} Reads</span>
                      <span>•</span>
                      <span>{{ story.likesCount || 0 }} Likes</span>
                    </div>

                    <p class="last-updated">
                      Last updated {{ story.updatedAt | date }}
                    </p>
                  </div>

                  <div class="story-actions">
                    <button
                      class="btn-action edit"
                      [routerLink]="['/write/book', story._id]"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                        />
                        <path
                          d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                        />
                      </svg>
                      Manage
                    </button>
                  </div>
                </div>
              }

              @if (filteredStories.length === 0) {
                <div
                  class="empty-state"
                  style="padding: 48px; text-align: center; color: var(--ink-soft);"
                >
                  {{
                    myStories.length === 0
                      ? "You haven't written any stories yet."
                      : 'No stories match this filter.'
                  }}
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .studio-page {
        min-height: calc(100vh - 72px);
        background: var(--paper-warm);
        padding-bottom: 80px;
      }

      .hero-section {
        background: var(--card);
        padding: 48px 0;
        border-bottom: 1px solid var(--border-soft);
        margin-bottom: 40px;
      }

      .hero-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }

      .hero-header h1 {
        font-family: var(--display);
        font-size: 28px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 8px;
      }

      .hero-header p {
        font-size: 15px;
        color: var(--ink-soft);
      }

      .btn-primary {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--forest);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 100px;
        font-family: var(--display);
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: background 0.2s;
        white-space: nowrap;
      }

      .btn-primary:hover {
        background: var(--forest-deep);
      }

      /* Analytics Dashboard */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        margin-bottom: 48px;
      }

      .stat-card {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 20px;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }

      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(43, 38, 32, 0.06);
      }

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-icon.reads {
        color: var(--forest);
        background: transparent;
      }
      .stat-icon.followers {
        color: var(--gold);
        background: transparent;
      }
      .stat-icon.likes {
        color: var(--rose);
        background: transparent;
      }

      .stat-info {
        display: flex;
        flex-direction: column;
      }

      .stat-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--ink-soft);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
      }

      .stat-value {
        font-family: var(--display);
        font-size: 24px;
        font-weight: 700;
        color: var(--ink);
        line-height: 1;
      }

      /* My Stories Section */
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      }

      .section-header h2 {
        font-family: var(--display);
        font-size: 20px;
        font-weight: 700;
        color: var(--ink);
      }

      .filter-tabs {
        display: flex;
        gap: 8px;
      }

      .filter-btn {
        background: transparent;
        border: 1px solid var(--border);
        padding: 6px 16px;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 500;
        color: var(--ink-soft);
        cursor: pointer;
        transition: all 0.2s;
      }

      .filter-btn:hover {
        border-color: var(--ink-faint);
        color: var(--ink);
      }

      .filter-btn.active {
        background: var(--ink);
        border-color: var(--ink);
        color: white;
      }

      .stories-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .story-card {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 24px;
      }

      .story-cover {
        width: 80px;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
        flex-shrink: 0;
      }

      .story-details {
        flex: 1;
      }

      .story-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .story-header h3 {
        font-family: var(--display);
        font-size: 20px;
        font-weight: 600;
        color: var(--ink);
      }

      .status-badge {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 4px 10px;
        border-radius: 100px;
      }

      .status-badge.published {
        background: rgba(63, 98, 89, 0.1);
        color: var(--forest);
      }
      .status-badge.ongoing {
        background: rgba(185, 139, 50, 0.1);
        color: var(--gold);
      }
      .status-badge.completed {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }
      .status-badge.pending,
      .status-badge.draft {
        background: var(--border-soft);
        color: var(--ink-soft);
      }

      .story-stats {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--ink-soft);
        margin-bottom: 12px;
      }

      .last-updated {
        font-size: 12px;
        color: var(--ink-faint);
      }

      .story-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .btn-action {
        background: transparent;
        border: 1px solid var(--border);
        padding: 8px;
        border-radius: 8px;
        color: var(--ink-soft);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .btn-action.edit {
        padding: 8px 16px;
        gap: 8px;
        font-family: var(--display);
        font-weight: 600;
        font-size: 13px;
        color: var(--ink);
      }

      .btn-action:hover {
        border-color: var(--forest);
        color: var(--forest);
        background: rgba(63, 98, 89, 0.05);
      }

      @media (max-width: 768px) {
        .wrap {
          padding: 0 16px;
        }
        .stats-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .hero-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
        .hero-header button {
          width: 100%;
          justify-content: center;
        }
        .section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
        .filter-tabs {
          overflow-x: auto;
          white-space: nowrap;
          width: 100%;
          padding-bottom: 8px;
        }
        .story-card {
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .story-details {
          width: calc(100% - 96px);
          flex: none;
        }
        .story-stats {
          flex-wrap: wrap;
        }
        .story-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    `,
  ],
})
export class AuthorStudioComponent implements OnInit {
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  api = inject(ApiService);

  myStories: any[] = [];
  isLoading = true;
  currentFilter: 'All' | 'Published' | 'Ongoing' | 'Drafts' = 'All';

  totalReads = 0;
  totalLikes = 0;
  userFollowers = 0;

  ngOnInit() {
    this.userFollowers = this.authService.user()?.followersCount || 0;
    this.fetchStories();
  }

  onCoverError(event: any) {
    event.target.src = this.api.getFallbackCover();
  }

  fetchStories() {
    this.isLoading = true;
    this.bookService.getMyBooks().subscribe({
      next: (books) => {
        this.myStories = books;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch stories', err);
        this.isLoading = false;
      },
    });
  }

  calculateStats() {
    this.totalReads = this.myStories.reduce(
      (sum, book) => sum + (book.views || 0),
      0,
    );
    this.totalLikes = this.myStories.reduce(
      (sum, book) => sum + (book.likesCount || 0),
      0,
    );
  }

  setFilter(filter: 'All' | 'Published' | 'Ongoing' | 'Drafts') {
    this.currentFilter = filter;
  }

  get filteredStories() {
    return this.myStories.filter((story) => {
      if (this.currentFilter === 'All') return true;
      if (this.currentFilter === 'Published')
        return story.status === 'published';
      if (this.currentFilter === 'Ongoing')
        return (
          story.status === 'published' && story.completionStatus !== 'completed'
        );
      if (this.currentFilter === 'Drafts')
        return story.status === 'pending' || story.status === 'draft';
      return true;
    });
  }
}
