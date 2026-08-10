import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryCardComponent, Story } from '../../shared/components/story-card/story-card.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, StoryCardComponent, RouterModule],
  template: `
    <div class="library-page">
      <div class="hero-section">
        <div class="wrap">
          <h1>Your Library</h1>
          <p>Your personal collection of saved stories and favorite authors.</p>
        </div>
      </div>
      
      <div class="wrap library-content">
        <div class="tabs">
          <button 
            class="tab-btn" 
            [class.active]="activeTab() === 'saved'" 
            (click)="activeTab.set('saved')">
            Saved Stories ({{ savedStories.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab() === 'authors'" 
            (click)="activeTab.set('authors')">
            Followed Authors ({{ followedAuthors.length }})
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
              <div class="empty-icon">📚</div>
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
              <div class="empty-icon">✍️</div>
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
      font-size: 36px;
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
      font-size: 48px;
      margin-bottom: 16px;
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
  `]
})
export class LibraryComponent {
  activeTab = signal<'saved' | 'authors'>('saved');
  
  savedStories: Story[] = [
    { id: '1', title: 'The Silent Echo', author: 'Elara Vance', cover: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=300&q=80', genre: 'Sci-Fi' },
    { id: '2', title: 'A Memory of Light', author: 'Robert Jordan', cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80', genre: 'Fantasy' },
    { id: '3', title: 'Crimson Tide', author: 'Maya Lin', cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80', genre: 'Thriller' }
  ];

  followedAuthors = [
    { id: 'a1', name: 'Elara Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', followers: '12.4k' },
    { id: 'a2', name: 'J.T. Sterling', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80', followers: '8.1k' },
    { id: 'a3', name: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', followers: '24k' }
  ];
}
