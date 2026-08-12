import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

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
  imports: [CommonModule],
  template: `
    <div class="user-card">
      <div class="user-avatar" [ngStyle]="{'background-image': 'url(' + user.avatar + ')'}">
        <span *ngIf="!user.avatar">{{ user.name.charAt(0) }}</span>
      </div>
      <h4 class="user-name">{{ user.name }}</h4>
      <div class="user-followers">{{ formatFollowers(user.followers) }} followers</div>
      <button class="follow-btn" [class.following]="user.isFollowing" (click)="toggleFollow()">
        {{ user.isFollowing ? 'Unfollow' : 'Follow' }}
      </button>
    </div>
  `,
  styles: [`
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
      transition: box-shadow .15s ease, transform .15s ease;
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
  `]
})
export class UserCardComponent {
  @Input() user!: UserProfile;
  private authService = inject(AuthService);

  formatFollowers(num: string | number): string {
    if (typeof num === 'string') return num;
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  toggleFollow() {
    if (!this.authService.user()) {
      alert('Please log in to follow authors.');
      return;
    }
    this.authService.followAuthor(this.user.id).subscribe({
      next: (res) => {
        this.user.isFollowing = res.following;
        // Optionally update follower count visually
        if (typeof this.user.followers === 'number') {
          this.user.followers += res.following ? 1 : -1;
        }
      },
      error: (err) => {
        console.error('Failed to toggle follow', err);
      }
    });
  }
}
