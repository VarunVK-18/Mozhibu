import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  AuthorService,
  AuthorProfile,
} from '../../core/services/author.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-author-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-layout">
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading profile...</p>
        </div>
      } @else if (profile) {
        <!-- Profile Banner -->
        <div class="profile-banner">
            <div class="profile-header">
              <div class="avatar-ring premium-container" [class.premium-ring]="profile.author.isPremium">
                <img
                  [src]="
                    getAvatarUrl(profile.author.avatar, profile.author.username)
                  "
                  alt="Author avatar"
                  class="author-avatar"
                  (error)="onAvatarError($event, profile.author.username)"
                  (click)="toggleBigAvatar()"
                  style="cursor: pointer;"
                />
              </div>
              <div class="author-info">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h1 class="author-name">{{ profile.author.username }}</h1>
                  <span *ngIf="profile.author.isPremium" class="pro-badge" style="font-size: 12px; padding: 3px 8px;">PRO</span>
                </div>
              <div class="author-meta">
                <span class="meta-item">
                  <strong>{{ profile.author.followersCount }}</strong> Followers
                </span>
                <span class="meta-separator">•</span>
                <span class="meta-item">
                  Joined {{ profile.author.createdAt | date: 'mediumDate' }}
                </span>
              </div>

              <div class="author-bio">
                <p>
                  {{
                    profile.author.bio ||
                      "This author hasn't written a bio yet."
                  }}
                </p>
              </div>
            </div>

            <div class="author-actions">
              @if (isCurrentUser()) {
                <button class="btn-outline">Edit Profile</button>
              } @else {
                <button class="btn-primary" (click)="toggleFollow()">
                  {{ isFollowing ? 'Unfollow' : 'Follow' }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Profile Content Tabs -->
        <div class="profile-content">
          <div class="profile-tabs">
            <button class="tab-btn" [class.active]="activeTab === 'stories'" (click)="setTab('stories')">Published Stories</button>
            <button class="tab-btn" [class.active]="activeTab === 'followers'" (click)="setTab('followers')">Followers ({{ profile.author.followersCount }})</button>
            <button class="tab-btn" [class.active]="activeTab === 'following'" (click)="setTab('following')">Following</button>
            <button class="tab-btn" [class.active]="activeTab === 'reviews'" (click)="setTab('reviews')">Reviews</button>
          </div>

          @if (activeTab === 'stories') {
            @if (profile.books.length === 0) {
              <div class="empty-state">
                <p>This author hasn't published any stories yet.</p>
              </div>
            } @else {
              <div class="results-grid">
                @for (item of profile.books; track item._id) {
                  <div class="book-card" [routerLink]="['/story', item._id]">
                    <div class="cover-wrapper">
                      <img
                        [src]="getCoverUrl(item.cover)"
                        alt="Book cover"
                        class="book-cover"
                        (error)="onCoverError($event)"
                      />
                      @if (item.completionStatus === 'completed') {
                        <span class="status-badge completed">Completed</span>
                      } @else {
                        <span class="status-badge ongoing">Ongoing</span>
                      }
                    </div>
                    <div class="book-info">
                      <h4 class="book-title">{{ item.title }}</h4>
                      <div class="book-meta">
                        <span class="meta-item">
                          <svg
                            viewBox="0 0 24 24"
                            width="12"
                            height="12"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                            ></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          {{ item.views || 0 }}
                        </span>
                        <span class="meta-item">
                          <svg
                            viewBox="0 0 24 24"
                            width="12"
                            height="12"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                            ></path>
                          </svg>
                          {{ item.likesCount || 0 }}
                        </span>
                        <span class="genre-badge">{{ item.genre }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          }

          @if (activeTab === 'followers') {
            @if (isLoadingFollowers) {
              <div class="loading-state"><div class="spinner"></div></div>
            } @else if (followersList.length === 0) {
              <div class="empty-state"><p>No followers yet.</p></div>
            } @else {
              <div class="users-grid">
                @for (user of followersList; track user._id) {
                  <div class="user-card" [routerLink]="['/author', user._id]">
                    <div class="avatar-ring premium-container" [class.premium-ring]="user.isPremium">
                      <img [src]="getAvatarUrl(user.avatar, user.username)" class="user-avatar" (error)="onAvatarError($event, user.username)" />
                    </div>
                    <div class="user-info">
                      <h4 class="user-name">
                        {{ user.username }}
                        <span *ngIf="user.isPremium" class="pro-badge" style="font-size: 9px; padding: 2px 4px; margin-left: 4px;">PRO</span>
                      </h4>
                      <p class="user-meta">{{ user.followersCount || 0 }} Followers</p>
                    </div>
                  </div>
                }
              </div>
            }
          }

          @if (activeTab === 'following') {
            @if (isLoadingFollowing) {
              <div class="loading-state"><div class="spinner"></div></div>
            } @else if (followingList.length === 0) {
              <div class="empty-state"><p>Not following anyone yet.</p></div>
            } @else {
              <div class="users-grid">
                @for (user of followingList; track user._id) {
                  <div class="user-card" [routerLink]="['/author', user._id]">
                    <div class="avatar-ring premium-container" [class.premium-ring]="user.isPremium">
                      <img [src]="getAvatarUrl(user.avatar, user.username)" class="user-avatar" (error)="onAvatarError($event, user.username)" />
                    </div>
                    <div class="user-info">
                      <h4 class="user-name">
                        {{ user.username }}
                        <span *ngIf="user.isPremium" class="pro-badge" style="font-size: 9px; padding: 2px 4px; margin-left: 4px;">PRO</span>
                      </h4>
                      <p class="user-meta">{{ user.followersCount || 0 }} Followers</p>
                    </div>
                  </div>
                }
              </div>
            }
          }

          @if (activeTab === 'reviews') {
            @if (isLoadingReviews) {
              <div class="loading-state"><div class="spinner"></div></div>
            } @else if (reviewsList.length === 0) {
              <div class="empty-state"><p>No reviews written yet.</p></div>
            } @else {
              <div class="reviews-list">
                @for (review of reviewsList; track review._id) {
                  <div class="review-card">
                    <div class="review-header">
                      <div class="reviewer-info" [routerLink]="['/author', review.user._id]" style="cursor: pointer;">
                        <img [src]="getAvatarUrl(review.user.avatar, review.user.username)" class="reviewer-avatar" (error)="onAvatarError($event, review.user.username)" />
                        <div>
                          <h4 class="reviewer-name">
                            {{ review.user.username }}
                            <span *ngIf="review.user.isPremium" class="pro-badge" style="font-size: 9px; padding: 2px 4px; margin-left: 6px;">PRO</span>
                          </h4>
                          <p class="review-date">{{ review.createdAt | date:'longDate' }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="review-body">
                      @if (review.rating > 0) {
                        <div class="star-rating">
                          @for (star of [1,2,3,4,5]; track star) {
                            <span class="star" [class.filled]="star <= review.rating">★</span>
                          }
                        </div>
                      }
                      @if (review.text) {
                        <p class="review-text">"{{ review.text }}"</p>
                      }
                    </div>

                    <div class="reviewed-book" [routerLink]="['/story', review.book._id]" style="cursor: pointer;">
                      <img [src]="getCoverUrl(review.book.cover)" class="mini-cover" (error)="onCoverError($event)" />
                      <div>
                        <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 2px;">Reviewed on</span>
                        <span class="book-title-mini">{{ review.book.title }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          }
        </div>
      } @else {
        <div class="empty-state" style="margin-top: 100px;">
          <div class="empty-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
              <line x1="18" y1="8" x2="23" y2="13"></line>
              <line x1="23" y1="8" x2="18" y2="13"></line>
            </svg>
          </div>
          <h2>User Not Found</h2>
          <p>This profile does not exist or may have been removed.</p>
          <button class="btn-primary" routerLink="/">Return Home</button>
        </div>
      }

      <!-- Enlarged Avatar Modal -->
      @if (showBigAvatar && profile) {
        <div class="avatar-modal-overlay" (click)="toggleBigAvatar()">
          <div class="avatar-modal-content" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="toggleBigAvatar()">×</button>
            <img
              [src]="getAvatarUrl(profile.author.avatar, profile.author.username)"
              alt="Author avatar enlarged"
              class="avatar-large"
              (error)="onAvatarError($event, profile.author.username)"
            />
          </div>
        </div>
      }
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
        padding: 64px 48px;
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
        transition: transform 0.2s;
      }
      .author-avatar:hover {
        transform: scale(1.05);
      }

      .avatar-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
        animation: fadeIn 0.2s ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .avatar-modal-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
      }
      .avatar-large {
        width: 400px;
        height: 400px;
        object-fit: cover;
        border-radius: 50%;
        border: 4px solid var(--surface);
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      }
      .close-btn {
        position: absolute;
        top: -20px;
        right: -40px;
        background: transparent;
        color: white;
        border: none;
        font-size: 36px;
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .avatar-large {
          width: 300px;
          height: 300px;
        }
        .close-btn {
          right: 0;
          top: -40px;
        }
      }

      .author-info {
        flex: 1;
      }

      .author-name {
        font-family: var(--display);
        font-size: 32px;
        font-weight: 700;
        color: var(--ink);
        margin: 0 0 12px;
      }

      .author-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        color: var(--ink-soft);
        margin-bottom: 20px;
      }

      .meta-separator {
        color: var(--border-deep);
      }

      .author-bio {
        font-size: 16px;
        line-height: 1.6;
        color: var(--ink-soft);
        max-width: 600px;
      }

      .author-actions {
        flex-shrink: 0;
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

      .profile-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 48px;
      }

      .profile-tabs {
        display: flex;
        gap: 24px;
        border-bottom: 1px solid var(--border);
        margin-bottom: 32px;
        overflow-x: auto;
      }
      .tab-btn {
        background: transparent;
        border: none;
        padding: 0 0 16px;
        font-family: var(--display);
        font-size: 18px;
        font-weight: 600;
        color: var(--ink-soft);
        cursor: pointer;
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .tab-btn:hover {
        color: var(--ink);
      }
      .tab-btn.active {
        color: var(--forest);
        border-bottom-color: var(--forest);
      }

      .users-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 24px;
      }
      .user-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
      }
      .user-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        border-color: #d1d5db;
      }
      .user-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
      }
      .user-name {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 600;
        color: var(--ink);
        display: flex;
        align-items: center;
      }
      .user-meta {
        margin: 0;
        font-size: 13px;
        color: var(--ink-soft);
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 32px 24px;
      }

      /* Reviews List Styles */
      .reviews-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 24px;
        align-items: start;
      }
      .review-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .review-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
        border-color: #d1d5db;
      }
      .review-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .reviewer-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .reviewer-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .reviewer-name {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 700;
        color: var(--ink);
        display: flex;
        align-items: center;
      }
      .review-date {
        margin: 0;
        font-size: 12px;
        font-weight: 500;
        color: var(--ink-faint);
      }
      .reviewed-book {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #f9fafb;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        transition: background 0.2s;
        margin-top: 8px;
      }
      .reviewed-book:hover {
        background: #f3f4f6;
      }
      .mini-cover {
        width: 32px;
        height: 48px;
        border-radius: 6px;
        object-fit: cover;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .book-title-mini {
        font-size: 14px;
        font-weight: 600;
        color: var(--ink);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .review-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .star-rating {
        display: flex;
        gap: 4px;
      }
      .star {
        color: #e5e7eb;
        font-size: 18px;
      }
      .star.filled {
        color: #f59e0b;
      }
      .review-text {
        margin: 0;
        font-size: 15px;
        line-height: 1.6;
        color: #4b5563;
        white-space: pre-wrap;
        font-style: italic;
        position: relative;
        padding-left: 12px;
        border-left: 3px solid #e5e7eb;
      }

      /* Book Card Reuse */
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
        backdrop-filter: blur(4px);
      }

      .status-badge.completed {
        background: rgba(16, 185, 129, 0.85);
      }
      .status-badge.ongoing {
        background: rgba(59, 130, 246, 0.85);
      }

      .book-title {
        font-family: var(--display);
        font-size: 16px;
        font-weight: 700;
        color: var(--ink);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .book-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 4px;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--ink-faint);
      }

      .genre-badge {
        font-size: 11px;
        padding: 2px 6px;
        background: var(--paper-soft);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--ink-soft);
        margin-left: auto;
      }

      .loading-state,
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 0;
        color: var(--ink-soft);
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(63, 98, 89, 0.1);
        border-radius: 50%;
        border-top-color: var(--forest);
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 16px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 768px) {
        .profile-header {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .author-actions {
          width: 100%;
          margin-top: 16px;
        }
        .author-actions button {
          width: 100%;
        }
        .profile-content {
          padding: 24px;
        }
      }
    `,
  ],
})
export class AuthorProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authorService = inject(AuthorService);
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmService);
  api = inject(ApiService);

  profile: AuthorProfile | null = null;
  isLoading = true;
  isFollowing = false;
  showBigAvatar = false;

  activeTab: 'stories' | 'followers' | 'following' | 'reviews' = 'stories';
  followersList: any[] = [];
  followingList: any[] = [];
  reviewsList: any[] = [];
  isLoadingFollowers = false;
  isLoadingFollowing = false;
  isLoadingReviews = false;
  followersLoaded = false;
  followingLoaded = false;
  reviewsLoaded = false;

  toggleBigAvatar() {
    this.showBigAvatar = !this.showBigAvatar;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.activeTab = 'stories';
        this.followersLoaded = false;
        this.followingLoaded = false;
        this.reviewsLoaded = false;
        this.fetchProfile(id);
      }
    });
  }

  setTab(tab: 'stories' | 'followers' | 'following' | 'reviews') {
    this.activeTab = tab;
    if (tab === 'followers' && !this.followersLoaded && this.profile) {
      this.loadFollowers();
    }
    if (tab === 'following' && !this.followingLoaded && this.profile) {
      this.loadFollowing();
    }
    if (tab === 'reviews' && !this.reviewsLoaded && this.profile) {
      this.loadReviews();
    }
  }

  loadFollowers() {
    if (!this.profile) return;
    this.isLoadingFollowers = true;
    this.authorService.getAuthorFollowers(this.profile.author._id).subscribe({
      next: (res) => {
        this.followersList = res;
        this.isLoadingFollowers = false;
        this.followersLoaded = true;
      },
      error: (err) => {
        console.error('Failed to load followers', err);
        this.isLoadingFollowers = false;
      }
    });
  }

  loadFollowing() {
    if (!this.profile) return;
    this.isLoadingFollowing = true;
    this.authorService.getAuthorFollowing(this.profile.author._id).subscribe({
      next: (res) => {
        this.followingList = res;
        this.isLoadingFollowing = false;
        this.followingLoaded = true;
      },
      error: (err) => {
        console.error('Failed to load following', err);
        this.isLoadingFollowing = false;
      }
    });
  }

  loadReviews() {
    if (!this.profile) return;
    this.isLoadingReviews = true;
    this.authorService.getAuthorReviews(this.profile.author._id).subscribe({
      next: (res) => {
        this.reviewsList = res;
        this.isLoadingReviews = false;
        this.reviewsLoaded = true;
      },
      error: (err) => {
        console.error('Failed to load reviews', err);
        this.isLoadingReviews = false;
      }
    });
  }

  fetchProfile(id: string) {
    this.isLoading = true;
    this.authorService.getAuthorProfile(id).subscribe({
      next: (res) => {
        this.profile = res;
        this.isLoading = false;
        this.checkIfFollowing();
      },
      error: (err) => {
        console.error('Failed to fetch author profile', err);
        this.isLoading = false;
      },
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

  getCoverUrl(cover: string | undefined): string {
    if (!cover) return this.api.getFallbackCover();
    return this.api.getImageUrl(cover);
  }

  isCurrentUser(): boolean {
    const user = this.authService.user();
    return !!(user && this.profile && user.id === this.profile.author._id);
  }

  checkIfFollowing() {
    const user = this.authService.user();
    if (!user || !this.profile) return;

    this.authService.getFollowing().subscribe({
      next: (following) => {
        this.isFollowing = following.some((f: any) => f._id === this.profile!.author._id);
      },
      error: (err) => {
        console.error('Failed to check following status', err);
        this.isFollowing = false;
      }
    });
  }

  toggleFollow() {
    if (!this.authService.user()) {
      this.confirmService.confirm('Note', 'Please log in to follow authors.', false, 'OK', '').subscribe();
      return;
    }

    if (this.profile) {
      // Optimistic update for instant feedback
      this.isFollowing = !this.isFollowing;
      this.profile.author.followersCount += this.isFollowing ? 1 : -1;

      this.authorService.followAuthor(this.profile.author._id).subscribe({
        next: (res: any) => {
          // Sync with backend if needed
          if (this.isFollowing !== res.following) {
            this.isFollowing = res.following;
            this.profile!.author.followersCount += this.isFollowing ? 1 : -1;
          }
        },
        error: (err) => {
          console.error('Failed to toggle follow', err);
          // Revert on error
          this.isFollowing = !this.isFollowing;
          this.profile!.author.followersCount += this.isFollowing ? 1 : -1;
          this.confirmService.confirm('Note', err.error?.msg || 'Failed to follow author', false, 'OK', '').subscribe();
        },
      });
    }
  }
}
