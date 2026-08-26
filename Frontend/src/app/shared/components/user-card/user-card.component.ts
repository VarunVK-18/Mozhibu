import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  followers: string | number;
  bio?: string;
  isFollowing?: boolean;
}

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeUrlPipe],
  template: `
    <div class="user-card" [routerLink]="['/author', user.id]">
      <img
        [src]="user.avatar | safeUrl"
        (error)="onAvatarError($event)"
        [alt]="user.name"
        class="user-avatar"
        style="object-fit: cover;"
      />
      <h4 class="user-name">{{ user.name }}</h4>
      <div class="user-followers">
        {{ formatFollowers(user.followers) }} followers
      </div>
      <button
        class="follow-btn"
        [class.following]="user.isFollowing"
        (click)="toggleFollow($event)"
      >
        {{ user.isFollowing ? 'Unfollow' : 'Follow' }}
      </button>
    </div>
  `,
  styles: [
    `
      .user-card {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 150px;
        flex-shrink: 0;
        box-sizing: border-box;
        cursor: pointer;
        transition:
          box-shadow 0.15s ease,
          transform 0.15s ease;
      }
      .user-card:hover {
        box-shadow: 0 12px 28px -16px rgba(43, 38, 32, 0.18);
        transform: translateY(-2px);
      }
      .user-avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background-color: var(--forest-tint);
        background-size: cover;
        background-position: center;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--display);
        font-weight: 700;
        font-size: 24px;
        color: var(--forest-deep);
        margin-bottom: 12px;
      }
      .user-name {
        font-family: var(--display);
        font-weight: 600;
        font-size: 15px;
        color: var(--ink);
        margin-bottom: 2px;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-followers {
        font-size: 12px;
        color: var(--ink-soft);
        margin-bottom: 16px;
      }
      .follow-btn {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--border);
        border-radius: 100px;
        padding: 6px 12px;
        font-size: 13px;
        font-weight: 600;
        color: var(--ink);
        cursor: pointer;
        font-family: var(--display);
        transition: all 0.2s ease;
        background: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .follow-btn.following {
        background: var(--forest);
        color: #fff;
        border-color: var(--forest);
      }
      .follow-btn:hover {
        background: var(--forest);
        color: #fff;
        border-color: var(--forest);
      }

      @media (max-width: 768px) {
        .user-card {
          width: 124px;
          padding: 12px;
        }
        .user-avatar {
          width: 56px;
          height: 56px;
          font-size: 20px;
          margin-bottom: 8px;
        }
        .user-name {
          font-size: 13px;
        }
        .user-followers {
          font-size: 11px;
          margin-bottom: 12px;
        }
        .follow-btn {
          padding: 4px 10px;
          font-size: 11px;
        }
      }
    `,
  ],
})
export class UserCardComponent {
  @Input() user!: UserProfile;
  private authService = inject(AuthService);
  private api = inject(ApiService);

  onAvatarError(event: any) {
    event.target.src = this.api.getFallbackAvatar(this.user.name);
  }

  formatFollowers(num: string | number): string {
    if (typeof num === 'string') return num;
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  toggleFollow(event: Event) {
    event.stopPropagation();
    if (!this.authService.user()) {
      alert('Please log in to follow authors.');
      return;
    }

    // Optimistic update for instant feedback
    this.user.isFollowing = !this.user.isFollowing;
    if (typeof this.user.followers === 'number') {
      this.user.followers += this.user.isFollowing ? 1 : -1;
    }

    this.authService.followAuthor(this.user.id).subscribe({
      next: (res) => {
        // Sync with backend if needed
        if (this.user.isFollowing !== res.following) {
          this.user.isFollowing = res.following;
          if (typeof this.user.followers === 'number') {
            this.user.followers += this.user.isFollowing ? 1 : -1;
          }
        }
      },
      error: (err) => {
        console.error('Failed to toggle follow', err);
        // Revert on error
        this.user.isFollowing = !this.user.isFollowing;
        if (typeof this.user.followers === 'number') {
          this.user.followers += this.user.isFollowing ? 1 : -1;
        }
      },
    });
  }
}
