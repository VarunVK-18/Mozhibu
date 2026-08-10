import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  bio?: string;
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
      <div class="user-followers">{{ user.followers }} followers</div>
      <button class="follow-btn">Follow</button>
    </div>
  `,
  styles: [`
    .user-card {
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-m);
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 160px;
      flex-shrink: 0;
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
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      color: var(--ink);
      cursor: pointer;
      font-family: var(--display);
      transition: all 0.2s ease;
      background: none;
    }
    .follow-btn:hover {
      background: var(--forest);
      color: #fff;
      border-color: var(--forest);
    }
  `]
})
export class UserCardComponent {
  @Input() user!: UserProfile;
}
