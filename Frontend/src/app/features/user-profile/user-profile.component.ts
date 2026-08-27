import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  AuthorService,
  AuthorProfile,
} from '../../core/services/author.service';
import { ApiService } from '../../core/services/api.service';
import { finalize } from 'rxjs/operators';
import { StoryCardComponent } from '../../shared/components/story-card/story-card.component';
import { UserCardComponent } from '../../shared/components/user-card/user-card.component';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, StoryCardComponent, UserCardComponent, SafeUrlPipe],
  template: `
    <div class="profile-layout">
      <!-- Profile Banner -->
      <div class="profile-banner">
        <div class="profile-header">
          <img
            [src]="getAvatarUrl(user()?.avatar, user()?.username) | safeUrl"
            alt="User avatar"
            class="author-avatar"
            (error)="onAvatarError($event, user()?.username)"
          />
          <div class="author-info">
            <h1 class="author-name">{{ user()?.username }}</h1>
            <div class="author-meta">
              <span
                class="meta-item"
                *ngIf="
                  user()?.role === 'writer' || user()?.role === 'superadmin'
                "
              >
                <strong>{{ followersCount() }}</strong> Followers
              </span>
              <span
                class="meta-item"
                *ngIf="
                  user()?.role !== 'writer' && user()?.role !== 'superadmin'
                "
              >
                Reader
              </span>
              <span class="meta-separator">•</span>
              <span class="meta-item">
                <strong>{{ following().length }}</strong> Following
              </span>
            </div>

            <div class="author-bio">
              <p>{{ user()?.bio || "This user hasn't written a bio yet." }}</p>
            </div>
          </div>

          <div class="author-actions">
            <button
              class="btn-outline"
              routerLink="/settings"
              [queryParams]="{ tab: 'profile' }"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="profile-nav-wrapper">
        <nav class="profile-tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'published'"
            (click)="activeTab.set('published')"
          >
            Published Contents ({{ publishedStories().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'following'"
            (click)="activeTab.set('following')"
          >
            Following ({{ following().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'followers'"
            (click)="activeTab.set('followers')"
          >
            Followers ({{ followers().length }})
          </button>
        </nav>
      </div>

      <div class="profile-content">
        @if (isLoading()) {
          <div class="results-grid">
            <div class="skeleton-card" *ngFor="let i of [1, 2, 3, 4, 5, 6]">
              <div class="skeleton skeleton-cover"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
          </div>
        } @else {
          <!-- PUBLISHED CONTENTS -->
          <div *ngIf="activeTab() === 'published'" class="tab-pane">
            @if (user()?.role === 'writer' || user()?.role === 'superadmin') {
              @if (publishedStories().length > 0) {
                <div class="results-grid">
                  @for (item of publishedStories(); track item._id) {
                    <app-story-card [story]="item"></app-story-card>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <p>You haven't published any stories yet.</p>
                  <button class="btn-primary" routerLink="/write">
                    Start Writing
                  </button>
                </div>
              }
            } @else {
              <div class="empty-state author-promo">
                <h3>Want to publish your own stories?</h3>
                <p>
                  Join our growing community of authors and share your world.
                </p>
                <button
                  class="btn-primary"
                  (click)="requestAuthorStatus()"
                  [disabled]="authorStatus() === 'pending'"
                >
                  {{
                    authorStatus() === 'pending'
                      ? 'Request Pending'
                      : 'Become an Author'
                  }}
                </button>
              </div>
            }
          </div>


          <!-- FOLLOWING -->
          <div *ngIf="activeTab() === 'following'" class="tab-pane">
            @if (following().length > 0) {
              <div class="results-grid">
                @for (author of following(); track author.id) {
                  <app-user-card [user]="author"></app-user-card>
                }
              </div>
            } @else {
              <div class="empty-state">
                <p>
                  You aren't following anyone yet. Follow authors you love to
                  get notified when they publish new stories.
                </p>
                <button
                  class="btn-primary"
                  [routerLink]="['/search']"
                  [queryParams]="{ type: 'authors' }"
                >
                  Find Authors
                </button>
              </div>
            }
          </div>

          <!-- FOLLOWERS -->
          <div *ngIf="activeTab() === 'followers'" class="tab-pane">
            @if (followers().length > 0) {
              <div class="results-grid">
                @for (follower of followers(); track follower.id) {
                  <app-user-card [user]="follower"></app-user-card>
                }
              </div>
            } @else {
              <div class="empty-state">
                <p>
                  You don't have any followers yet. Keep writing and sharing
                  your stories to grow your audience!
                </p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .profile-layout {
        min-height: calc(100vh - 73px);
        background: var(--paper);
      }
      .profile-banner {
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        padding: 64px 48px 32px;
      }
      .profile-header {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        gap: 32px;
        align-items: flex-start;
      }

      .author-avatar {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid var(--surface);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        flex-shrink: 0;
      }
      .author-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 8px;
        text-align: left;
      }
      .author-name {
        font-family: var(--display);
        font-size: 32px;
        font-weight: 700;
        color: var(--ink);
        margin: 0;
      }
      .author-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        color: var(--ink-soft);
        margin: 0;
      }
      .meta-separator {
        color: var(--border-deep);
      }
      .author-bio {
        margin: 0;
      }
      .author-bio p {
        font-size: 16px;
        line-height: 1.6;
        color: var(--ink-soft);
        margin: 0;
        text-align: left;
      }

      .author-actions {
        flex-shrink: 0;
        align-self: flex-start;
      }

      .profile-nav-wrapper {
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        padding: 0 48px;
      }
      .profile-tabs {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        gap: 32px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .profile-tabs::-webkit-scrollbar {
        display: none;
      }

      .tab-btn {
        padding: 16px 0;
        font-family: var(--display);
        font-size: 16px;
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

      .profile-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 48px;
      }

      .btn-primary {
        background: var(--forest);
        color: white;
        border: none;
        padding: 12px 32px;
        border-radius: 100px;
        font-family: var(--display);
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-primary:hover {
        background: var(--forest-deep);
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-outline {
        background: transparent;
        color: var(--forest);
        border: 1px solid var(--forest);
        padding: 12px 32px;
        border-radius: 100px;
        font-family: var(--display);
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-outline:hover {
        border-color: var(--rose);
        color: var(--rose);
      }

      .loading-state,
      .empty-state {
        text-align: center;
        padding: 64px 20px;
        color: var(--ink-soft);
      }
      .empty-state p {
        margin-bottom: 24px;
        font-size: 16px;
      }
      .author-promo {
        background: var(--card);
        border-radius: 16px;
        border: 1px dashed var(--border);
      }
      .author-promo h3 {
        font-family: var(--display);
        font-size: 20px;
        color: var(--ink);
        margin-bottom: 12px;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 32px 24px;
      }

      .book-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .book-card:hover {
        transform: translateY(-4px);
      }
      .cover-wrapper {
        position: relative;
        width: 100%;
        aspect-ratio: 2 / 3;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .book-cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .status-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        color: white;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
      }
      .status-badge.completed {
        background: var(--forest);
      }
      .book-info h4 {
        font-family: var(--display);
        font-size: 16px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 4px;
      }
      .book-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--ink-soft);
      }

      .history-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 20px;
      }
      .history-card-clean {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: 16px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 20px;
        cursor: pointer;
        transition:
          box-shadow 0.2s,
          transform 0.2s;
      }
      .history-card-clean:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
        transform: translateY(-2px);
      }
      .history-cover {
        width: 70px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        background: #e0e0e0;
      }
      .history-info {
        flex: 1;
        overflow: hidden;
      }
      .history-info h3 {
        font-family: var(--display);
        font-size: 17px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .history-author {
        font-size: 13px;
        color: var(--ink-soft);
        margin-bottom: 12px;
      }
      .mini-progress-container {
        margin-bottom: 8px;
      }
      .mini-bar {
        width: 100%;
        height: 4px;
        background: var(--border-soft);
        border-radius: 2px;
        overflow: hidden;
      }
      .mini-fill {
        height: 100%;
        background: #5e5e5e;
        border-radius: 2px;
      }
      .last-read {
        font-size: 12px;
        color: var(--ink-faint);
      }

      .authors-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
      }
      .author-card {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: box-shadow 0.2s;
      }
      .author-card:hover {
        box-shadow: 0 4px 16px rgba(43, 38, 32, 0.05);
      }
      .author-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .author-avatar-sm {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        object-fit: cover;
      }
      .author-info h3 {
        font-family: var(--display);
        font-size: 16px;
        font-weight: 600;
        color: var(--ink);
        margin-bottom: 4px;
      }
      .author-info p {
        font-size: 13px;
        color: var(--ink-soft);
      }

      @media (max-width: 768px) {
        .profile-header {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .author-meta {
          justify-content: center;
        }
        .profile-banner {
          padding: 48px 24px 24px;
        }
        .author-avatar {
          width: 120px;
          height: 120px;
        }
        .profile-content {
          padding: 32px 16px;
        }
        .history-list {
          grid-template-columns: 1fr;
        }
        .authors-list {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .profile-header {
          flex-direction: column;
          text-align: center;
          gap: 16px;
        }
        .author-actions {
          margin-left: 0;
          margin-top: 16px;
        }
        .profile-tabs {
          overflow-x: auto;
          white-space: nowrap;
          justify-content: flex-start;
          padding-bottom: 8px;
        }
        .profile-content {
          padding: 24px 16px;
        }
        .results-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .history-list {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .author-avatar {
          width: 96px;
          height: 96px;
        }
      }
    `,
  ],
})
export class UserProfileComponent implements OnInit {
  authService = inject(AuthService);
  private authorService = inject(AuthorService);
  api = inject(ApiService);
  private http = inject(HttpClient);
  user = this.authService.user;
  authorStatus = signal<string>('');

  activeTab = signal<
    | 'published'
    | 'following'
    | 'followers'
  >('published');
  isLoading = signal<boolean>(true);

  publishedStories = signal<any[]>([]);
  followersCount = signal<number>(0);
  following = signal<any[]>([]);
  followers = signal<any[]>([]);

  ngOnInit() {
    this.authorStatus.set(this.user()?.authorStatus || '');
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading.set(true);
    let completedReqs = 0;
    const totalReqs = 3;
    const checkDone = () => {
      completedReqs++;
      if (completedReqs >= totalReqs) {
        this.isLoading.set(false);
      }
    };

    // 1. Load Published Stories if Author
    if (this.user()?.role === 'writer' || this.user()?.role === 'superadmin') {
      this.authorService.getAuthorProfile(this.user()!.id).subscribe({
        next: (profile) => {
          const allBooks = profile.books || [];
          this.publishedStories.set(allBooks.filter((b) => !b.competitionTag));
          this.followersCount.set(profile.author.followersCount || 0);
          checkDone();
        },
        error: () => checkDone(),
      });
    } else {
      checkDone();
    }

    // 2. Load Following
    this.authService.getFollowing().subscribe({
      next: (authors: any[]) => {
        const currentUser = this.authService.user();
        this.following.set(
          authors
            .filter(
              (a) =>
                a._id !== (currentUser as any)?._id &&
                a._id !== currentUser?.id &&
                a.username !== currentUser?.username,
            )
            .map((a) => ({
              id: a._id,
              name: a.username,
              avatar: this.getAvatarUrl(a.avatar, a.username),
              followers: (a.followersCount / 1000).toFixed(1) + 'K',
            })),
        );
        checkDone();
      },
      error: () => checkDone(),
    });

    // 5. Load Followers
    this.authService.getFollowers().subscribe({
      next: (followers: any[]) => {
        const currentUser = this.authService.user();
        this.followers.set(
          followers
            .filter(
              (a) =>
                a._id !== (currentUser as any)?._id &&
                a._id !== currentUser?.id &&
                a.username !== currentUser?.username,
            )
            .map((a) => ({
              id: a._id,
              name: a.username,
              avatar: this.getAvatarUrl(a.avatar, a.username),
              followers: (a.followersCount / 1000).toFixed(1) + 'K',
            })),
        );
        checkDone();
      },
      error: () => checkDone(),
    });
  }

  requestAuthorStatus() {
    this.http.put('/api/users/upgrade-role', {}).subscribe({
      next: (res: any) => {
        if (res.user) {
          this.authorStatus.set(res.user.authorStatus || 'pending');
          this.authService.user.set({
            ...this.authService.user()!,
            ...res.user,
          });
        }
      },
      error: (err) => console.error(err),
    });
  }

  getAvatarUrl(path: string | undefined, name?: string): string {
    if (!path) return this.api.getFallbackAvatar(name);
    return this.api.getImageUrl(path);
  }

  onAvatarError(event: any, name?: string) {
    event.target.src = this.api.getFallbackAvatar(name);
  }

  onCoverError(event: any) {
    event.target.src = this.api.getFallbackCover();
  }

  getCoverUrl(path: string | undefined): string {
    if (!path) return this.api.getFallbackCover();
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return this.api.getImageUrl(path);
  }
}
