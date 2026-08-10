import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface AuthorStory {
  id: string;
  title: string;
  cover: string;
  status: 'Published' | 'Ongoing' | 'Draft';
  views: string;
  likes: string;
  chapters: number;
  lastUpdated: string;
}

@Component({
  selector: 'app-author-studio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="studio-page">
      <div class="hero-section">
        <div class="wrap">
          <div class="hero-header">
            <div>
              <h1>Author Studio</h1>
              <p>Manage your stories, view analytics, and connect with your readers.</p>
            </div>
            <button class="btn-primary" routerLink="/write/new">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Create New Story
            </button>
          </div>
        </div>
      </div>
      
      <div class="wrap content-area">
        <!-- Analytics Dashboard -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon reads">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Total Reads</p>
              <h3 class="stat-value">124.5K</h3>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon followers">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Followers</p>
              <h3 class="stat-value">8,420</h3>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon likes">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z"/>
              </svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Total Likes</p>
              <h3 class="stat-value">12.1K</h3>
            </div>
          </div>
        </div>

        <!-- My Stories -->
        <div class="stories-section">
          <div class="section-header">
            <h2>My Works</h2>
            <div class="filter-tabs">
              <button class="filter-btn active">All</button>
              <button class="filter-btn">Published</button>
              <button class="filter-btn">Ongoing</button>
              <button class="filter-btn">Drafts</button>
            </div>
          </div>
          
          <div class="stories-list">
            @for (story of myStories; track story.id) {
              <div class="story-card">
                <img [src]="story.cover" [alt]="story.title" class="story-cover">
                
                <div class="story-details">
                  <div class="story-header">
                    <h3>{{ story.title }}</h3>
                    <span class="status-badge" [ngClass]="story.status.toLowerCase()">{{ story.status }}</span>
                  </div>
                  
                  <div class="story-stats">
                    <span>{{ story.chapters }} Chapters</span>
                    <span>•</span>
                    <span>{{ story.views }} Reads</span>
                    <span>•</span>
                    <span>{{ story.likes }} Likes</span>
                  </div>
                  
                  <p class="last-updated">Last updated {{ story.lastUpdated }}</p>
                </div>
                
                <div class="story-actions">
                  <button class="btn-action edit" routerLink="/write/new">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button class="btn-action" (click)="showOptions(story.id)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .studio-page {
      min-height: calc(100vh - 72px);
      background: var(--paper-warm);
      padding-bottom: 80px;
    }
    
    .hero-section {
      background: var(--card);
      padding: 48px 0;
      border-bottom: 1px solid var(--border-soft);
      margin-bottom: 40px;
    }
    
    .hero-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    
    .hero-header h1 {
      font-family: var(--display);
      font-size: 28px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 8px;
    }
    
    .hero-header p {
      font-size: 15px;
      color: var(--ink-soft);
    }
    
    .btn-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--forest);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: background 0.2s;
      white-space: nowrap;
    }
    
    .btn-primary:hover {
      background: var(--forest-deep);
    }

    /* Analytics Dashboard */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }
    
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-m);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(43, 38, 32, 0.06);
    }
    
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .stat-icon.reads { background: rgba(63, 98, 89, 0.1); color: var(--forest); }
    .stat-icon.followers { background: rgba(185, 139, 50, 0.1); color: var(--gold); }
    .stat-icon.likes { background: rgba(174, 98, 116, 0.1); color: var(--rose); }
    
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    
    .stat-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-family: var(--display);
      font-size: 24px;
      font-weight: 700;
      color: var(--ink);
      line-height: 1;
    }

    /* My Stories Section */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    
    .section-header h2 {
      font-family: var(--display);
      font-size: 20px;
      font-weight: 700;
      color: var(--ink);
    }
    
    .filter-tabs {
      display: flex;
      gap: 8px;
    }
    
    .filter-btn {
      background: transparent;
      border: 1px solid var(--border);
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 500;
      color: var(--ink-soft);
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .filter-btn:hover {
      border-color: var(--ink-faint);
      color: var(--ink);
    }
    
    .filter-btn.active {
      background: var(--ink);
      border-color: var(--ink);
      color: white;
    }
    
    .stories-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .story-card {
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-m);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 24px;
    }
    
    .story-cover {
      width: 80px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
      flex-shrink: 0;
    }
    
    .story-details {
      flex: 1;
    }
    
    .story-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    
    .story-header h3 {
      font-family: var(--display);
      font-size: 20px;
      font-weight: 600;
      color: var(--ink);
    }
    
    .status-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 100px;
    }
    
    .status-badge.published { background: rgba(63, 98, 89, 0.1); color: var(--forest); }
    .status-badge.ongoing { background: rgba(185, 139, 50, 0.1); color: var(--gold); }
    .status-badge.draft { background: var(--border-soft); color: var(--ink-soft); }
    
    .story-stats {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--ink-soft);
      margin-bottom: 12px;
    }
    
    .last-updated {
      font-size: 12px;
      color: var(--ink-faint);
    }
    
    .story-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .btn-action {
      background: transparent;
      border: 1px solid var(--border);
      padding: 8px;
      border-radius: 8px;
      color: var(--ink-soft);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .btn-action.edit {
      padding: 8px 16px;
      gap: 8px;
      font-family: var(--display);
      font-weight: 600;
      font-size: 13px;
      color: var(--ink);
    }
    
    .btn-action:hover {
      border-color: var(--forest);
      color: var(--forest);
      background: rgba(63, 98, 89, 0.05);
    }

    @media (max-width: 768px) {
      .hero-header { flex-direction: column; align-items: flex-start; }
      .section-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .story-card { flex-direction: column; align-items: flex-start; }
      .story-cover { width: 100%; height: 200px; }
      .story-actions { width: 100%; justify-content: flex-end; margin-top: 16px; }
    }
  `]
})
export class AuthorStudioComponent {
  
  myStories: AuthorStory[] = [
    {
      id: 'w1',
      title: 'Echoes of a Forgotten Epoch',
      cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
      status: 'Ongoing',
      views: '45.2K',
      likes: '3.4K',
      chapters: 18,
      lastUpdated: '2 days ago'
    },
    {
      id: 'w2',
      title: 'The Silent Code',
      cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80',
      status: 'Published',
      views: '78.9K',
      likes: '8.1K',
      chapters: 32,
      lastUpdated: 'May 14, 2026'
    },
    {
      id: 'w3',
      title: 'Midnight in Neo-Kyoto',
      cover: 'https://images.unsplash.com/photo-1549488344-c6c748c15664?w=300&q=80',
      status: 'Draft',
      views: '-',
      likes: '-',
      chapters: 3,
      lastUpdated: 'Just now'
    }
  ];

  showOptions(id: string) {
    alert('Options menu for story ID: ' + id + ' (Feature coming soon!)');
  }
}
