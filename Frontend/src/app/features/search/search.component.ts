import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchService, SearchParams } from '../../core/services/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="search-layout">
      <!-- Left Sidebar: Filters -->
      <aside class="search-sidebar">
        <h2 class="sidebar-title">Filters</h2>
        
        <div class="filter-group">
          <label>Status</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" name="status" value="All" [(ngModel)]="filters.status" (change)="onFilterChange()">
              All
            </label>
            <label class="radio-label">
              <input type="radio" name="status" value="Completed" [(ngModel)]="filters.status" (change)="onFilterChange()">
              Completed
            </label>
            <label class="radio-label">
              <input type="radio" name="status" value="Ongoing" [(ngModel)]="filters.status" (change)="onFilterChange()">
              Ongoing
            </label>
          </div>
        </div>
        
        <div class="filter-group">
          <label>Genre</label>
          <select class="filter-select" [(ngModel)]="filters.genre" (change)="onFilterChange()">
            <option value="All">All Genres</option>
            <option value="Romance">Romance</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Thriller">Thriller</option>
            <option value="Horror">Horror</option>
            <option value="Mystery">Mystery</option>
            <option value="Historical">Historical</option>
            <option value="Drama">Drama</option>
            <option value="Comedy">Comedy</option>
            <option value="Sci-Fi">Sci-Fi</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Language</label>
          <select class="filter-select" [(ngModel)]="filters.language" (change)="onFilterChange()">
            <option value="All">All Languages</option>
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Hindi">Hindi</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Telugu">Telugu</option>
          </select>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="search-main">
        <div class="search-header">
          <div class="search-bar">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search for stories, authors, series, or tags..." 
                   [(ngModel)]="searchQuery" 
                   (keyup.enter)="onSearch()">
            <button class="btn-primary" (click)="onSearch()">Search</button>
          </div>
          
          <div class="tabs-and-sort">
            <div class="tabs">
              <button class="tab-btn" [class.active]="activeTab === 'stories'" (click)="setTab('stories')">Stories</button>
              <button class="tab-btn" [class.active]="activeTab === 'authors'" (click)="setTab('authors')">Authors</button>
              <button class="tab-btn" [class.active]="activeTab === 'series'" (click)="setTab('series')">Series</button>
              <button class="tab-btn" [class.active]="activeTab === 'tags'" (click)="setTab('tags')">Tags</button>
            </div>
            
            <div class="sort-dropdown">
              <span class="sort-label">Sort by:</span>
              <select class="filter-select" [(ngModel)]="filters.sort" (change)="onFilterChange()">
                <option value="popularity">Popularity</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        <div class="search-results">
          @if (isLoading) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Searching...</p>
            </div>
          } @else if (results.length === 0) {
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <h3>No results found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          } @else {
            <div class="results-grid" [class.authors-grid]="activeTab === 'authors'">
              @for (item of results; track item._id) {
                
                @if (activeTab === 'authors') {
                  <div class="author-card" [routerLink]="['/author', item._id]">
                    <img [src]="item.avatar ? (item.avatar.startsWith('http') ? item.avatar : 'http://localhost:5000' + item.avatar) : 'https://ui-avatars.com/api/?name=' + (item.username || 'A') + '&length=1&background=3F6259&color=fff'" alt="Author avatar" class="author-avatar">
                    <h4 class="author-name">{{ item.username }}</h4>
                    <p class="author-followers">{{ item.followersCount }} Followers</p>
                  </div>
                } @else {
                  <div class="book-card" [routerLink]="['/book', item._id]">
                    <div class="cover-wrapper">
                      <img [src]="item.cover || 'assets/default-cover.png'" alt="Book cover" class="book-cover" onerror="this.src='https://placehold.co/400x600/3F6259/FFFFFF?text='+item.title">
                      @if (item.completionStatus === 'completed') {
                        <span class="status-badge completed">Completed</span>
                      } @else {
                        <span class="status-badge ongoing">Ongoing</span>
                      }
                    </div>
                    <div class="book-info">
                      <h4 class="book-title">{{ item.title }}</h4>
                      <p class="book-author">by {{ item.author?.username || 'Unknown' }}</p>
                      
                      <div class="book-meta">
                        <span class="meta-item">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          {{ item.views || 0 }}
                        </span>
                        <span class="meta-item">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                          {{ item.likesCount || 0 }}
                        </span>
                        <span class="genre-badge">{{ item.genre }}</span>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .search-layout {
      display: flex;
      min-height: calc(100vh - 73px);
      background: var(--paper);
    }
    
    /* Sidebar */
    .search-sidebar {
      width: 280px;
      flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--border);
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    
    .sidebar-title {
      font-family: var(--display);
      font-size: 20px;
      font-weight: 700;
      color: var(--ink);
      margin: 0;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .filter-group label:first-child {
      font-size: 13px;
      font-weight: 700;
      color: var(--ink);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .radio-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      color: var(--ink-soft);
      cursor: pointer;
    }
    
    .radio-label input[type="radio"] {
      accent-color: var(--forest);
      width: 16px;
      height: 16px;
    }
    
    .filter-select {
      width: 100%;
      padding: 10px 14px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-family: inherit;
      font-size: 14px;
      color: var(--ink);
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
    }
    
    .filter-select:focus {
      outline: none;
      border-color: var(--forest);
    }
    
    /* Main Content */
    .search-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    
    .search-header {
      padding: 32px 48px 0;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    
    .search-bar {
      display: flex;
      align-items: center;
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: 100px;
      padding: 6px 6px 6px 20px;
      margin-bottom: 24px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .search-bar:focus-within {
      border-color: var(--forest);
      box-shadow: 0 0 0 3px rgba(63, 98, 89, 0.1);
    }
    
    .search-icon {
      width: 20px;
      height: 20px;
      color: var(--ink-faint);
    }
    
    .search-bar input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 12px 16px;
      font-family: inherit;
      font-size: 16px;
      color: var(--ink);
    }
    
    .search-bar input:focus {
      outline: none;
    }
    
    .search-bar input::placeholder {
      color: var(--ink-faint);
    }
    
    .btn-primary {
      background: var(--forest);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .btn-primary:hover {
      background: var(--forest-deep);
    }
    
    .tabs-and-sort {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .tabs {
      display: flex;
      gap: 32px;
    }
    
    .tab-btn {
      background: none;
      border: none;
      padding: 0 0 16px 0;
      font-family: var(--display);
      font-size: 15px;
      font-weight: 600;
      color: var(--ink-soft);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    
    .tab-btn:hover {
      color: var(--ink);
    }
    
    .tab-btn.active {
      color: var(--forest);
      border-bottom-color: var(--forest);
    }
    
    .sort-dropdown {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 16px;
    }
    
    .sort-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-soft);
    }
    
    .sort-dropdown .filter-select {
      width: 140px;
      padding: 8px 12px;
      background-position: right 10px center;
    }
    
    /* Results Area */
    .search-results {
      padding: 48px;
      flex: 1;
    }
    
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      text-align: center;
      color: var(--ink-soft);
    }
    
    .empty-state h3 {
      font-family: var(--display);
      font-size: 20px;
      color: var(--ink);
      margin: 16px 0 8px;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(63, 98, 89, 0.1);
      border-radius: 50%;
      border-top-color: var(--forest);
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 16px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 32px 24px;
    }
    
    .results-grid.authors-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 24px;
    }
    
    /* Book Card */
    .book-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .book-card:hover {
      transform: translateY(-4px);
    }
    
    .cover-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 2 / 3;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .book-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .status-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: white;
      backdrop-filter: blur(4px);
    }
    
    .status-badge.completed { background: rgba(16, 185, 129, 0.85); }
    .status-badge.ongoing { background: rgba(59, 130, 246, 0.85); }
    
    .book-title {
      font-family: var(--display);
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .book-author {
      font-size: 13px;
      color: var(--ink-soft);
      margin: 0;
    }
    
    .book-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--ink-faint);
    }
    
    .genre-badge {
      font-size: 11px;
      padding: 2px 6px;
      background: var(--paper-soft);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--ink-soft);
      margin-left: auto;
    }
    
    /* Author Card */
    .author-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px;
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .author-card:hover {
      border-color: var(--forest);
      box-shadow: 0 8px 24px rgba(63, 98, 89, 0.08);
      transform: translateY(-4px);
    }
    
    .author-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 16px;
      border: 2px solid var(--surface);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .author-name {
      font-family: var(--display);
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 4px;
    }
    
    .author-followers {
      font-size: 13px;
      color: var(--ink-soft);
      margin: 0;
    }
    
    @media (max-width: 900px) {
      .search-layout { flex-direction: column; }
      .search-sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border); padding: 24px; }
      .search-header { padding: 24px 24px 0; }
      .search-results { padding: 24px; }
      .tabs { gap: 16px; }
      .tabs-and-sort { flex-direction: column; align-items: flex-start; gap: 16px; }
      .sort-dropdown { padding-bottom: 0; margin-bottom: 16px; width: 100%; }
      .sort-dropdown .filter-select { flex: 1; }
    }
  `]
})
export class SearchComponent implements OnInit {
  private searchService = inject(SearchService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchQuery = '';
  activeTab = 'stories';
  isLoading = false;
  results: any[] = [];

  filters = {
    status: 'All',
    genre: 'All',
    language: 'All',
    sort: 'popularity'
  };

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) this.searchQuery = params['q'];
      if (params['type']) this.activeTab = params['type'];
      if (params['genre']) this.filters.genre = params['genre'];
      if (params['language']) this.filters.language = params['language'];
      if (params['status']) this.filters.status = params['status'];
      if (params['sort']) this.filters.sort = params['sort'];
      
      this.executeSearch();
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.updateUrlAndSearch();
  }

  onFilterChange() {
    this.updateUrlAndSearch();
  }

  onSearch() {
    this.updateUrlAndSearch();
  }

  updateUrlAndSearch() {
    const queryParams: any = {
      q: this.searchQuery || null,
      type: this.activeTab,
      sort: this.filters.sort
    };

    if (this.filters.genre !== 'All') queryParams.genre = this.filters.genre;
    if (this.filters.language !== 'All') queryParams.language = this.filters.language;
    if (this.filters.status !== 'All') queryParams.status = this.filters.status;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  executeSearch() {
    this.isLoading = true;
    
    const params: SearchParams = {
      q: this.searchQuery,
      type: this.activeTab,
      sort: this.filters.sort
    };
    
    if (this.filters.genre !== 'All') params.genre = this.filters.genre;
    if (this.filters.language !== 'All') params.language = this.filters.language;
    if (this.filters.status !== 'All') params.status = this.filters.status;

    this.searchService.search(params).subscribe({
      next: (res: any) => {
        this.results = res.results;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Search error', err);
        this.isLoading = false;
        this.results = [];
      }
    });
  }
}
