import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { finalize } from 'rxjs/operators';

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
      <div class="wrap">
        <div class="page-header">
          <h1>My Reading</h1>
          <p>Pick up right where you left off.</p>
        </div>
      </div>
      
      <div class="wrap content-area">
        @if (isLoading()) {
          <div class="loading-state">Loading your reading history...</div>
        } @else {
          @if (recentlyRead()) {
            <!-- Active Reading Simplified Banner -->
            <div class="active-book-banner-clean">
              <div class="banner-content">
                <img [src]="recentlyRead()!.cover" [alt]="recentlyRead()!.title" class="active-cover">
                
                <div class="active-info-card">
                  <span class="label">CONTINUE READING</span>
                  <h2>{{ recentlyRead()!.title }}</h2>
                  <p class="author">By {{ recentlyRead()!.author }}</p>
                  
                  <div class="progress-section">
                    <div class="progress-header">
                      <span>Chapter {{ recentlyRead()!.currentChapter }} of {{ recentlyRead()!.totalChapters }}</span>
                      <span class="percentage">{{ recentlyRead()!.progressPercentage }}%</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="recentlyRead()!.progressPercentage"></div>
                    </div>
                  </div>
                  
                  <button class="btn-continue" [routerLink]="['/read', recentlyRead()!.storyId]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="margin-right: 8px;">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Continue Chapter {{ recentlyRead()!.currentChapter }}
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Clean Reading History List -->
          <div class="history-section">
            <h2>Reading History</h2>
            
            @if (readingHistory().length > 0) {
              <div class="history-list">
                @for (book of readingHistory(); track book.id) {
                  <div class="history-card-clean" [routerLink]="['/story', book.storyId]">
                    <img [src]="book.cover" [alt]="book.title" class="history-cover">
                    
                    <div class="history-info">
                      <h3>{{ book.title }}</h3>
                      <p class="history-author">By {{ book.author }}</p>
                      
                      <div class="mini-progress-container">
                        <div class="mini-bar">
                          <div class="mini-fill" [style.width.%]="book.progressPercentage"></div>
                        </div>
                      </div>
                      <p class="last-read">Last read: {{ book.lastReadDate }}</p>
                    </div>
                    
                    <div class="history-actions">
                      <button class="btn-icon" [routerLink]="['/read', book.storyId]" (click)="$event.stopPropagation()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                <p>You haven't read any books yet. Head over to the discovery page to start exploring!</p>
                <button class="btn-continue" routerLink="/">Discover Books</button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .reading-page {
      min-height: calc(100vh - 72px);
      background: var(--paper);
      padding-bottom: 80px;
    }
    
    /* ──────────────────────────────────────────
       PREMIUM CLEAN HERO
       ────────────────────────────────────────── */
    .page-header {
      padding: 64px 0 48px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      border-bottom: 1px solid var(--border-soft);
      margin-bottom: 48px;
    }
    
    .page-header h1 {
      font-family: var(--display);
      font-size: 48px;
      font-weight: 800;
      color: var(--ink);
      margin-bottom: 12px;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    
    .page-header p {
      font-size: 18px;
      color: var(--ink-soft);
      max-width: 500px;
      line-height: 1.5;
    }
    
    /* ──────────────────────────────────────────
       CLEAN ACTIVE BOOK BANNER (MOCKUP STYLE)
       ────────────────────────────────────────── */
    .active-book-banner-clean {
      background: #5E5E5E; /* Dark grey background */
      border-radius: 20px;
      margin-bottom: 56px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      max-width: 900px; /* Keep it from stretching too wide */
    }
    
    .banner-content {
      display: flex;
      padding: 24px;
      gap: 24px;
      align-items: stretch;
    }
    
    .active-cover {
      width: 140px; /* Much smaller, minimal cover */
      height: 210px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
      flex-shrink: 0;
      background: #444; /* Fallback color */
    }
    
    .active-info-card {
      background: rgba(255, 255, 255, 0.06); 
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 24px 32px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    
    .active-info-card h2 {
      font-family: var(--display);
      font-size: 24px; /* More minimal font size */
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    
    .author {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 24px;
    }
    
    .progress-section {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      max-width: 400px;
    }
    
    .progress-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: white;
      margin-bottom: 8px;
    }
    
    .percentage {
      font-family: var(--display);
      font-weight: 700;
    }
    
    .progress-bar {
      height: 4px; /* Slimmer progress bar */
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #F08080, #FFB6C1); /* Soft pink gradient */
      border-radius: 2px;
      transition: width 0.5s ease;
    }
    
    .btn-continue {
      background: #2D4A43; /* Forest green */
      color: white;
      border: none;
      padding: 10px 20px; /* Slimmer button */
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      width: fit-content;
      transition: background 0.2s;
    }
    
    .btn-continue:hover {
      background: #233b35;
    }

    /* ──────────────────────────────────────────
       CLEAN HISTORY LIST
       ────────────────────────────────────────── */
    .history-section h2 {
      font-family: var(--display);
      font-size: 24px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 24px;
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
      transition: box-shadow 0.2s, transform 0.2s;
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
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      background: #e0e0e0; /* Fallback color */
    }
    
    .history-info {
      flex: 1;
    }
    
    .history-info h3 {
      font-family: var(--display);
      font-size: 17px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 4px;
      line-height: 1.3;
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
      background: #5E5E5E;
      border-radius: 2px;
    }
    
    .last-read {
      font-size: 12px;
      color: var(--ink-faint);
    }
    
    .btn-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--paper-soft);
      border: none;
      color: var(--ink-soft);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .history-card-clean:hover .btn-icon {
      background: #2D4A43;
      color: white;
    }
    
    .loading-state, .empty-state {
      padding: 48px;
      text-align: center;
      color: var(--ink-soft);
    }
    
    .empty-state p {
      margin-bottom: 24px;
      font-size: 16px;
    }

    /* ──────────────────────────────────────────
       MOBILE RESPONSIVENESS
       ────────────────────────────────────────── */
    .wrap {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 32px;
    }
    
    @media (max-width: 768px) {
      .wrap { padding: 0 16px; }
      
      .banner-content {
        flex-direction: column;
        padding: 24px;
        align-items: center;
      }
      
      .active-info-card {
        padding: 24px;
        text-align: center;
      }
      
      .progress-section { margin: 0 auto 32px; }
      .btn-continue { width: 100%; justify-content: center; }
      
      .history-list { grid-template-columns: 1fr; }
      .history-card-clean { gap: 16px; }
      .btn-icon { display: none; }
    }
  `]
})
export class MyReadingComponent implements OnInit {
  authService = inject(AuthService);
  
  recentlyRead = signal<ReadingHistory | null>(null);
  readingHistory = signal<ReadingHistory[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.authService.getReadingProgress().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (progressData) => {
        const history: ReadingHistory[] = progressData.map((p: any) => ({
          id: p._id,
          storyId: p.book?._id,
          title: p.book?.title || 'Unknown Title',
          author: typeof p.book?.author === 'object' ? p.book?.author?.username : (p.book?.author || 'Unknown Author'),
          cover: p.book?.cover || 'https://placehold.co/400x600/333333/999999?text=Cover',
          currentChapter: p.currentChapter?.order || p.currentChapter || 1,
          totalChapters: p.book?.chapters?.length || 10,
          progressPercentage: p.progressPercentage || 0,
          lastReadDate: new Date(p.lastReadAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        })).filter((h: any) => h.storyId);

        if (history.length > 0) {
          this.recentlyRead.set(history[0]);
          this.readingHistory.set(history.slice(1));
        }
      },
      error: (err) => {
        console.error('Failed to load reading history', err);
      }
    });
  }
}
