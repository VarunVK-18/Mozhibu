import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  SearchService,
  SearchParams,
} from '../../core/services/search.service';
import { ApiService } from '../../core/services/api.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../environments/environment';

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
              <input
                type="radio"
                name="status"
                value="All"
                [(ngModel)]="filters.status"
                (change)="onFilterChange()"
              />
              All
            </label>
            <label class="radio-label">
              <input
                type="radio"
                name="status"
                value="Completed"
                [(ngModel)]="filters.status"
                (change)="onFilterChange()"
              />
              Completed
            </label>
            <label class="radio-label">
              <input
                type="radio"
                name="status"
                value="Ongoing"
                [(ngModel)]="filters.status"
                (change)="onFilterChange()"
              />
              Ongoing
            </label>
          </div>
        </div>

        <div class="filter-group">
          <label>Genre</label>
          <select
            class="filter-select"
            [(ngModel)]="filters.genre"
            (change)="onFilterChange()"
          >
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
          <select
            class="filter-select"
            [(ngModel)]="filters.language"
            (change)="onFilterChange()"
          >
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
            <svg
              class="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search for stories, authors, series, or tags..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchInput($event)"
              (keyup.enter)="onSearch()"
            />
            <button class="btn-primary" (click)="onSearch()">Search</button>
          </div>

          <div class="tabs-and-sort">
            <div class="tabs">
              <button
                class="tab-btn"
                [class.active]="activeTab === 'stories'"
                (click)="setTab('stories')"
              >
                Stories
              </button>
              <button
                class="tab-btn"
                [class.active]="activeTab === 'authors'"
                (click)="setTab('authors')"
              >
                Authors
              </button>
              <button
                class="tab-btn"
                [class.active]="activeTab === 'series'"
                (click)="setTab('series')"
              >
                Series
              </button>
              <button
                class="tab-btn"
                [class.active]="activeTab === 'tags'"
                (click)="setTab('tags')"
              >
                Tags
              </button>
            </div>

            <div class="sort-dropdown">
              <span class="sort-label">Sort by:</span>
              <select
                class="filter-select"
                [(ngModel)]="filters.sort"
                (change)="onFilterChange()"
              >
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
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <h3>No results found</h3>
              <p>
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
            </div>
          } @else {
            <div
              class="results-grid"
              [class.authors-grid]="activeTab === 'authors'"
            >
              @for (item of results; track item._id) {
                @if (activeTab === 'authors') {
                  <div class="author-card" [routerLink]="['/author', item._id]">
                    <img
                      [src]="getAvatarUrl(item.avatar, item.username)"
                      alt="Author avatar"
                      class="author-avatar"
                      (error)="onAvatarError($event, item.username)"
                    />
                    <h4 class="author-name">{{ item.username }}</h4>
                    <p class="author-followers">
                      {{ item.followersCount }} Followers
                    </p>
                  </div>
                } @else {
                  <div class="book-card" [routerLink]="['/story', item._id]">
                    <div class="cover-wrapper">
                      <img
                        [src]="getCoverUrl(item.cover)"
                        alt="Book cover"
                        class="book-cover"
                        (error)="onCoverError($event)"
                      />
                      @if (item.accessType === 'premium') {
                        <div class="paid-badge">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M12 2.25C10.4812 2.25 9.25 3.48122 9.25 5C9.25 5.78328 9.57756 6.48937 10.1018 6.98967C10.0375 7.10378 9.97102 7.22294 9.90223 7.34628L8.10504 10.5686C7.92732 10.8873 7.82158 11.0749 7.7325 11.2018C7.70459 11.2415 7.68483 11.2655 7.67287 11.2788L7.67118 11.2791C7.65596 11.2695 7.63012 11.2518 7.5918 11.2208C7.47104 11.1231 7.31753 10.9715 7.05879 10.7138L6.97976 10.635C6.6607 10.317 6.37058 10.0279 6.10664 9.79144C6.19926 9.54508 6.25 9.27824 6.25 9C6.25 7.75736 5.24264 6.75 4 6.75C2.75736 6.75 1.75 7.75736 1.75 9C1.75 9.98302 2.3804 10.8188 3.25898 11.1251C3.26199 11.1822 3.26564 11.2399 3.26976 11.298C3.29277 11.6228 3.33458 12.0116 3.38243 12.4564L3.5671 14.1733C3.59705 14.4517 3.62574 14.7289 3.65412 15.0031C3.76616 16.0856 3.87332 17.121 4.03322 17.994C4.1343 18.5459 4.26178 19.0659 4.43833 19.5172C4.61339 19.9648 4.8549 20.3925 5.21187 20.712C5.84173 21.2758 6.60137 21.522 7.50819 21.6381C8.38307 21.75 9.48625 21.75 10.8602 21.75H13.1398C14.5137 21.75 15.6169 21.75 16.4918 21.6381C17.3986 21.522 18.1583 21.2758 18.7881 20.712C19.1451 20.3925 19.3866 19.9648 19.5617 19.5172C19.7382 19.0659 19.8657 18.5459 19.9668 17.994C20.1267 17.1211 20.2338 16.0858 20.3459 15.0034C20.3742 14.7293 20.403 14.4516 20.4329 14.1733L20.6176 12.4565C20.6654 12.0116 20.7072 11.6228 20.7302 11.298C20.7344 11.2399 20.738 11.1822 20.741 11.1251C21.6196 10.8188 22.25 9.98302 22.25 9C22.25 7.75736 21.2426 6.75 20 6.75C18.7574 6.75 17.75 7.75736 17.75 9C17.75 9.27824 17.8007 9.54509 17.8934 9.79145C17.6294 10.0279 17.3393 10.317 17.0202 10.635L16.9412 10.7138C16.6825 10.9715 16.529 11.1231 16.4082 11.2208C16.3699 11.2518 16.344 11.2695 16.3288 11.2791L16.3271 11.2788C16.3152 11.2655 16.2954 11.2415 16.2675 11.2018C16.1784 11.0749 16.0727 10.8873 15.895 10.5686L14.0977 7.34619C14.0289 7.22288 13.9625 7.10375 13.8982 6.98967C14.4224 6.48937 14.75 5.78328 14.75 5C14.75 3.48122 13.5188 2.25 12 2.25ZM10.75 5C10.75 4.30964 11.3096 3.75 12 3.75C12.6904 3.75 13.25 4.30964 13.25 5C13.25 5.48504 12.9739 5.90689 12.5668 6.11457C12.3975 6.20095 12.2056 6.25 12 6.25C11.7944 6.25 11.6025 6.20095 11.4332 6.11457C11.0261 5.90689 10.75 5.48504 10.75 5ZM11.2046 8.09072C11.2857 7.94528 11.3599 7.81229 11.4288 7.69043C11.6133 7.72949 11.8045 7.75 12 7.75C12.1955 7.75 12.3867 7.72949 12.5712 7.69043C12.6401 7.81229 12.7143 7.94528 12.7954 8.09071L14.6016 11.3291C14.7569 11.6077 14.9005 11.8653 15.0399 12.0638C15.1885 12.2753 15.3911 12.5089 15.7015 12.6456C15.9698 12.7637 16.2657 12.8049 16.556 12.7648C16.8918 12.7184 17.1507 12.5495 17.3517 12.3869C17.5403 12.2343 17.7493 12.026 17.9756 11.8006L17.9998 11.7765C18.3752 11.4026 18.6497 11.1315 18.8593 10.9397C18.9792 11.0103 19.1061 11.0701 19.2389 11.1179C19.2374 11.1417 19.2358 11.1664 19.234 11.192C19.2131 11.4865 19.1743 11.8486 19.1249 12.3082L18.9415 14.0129C18.9095 14.3104 18.8794 14.6003 18.8502 14.8822C18.7807 15.553 18.7159 16.178 18.641 16.75H5.35903C5.28409 16.178 5.2193 15.553 5.14978 14.8822C5.12056 14.6003 5.0905 14.3104 5.0585 14.0129L4.87514 12.3082C4.82571 11.8486 4.78687 11.4865 4.76601 11.192C4.7642 11.1664 4.76255 11.1417 4.76107 11.1179C4.89386 11.0701 5.02084 11.0103 5.14066 10.9397C5.35033 11.1315 5.62484 11.4026 6.0002 11.7765L6.02438 11.8006C6.25065 12.026 6.45971 12.2343 6.64834 12.3869C6.84933 12.5495 7.10824 12.7184 7.44397 12.7648C7.73429 12.8049 8.03016 12.7637 8.29846 12.6456C8.60887 12.5089 8.81155 12.2753 8.96009 12.0638C9.09945 11.8653 9.24306 11.6078 9.39842 11.3291L11.2046 8.09072ZM5.61801 18.25C5.68337 18.526 5.75521 18.7662 5.83525 18.9708C5.96405 19.3 6.0962 19.4904 6.21228 19.5943C6.52851 19.8774 6.9509 20.0545 7.69857 20.1502C8.46719 20.2486 9.47421 20.25 10.9121 20.25H13.0879C14.5258 20.25 15.5328 20.2486 16.3014 20.1502C17.0491 20.0545 17.4715 19.8774 17.7877 19.5943C17.9038 19.4904 18.036 19.3 18.1647 18.9708C18.2448 18.7662 18.3166 18.526 18.382 18.25H5.61801ZM3.25 9C3.25 8.58579 3.58579 8.25 4 8.25C4.41421 8.25 4.75 8.58579 4.75 9C4.75 9.18789 4.68188 9.35799 4.56799 9.48982C4.4311 9.64827 4.23192 9.74737 4.00904 9.74995L4 9.75C3.58579 9.75 3.25 9.41421 3.25 9ZM19.25 9C19.25 8.58579 19.5858 8.25 20 8.25C20.4142 8.25 20.75 8.58579 20.75 9C20.75 9.41421 20.4142 9.75 20 9.75L19.991 9.74995C19.7681 9.74737 19.5689 9.64827 19.432 9.48982C19.3181 9.35799 19.25 9.18789 19.25 9Z"
                              fill="#FFD700"
                            />
                          </svg>
                        </div>
                      }
                      @if (item.completionStatus === 'completed') {
                        <span class="status-badge completed">Completed</span>
                      } @else {
                        <span class="status-badge ongoing">Ongoing</span>
                      }
                    </div>
                    <div class="book-info">
                      <h4 class="book-title">{{ item.title }}</h4>
                      <p class="book-author">
                        by {{ item.author?.username || 'Unknown' }}
                      </p>

                      <div class="book-meta">
                        <span class="meta-item">
                          <svg
                            viewBox="0 0 24 24"
                            width="12"
                            height="12"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                            ></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          {{ item.views || 0 }}
                        </span>
                        <span class="meta-item">
                          <svg
                            viewBox="0 0 24 24"
                            width="12"
                            height="12"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                            ></path>
                          </svg>
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
  styles: [
    `
      .search-layout {
        display: flex;
        height: calc(100vh - 73px);
        overflow: hidden;
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
        overflow-y: auto;
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

      .radio-label input[type='radio'] {
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
        overflow: hidden;
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
        transition:
          border-color 0.2s,
          box-shadow 0.2s;
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
        overflow-y: auto;
      }

      .loading-state,
      .empty-state {
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
        to {
          transform: rotate(360deg);
        }
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
        min-width: 0;
      }

      .book-card:hover {
        transform: translateY(-4px);
      }

      .book-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .cover-wrapper {
        position: relative;
        width: 100%;
        aspect-ratio: 2 / 3;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      .book-cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .paid-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        padding: 4px;
        backdrop-filter: blur(4px);
      }

      .paid-badge svg {
        width: 18px;
        height: 18px;
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

      .status-badge.completed {
        background: rgba(16, 185, 129, 0.85);
      }
      .status-badge.ongoing {
        background: rgba(59, 130, 246, 0.85);
      }

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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
        .search-layout {
          flex-direction: column;
        }
        .search-sidebar {
          width: 100%;
          border-right: none;
          border-bottom: 1px solid var(--border);
          padding: 24px;
        }
        .search-header {
          padding: 24px 24px 0;
        }
        .search-results {
          padding: 24px;
        }
        .tabs {
          gap: 16px;
          overflow-x: auto;
          width: 100%;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 4px;
        }
        .tabs-and-sort {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          width: 100%;
          min-width: 0;
        }
        .sort-dropdown {
          padding-bottom: 0;
          margin-bottom: 16px;
          width: 100%;
        }
        .sort-dropdown .filter-select {
          flex: 1;
        }
      }

      @media (max-width: 640px) {
        .search-sidebar {
          padding: 16px;
          gap: 20px;
        }
        .search-header {
          padding: 16px 16px 0;
        }
        .search-results {
          padding: 16px;
        }

        .search-bar {
          padding: 4px 4px 4px 16px;
          margin-bottom: 16px;
          width: 100%;
        }
        .search-bar input {
          font-size: 14px;
          padding: 10px 8px;
          width: 100%;
          min-width: 0;
        }
        .btn-primary {
          padding: 10px 16px;
          font-size: 13px;
          flex-shrink: 0;
        }

        .tabs {
          gap: 24px;
          padding-bottom: 8px;
          width: 100%;
        }
        .tab-btn {
          white-space: nowrap;
          font-size: 14px;
          padding-bottom: 8px;
        }

        .results-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .results-grid.authors-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .book-title {
          font-size: 14px;
        }
        .book-author {
          font-size: 12px;
        }
        .meta-item {
          font-size: 11px;
        }
        .genre-badge {
          font-size: 10px;
          padding: 2px 4px;
        }

        .author-card {
          padding: 16px;
        }
        .author-avatar {
          width: 60px;
          height: 60px;
          margin-bottom: 12px;
        }
        .author-name {
          font-size: 14px;
        }
        .author-followers {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class SearchComponent implements OnInit, OnDestroy {
  private searchService = inject(SearchService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  searchQuery = '';
  activeTab = 'stories';
  isLoading = false;
  results: any[] = [];

  private searchSubject = new Subject<string>();

  filters = {
    status: 'All',
    genre: 'All',
    language: 'All',
    sort: 'popularity',
  };

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['q']) this.searchQuery = params['q'];
      if (params['type']) this.activeTab = params['type'];
      if (params['genre']) this.filters.genre = params['genre'];
      if (params['language']) this.filters.language = params['language'];
      if (params['status']) this.filters.status = params['status'];
      if (params['sort']) this.filters.sort = params['sort'];

      this.executeSearch();
    });

    // Setup debounced live search
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.onSearch();
      });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  onSearchInput(value: string) {
    this.searchSubject.next(value);
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
      sort: this.filters.sort,
    };

    if (this.filters.genre !== 'All') queryParams.genre = this.filters.genre;
    if (this.filters.language !== 'All')
      queryParams.language = this.filters.language;
    if (this.filters.status !== 'All') queryParams.status = this.filters.status;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }

  executeSearch() {
    this.isLoading = true;

    const params: SearchParams = {
      q: this.searchQuery,
      type: this.activeTab,
      sort: this.filters.sort,
    };

    if (this.filters.genre !== 'All') params.genre = this.filters.genre;
    if (this.filters.language !== 'All')
      params.language = this.filters.language;
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
      },
    });
  }

  getAvatarUrl(avatar: string | undefined, username?: string): string {
    if (!avatar) return this.api.getFallbackAvatar(username);
    return this.api.getImageUrl(avatar);
  }

  onAvatarError(event: any, username?: string) {
    event.target.src = this.api.getFallbackAvatar(username);
  }

  onCoverError(event: any) {
    event.target.src = this.api.getFallbackCover();
  }

  getCoverUrl(cover: string | undefined): string {
    if (!cover) return this.api.getFallbackCover();
    return this.api.getImageUrl(cover);
  }
}
