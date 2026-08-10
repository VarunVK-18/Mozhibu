import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  type: 'update' | 'event' | 'news';
}

@Component({
  selector: 'app-announcement-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="announcement-card">
      <div class="card-header">
        <span class="type-badge" [ngClass]="announcement.type">{{ announcement.type }}</span>
        <span class="date">{{ announcement.date }}</span>
      </div>
      <h4 class="title">{{ announcement.title }}</h4>
      <p class="content">{{ announcement.content }}</p>
      <button class="read-more">Read More →</button>
    </div>
  `,
  styles: [`
    .announcement-card {
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-m);
      padding: 24px;
      width: 300px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      transition: box-shadow .15s ease, transform .15s ease;
    }
    .announcement-card:hover {
      box-shadow: 0 12px 28px -16px rgba(43, 38, 32, 0.18);
      transform: translateY(-2px);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .type-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 100px;
    }
    .type-badge.update { background: var(--forest-tint); color: var(--forest-deep); }
    .type-badge.event { background: var(--rose-tint); color: var(--rose); }
    .type-badge.news { background: #E0E7FF; color: #3730A3; }
    
    .date {
      font-size: 12px;
      color: var(--ink-faint);
    }
    .title {
      font-family: var(--display);
      font-weight: 700;
      font-size: 18px;
      color: var(--ink);
      margin-bottom: 8px;
      line-height: 1.3;
    }
    .content {
      font-size: 13.5px;
      color: var(--ink-soft);
      line-height: 1.6;
      margin-bottom: 20px;
      flex-grow: 1;
    }
    .read-more {
      align-self: flex-start;
      font-family: var(--display);
      font-weight: 600;
      font-size: 13px;
      color: var(--forest);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;
    }
    .read-more:hover {
      color: var(--gold);
    }
  `]
})
export class AnnouncementCardComponent {
  @Input() announcement!: Announcement;
}
