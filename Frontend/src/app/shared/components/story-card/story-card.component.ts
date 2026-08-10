import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Story {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  views?: string;
  rating?: number;
  isAudio?: boolean;
}

@Component({
  selector: 'app-story-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="story-card group" [routerLink]="['/story', story.id]">
      <div class="cover-wrapper">
        <img [src]="story.cover" [alt]="story.title" class="cover-img" />
        <div class="genre-tag">{{ story.genre }}</div>
        <div class="audio-badge" *ngIf="story.isAudio">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </div>
        <div class="overlay">
          <button class="read-btn">Read Now</button>
        </div>
      </div>
      <div class="story-info">
        <h3 class="title">{{ story.title }}</h3>
        <p class="author">By {{ story.author }}</p>
        <div class="stats" *ngIf="story.views || story.rating">
          <span class="stat" *ngIf="story.views">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {{ story.views }}
          </span>
          <span class="stat" *ngIf="story.rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            {{ story.rating }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .story-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      cursor: pointer;
      width: 100%;
    }
    .cover-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 2 / 3;
      border-radius: var(--radius-m);
      overflow: hidden;
      background: var(--paper-warm);
      box-shadow: 0 4px 14px rgba(43, 38, 32, 0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .story-card:hover .cover-wrapper {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(43, 38, 32, 0.15);
    }
    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .story-card:hover .cover-img {
      transform: scale(1.05);
    }
    .genre-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(43, 38, 32, 0.85);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 100px;
      backdrop-filter: blur(4px);
      z-index: 2;
    }
    .audio-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: var(--gold);
      color: var(--ink);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%);
      opacity: 0;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 20px;
      transition: opacity 0.3s ease;
      z-index: 3;
    }
    .story-card:hover .overlay {
      opacity: 1;
    }
    .read-btn {
      background: var(--gold);
      color: var(--ink);
      border: none;
      padding: 8px 16px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transform: translateY(10px);
      transition: transform 0.3s ease, background 0.2s ease;
    }
    .story-card:hover .read-btn {
      transform: translateY(0);
    }
    .read-btn:hover {
      background: #f0c354;
    }
    .story-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .title {
      font-family: var(--display);
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .author {
      font-size: 13px;
      color: var(--ink-soft);
      font-family: var(--body);
    }
    .stats {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 2px;
    }
    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--ink-faint);
      font-weight: 500;
    }
  `]
})
export class StoryCardComponent {
  @Input() story!: Story;
}
