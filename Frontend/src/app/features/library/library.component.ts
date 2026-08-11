import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryCardComponent, Story } from '../../shared/components/story-card/story-card.component';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, StoryCardComponent, RouterModule, TranslatePipe],
  template: `
    <div class="library-page">
      <div class="hero-section">
        <div class="wrap">
          <h1>{{ 'libraryPage.title' | translate }}</h1>
          <p>{{ 'libraryPage.subtitle' | translate }}</p>
        </div>
      </div>
      
      <div class="wrap library-content">
        <div class="tabs">
          <button 
            class="tab-btn" 
            [class.active]="activeTab() === 'saved'" 
            (click)="activeTab.set('saved')">
            {{ 'libraryPage.savedStories' | translate }} ({{ savedStories.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab() === 'authors'" 
            (click)="activeTab.set('authors')">
            {{ 'libraryPage.followedAuthors' | translate }} ({{ followedAuthors.length }})
          </button>
        </div>
        
        <div class="tab-content" *ngIf="activeTab() === 'saved'">
          @if (savedStories.length > 0) {
            <div class="story-grid">
              @for (story of savedStories; track story.id) {
                <app-story-card [story]="story"></app-story-card>
              }
            </div>
          } @else {
            <div class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <h2>No saved stories yet</h2>
              <p>Explore the discovery page and bookmark stories to build your collection.</p>
              <button class="btn-primary" routerLink="/">Discover Stories</button>
            </div>
          }
        </div>
        
        <div class="tab-content" *ngIf="activeTab() === 'authors'">
          @if (followedAuthors.length > 0) {
            <div class="authors-list">
              @for (author of followedAuthors; track author.id) {
                <div class="author-card">
                  <div class="author-info">
                    <img [src]="author.avatar" [alt]="author.name" class="author-avatar" />
                    <div>
                      <h3>{{ author.name }}</h3>
                      <p>{{ author.followers }} followers</p>
                    </div>
                  </div>
                  <button class="btn-outline">Following</button>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </div>
              <h2>No followed authors yet</h2>
              <p>Follow authors you love to get notified when they publish new stories.</p>
              <button class="btn-primary" routerLink="/">Find Authors</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .library-page {
      min-height: calc(100vh - 72px);
      background: var(--paper-warm);
      padding-bottom: 80px;
    }
    
    .hero-section {
      background: var(--card);
      padding: 48px 0;
      text-align: left;
      border-bottom: 1px solid var(--border-soft);
      margin-bottom: 32px;
    }
    
    .hero-section h1 {
      font-family: var(--display);
      font-size: 26px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 8px;
      letter-spacing: -0.01em;
    }
    
    .hero-section p {
      font-size: 15px;
      color: var(--ink-soft);
    }
    
    .tabs {
      display: flex;
      gap: 32px;
      border-bottom: 1px solid var(--border-soft);
      margin-bottom: 32px;
    }
    
    .tab-btn {
      padding: 12px 0;
      font-family: var(--display);
      font-size: 16px;
      font-weight: 600;
      color: var(--ink-soft);
      position: relative;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: color 0.2s;
    }
    
    .tab-btn:hover {
      color: var(--ink);
    }
    
    .tab-btn.active {
      color: var(--forest-deep);
    }
    
    .tab-btn.active::after {
      content: "";
      position: absolute;
      left: 0; right: 0; bottom: -1px;
      height: 2px;
      background: var(--forest);
      border-radius: 2px 2px 0 0;
    }
    
    .story-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 24px;
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
    
    .author-avatar {
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
    
    .btn-outline {
      background: transparent;
      border: 1px solid var(--border);
      padding: 8px 16px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      font-size: 13px;
      color: var(--ink);
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-outline:hover {
      border-color: var(--rose);
      color: var(--rose);
    }
    
    .empty-state {
      text-align: center;
      padding: 64px 20px;
      background: var(--card);
      border-radius: var(--radius-l);
      border: 1px dashed var(--border);
    }
    
    .empty-icon {
      margin-bottom: 16px;
      color: var(--ink-faint, #a09a90);
      display: flex;
      justify-content: center;
    }
    
    .empty-state h2 {
      font-family: var(--display);
      font-size: 20px;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 8px;
    }
    
    .empty-state p {
      font-size: 14px;
      color: var(--ink-soft);
      max-width: 400px;
      margin: 0 auto 24px;
    }
    
    .btn-primary {
      background: var(--forest);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 100px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .btn-primary:hover {
      background: var(--forest-deep);
    }

    /* ── Mobile Responsive ─────────────────── */
    .wrap {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 32px;
    }
    @media (max-width: 768px) {
      .wrap { padding: 0 16px; }
      .hero-section { padding: 32px 0; }
      .hero-section h1 { font-size: 26px; }
      .tabs { gap: 20px; }
      .tab-btn { font-size: 14px; }
      .story-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
      .authors-list { grid-template-columns: 1fr; }
      .author-card { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
    @media (max-width: 480px) {
      .story-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .hero-section h1 { font-size: 22px; }
    }
  `]
})
export class LibraryComponent implements OnInit {
  authService = inject(AuthService);
  activeTab = signal<'saved' | 'authors'>('saved');
  
  savedStories: Story[] = [];
  followedAuthors: any[] = [];

  ngOnInit() {
    this.authService.getLibrary().subscribe({
      next: (books: any[]) => {
        this.savedStories = books.map(b => ({
          id: b._id,
          title: b.title,
          author: b.author?.username || 'Unknown',
          cover: b.cover || 'assets/placeholder.jpg',
          genre: b.genre
        }));
      }
    });

    this.authService.getFollowing().subscribe({
      next: (authors: any[]) => {
        this.followedAuthors = authors.map(a => ({
          id: a._id,
          name: a.username,
          avatar: a.avatar || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100',
          followers: (a.followersCount / 1000).toFixed(1) + 'K'
        }));
      }
    });
  }
}
