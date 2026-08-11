import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ReadingHistory {
  id: string;
  storyId: string;
  title: string;
  author: string;
  cover: string;
  currentChapter: number;
  totalChapters: number;
  progressPercentage: number;
  lastReadDate: string;
}

@Component({
  selector: 'app-my-reading',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="reading-page">
      <div class="hero-section">
        <div class="wrap">
          <h1>My Reading</h1>
          <p>Pick up right where you left off.</p>
        </div>
      </div>
      
      <div class="wrap content-area">
        @if (recentlyRead) {
          <!-- Active Reading Hero Banner -->
          <div class="active-book-banner">
            <div class="banner-bg">
              <img [src]="recentlyRead.cover" [alt]="recentlyRead.title" class="blur-bg">
              <div class="overlay"></div>
            </div>
            
            <div class="banner-content">
              <img [src]="recentlyRead.cover" [alt]="recentlyRead.title" class="active-cover">
              
              <div class="active-info">
                <span class="label">CONTINUE READING</span>
                <h2>{{ recentlyRead.title }}</h2>
                <p class="author">By {{ recentlyRead.author }}</p>
                
                <div class="progress-section">
                  <div class="progress-header">
                    <span>Chapter {{ recentlyRead.currentChapter }} of {{ recentlyRead.totalChapters }}</span>
                    <span class="percentage">{{ recentlyRead.progressPercentage }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="recentlyRead.progressPercentage"></div>
                  </div>
                </div>
                
                <button class="btn-primary" [routerLink]="['/read', recentlyRead.storyId]">
                  Continue Chapter {{ recentlyRead.currentChapter }}
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Reading History List -->
        <div class="history-section">
          <h2>Reading History</h2>
          
          <div class="history-list">
            @for (book of readingHistory; track book.id) {
              <div class="history-card" [routerLink]="['/story', book.storyId]">
                <img [src]="book.cover" [alt]="book.title" class="history-cover">
                
                <div class="history-info">
                  <h3>{{ book.title }}</h3>
                  <p class="history-author">{{ book.author }}</p>
                  <p class="last-read">Last read: {{ book.lastReadDate }}</p>
                  
                  <div class="mini-progress">
                    <div class="mini-bar">
                      <div class="mini-fill" [style.width.%]="book.progressPercentage"></div>
                    </div>
                    <span>{{ book.progressPercentage }}%</span>
                  </div>
                </div>
                
                <button class="btn-resume" [routerLink]="['/read', book.storyId]" (click)="$event.stopPropagation()">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reading-page {
      min-height: calc(100vh - 72px);
      background: var(--paper-warm);
      padding-bottom: 80px;
    }
    
    .hero-section {
      background: var(--card);
      padding: 48px 0;
      text-align: left;
      border-bottom: 1px solid var(--border-soft);
      margin-bottom: 40px;
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
    
    /* Active Book Banner */
    .active-book-banner {
      position: relative;
      border-radius: var(--radius-l);
      overflow: hidden;
      margin-bottom: 48px;
      box-shadow: 0 12px 32px rgba(43, 38, 32, 0.1);
    }
    
    .banner-bg {
      position: absolute;
      inset: 0;
      z-index: 1;
    }
    
    .blur-bg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(40px);
      transform: scale(1.2);
    }
    
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(43, 38, 32, 0.75);
    }
    
    .banner-content {
      position: relative;
      z-index: 2;
      display: flex;
      padding: 40px;
      gap: 40px;
      color: white;
    }
    
    .active-cover {
      width: 200px;
      height: 300px;
      object-fit: cover;
      border-radius: var(--radius-m);
      box-shadow: 0 12px 24px rgba(0,0,0,0.3);
      flex-shrink: 0;
    }
    
    .active-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
    }
    
    .label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--border-soft);
      margin-bottom: 12px;
    }
    
    .active-info h2 {
      font-family: var(--display);
      font-size: 30px;
      font-weight: 700;
      margin-bottom: 8px;
      line-height: 1.1;
    }
    
    .author {
      font-size: 16px;
      color: rgba(255,255,255,0.8);
      margin-bottom: 32px;
    }
    
    .progress-section {
      background: rgba(0,0,0,0.2);
      padding: 20px;
      border-radius: var(--radius-m);
      margin-bottom: 32px;
      max-width: 500px;
    }
    
    .progress-header {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 12px;
    }
    
    .percentage {
      font-family: var(--display);
      font-weight: 700;
      color: var(--border);
    }
    
    .progress-bar {
      height: 6px;
      background: rgba(255,255,255,0.2);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: var(--rose);
      border-radius: 3px;
      transition: width 0.5s ease;
    }
    
    .btn-primary {
      background: var(--forest);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      width: fit-content;
      transition: background 0.2s;
    }
    
    .btn-primary:hover {
      background: var(--forest-deep);
    }
    
    /* History List */
    .history-section h2 {
      font-family: var(--display);
      font-size: 24px;
      margin-bottom: 24px;
      color: var(--ink);
    }
    
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .history-card {
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-m);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 24px;
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.2s;
    }
    
    .history-card:hover {
      background: var(--paper-soft);
      box-shadow: 0 4px 16px rgba(43, 38, 32, 0.05);
    }
    
    .history-cover {
      width: 72px;
      height: 108px;
      object-fit: cover;
      border-radius: 6px;
      flex-shrink: 0;
    }
    
    .history-info {
      flex: 1;
    }
    
    .history-info h3 {
      font-family: var(--display);
      font-size: 18px;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 4px;
    }
    
    .history-author {
      font-size: 14px;
      color: var(--ink-soft);
      margin-bottom: 8px;
    }
    
    .last-read {
      font-size: 12px;
      color: var(--ink-faint);
      margin-bottom: 12px;
    }
    
    .mini-progress {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      font-weight: 600;
      color: var(--forest-deep);
    }
    
    .mini-bar {
      flex: 1;
      max-width: 200px;
      height: 4px;
      background: var(--border-soft);
      border-radius: 2px;
      overflow: hidden;
    }
    
    .mini-fill {
      height: 100%;
      background: var(--forest);
      border-radius: 2px;
    }
    
    .btn-resume {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--paper-warm);
      border: 1px solid var(--border);
      color: var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .history-card:hover .btn-resume {
      background: var(--forest);
      border-color: var(--forest);
      color: white;
    }
    
    @media (max-width: 768px) {
      .banner-content {
        flex-direction: column;
        padding: 24px;
        gap: 24px;
        align-items: center;
        text-align: center;
      }
      .active-info { align-items: center; }
      .btn-primary { width: 100%; }
      .history-card { padding: 12px; gap: 16px; }
      .btn-resume { display: none; }
    }
  `]
})
export class MyReadingComponent {
  
  // Mock data for the hero banner
  recentlyRead: ReadingHistory = {
    id: 'h1',
    storyId: '101',
    title: 'The Neon Shadows',
    author: 'Akira Toriyama',
    cover: 'https://images.unsplash.com/photo-1549488344-c6c748c15664?w=400&q=80',
    currentChapter: 12,
    totalChapters: 40,
    progressPercentage: 30, // (12/40) * 100
    lastReadDate: 'Today, 2:45 PM'
  };

  // Mock data for reading history list
  readingHistory: ReadingHistory[] = [
    {
      id: 'h2',
      storyId: '202',
      title: 'Whispers of the Wind',
      author: 'Elara Vance',
      cover: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=150&q=80',
      currentChapter: 4,
      totalChapters: 20,
      progressPercentage: 20,
      lastReadDate: 'Yesterday, 8:15 PM'
    },
    {
      id: 'h3',
      storyId: '303',
      title: 'A Memory of Light',
      author: 'Robert Jordan',
      cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&q=80',
      currentChapter: 58,
      totalChapters: 60,
      progressPercentage: 96,
      lastReadDate: 'Oct 8, 2026'
    },
    {
      id: 'h4',
      storyId: '404',
      title: 'Crimson Tide',
      author: 'Maya Lin',
      cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&q=80',
      currentChapter: 1,
      totalChapters: 15,
      progressPercentage: 6,
      lastReadDate: 'Oct 5, 2026'
    }
  ];
}
