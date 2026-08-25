import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-story-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      @if (isLoading) {
        <div class="loading-state">
          Loading story details...
        </div>
      } @else if (book) {
        <div class="dashboard-header">
          <div class="wrap">
            <div class="book-summary">
              <div class="book-cover-container">
                <img [src]="api.getImageUrl(book.cover) || 'assets/default-cover.png'" [alt]="book.title" class="book-cover" (error)="onCoverError($event)">
              </div>
              <div class="book-info">
                <h1>{{ book.title }}</h1>
                <div class="meta-row">
                  <span class="status-badge" [ngClass]="book.completionStatus === 'completed' ? 'completed' : book.status">{{ book.completionStatus === 'completed' ? 'Completed' : book.status }}</span>
                  <span class="genre">{{ book.genre }}</span>
                  <span>•</span>
                  <span>{{ book.views || 0 }} Views</span>
                </div>
                
                <div class="actions-row">
                  <button class="btn-primary" [routerLink]="['/write/book', book._id, 'chapter', 'new']">
                    + Add New Chapter
                  </button>
                  <button class="btn-outline" [routerLink]="['/write/book', book._id, 'settings']">
                    Edit Story Settings
                  </button>
                  <button class="btn-outline" (click)="toggleCompletionStatus()">
                    {{ book.completionStatus === 'completed' ? 'Mark as Ongoing' : 'Mark as Completed' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="wrap content-area">
          <div class="chapters-section">
            <h2>Chapters</h2>
            
            @if (chapters.length === 0) {
              <div class="empty-state">
                <p>You haven't written any chapters for this story yet.</p>
              </div>
            } @else {
              <div class="chapters-list">
                @for (chapter of chapters; track chapter._id) {
                  <div class="chapter-item">
                    <div class="chapter-info">
                      <span class="chapter-number">Chapter {{ chapter.order }}</span>
                      <h4 class="chapter-title">{{ chapter.title }}</h4>
                    </div>
                    <div class="chapter-status">
                      <span class="status-indicator" [ngClass]="chapter.status">{{ chapter.status === 'published' ? 'Published' : 'Draft' }}</span>
                      <button class="btn-outline btn-sm" [routerLink]="['/write/book', book._id, 'chapter', chapter._id]">Edit</button>
                      <button class="btn-outline btn-sm" style="color: #c62828; border-color: #ef9a9a;" (click)="deleteChapter(chapter._id)">Delete</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
      min-height: calc(100vh - 72px);
      background: var(--paper-warm);
    }

    .dashboard-header {
      background: var(--card);
      border-bottom: 1px solid var(--border-soft);
      padding: 48px 0;
      margin-bottom: 40px;
    }

    .book-summary {
      display: flex;
      gap: 32px;
      align-items: flex-end;
    }

    .book-cover {
      width: 160px;
      height: 240px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 12px 24px rgba(0,0,0,0.1);
      flex-shrink: 0;
    }

    .book-info h1 {
      font-family: var(--display);
      font-size: 32px;
      color: var(--ink);
      margin-bottom: 12px;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: var(--ink-soft);
      margin-bottom: 24px;
    }

    .status-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 100px;
    }

    .status-badge.published { background: rgba(63, 98, 89, 0.1); color: var(--forest); }
    .status-badge.ongoing { background: rgba(185, 139, 50, 0.1); color: var(--gold); }
    .status-badge.completed { background: rgba(16, 185, 129, 0.1); color: #10B981; }

    .actions-row {
      display: flex;
      gap: 16px;
    }

    .btn-primary {
      background: var(--forest);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      cursor: pointer;
    }
    
    .btn-outline {
      background: transparent;
      border: 1px solid var(--border-deep);
      color: var(--ink);
      padding: 10px 24px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      cursor: pointer;
    }

    .chapters-section h2 {
      font-family: var(--display);
      font-size: 24px;
      margin-bottom: 24px;
    }

    .chapters-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chapter-item {
      background: var(--card);
      border: 1px solid var(--border-soft);
      padding: 20px 24px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chapter-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .chapter-number {
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .chapter-title {
      font-family: var(--display);
      margin: 0;
      color: var(--ink);
    }

    .chapter-status {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-indicator {
      font-size: 12px;
      font-weight: 600;
    }
    
    .status-indicator.published {
      color: var(--forest);
    }
    
    .status-indicator.draft {
      color: var(--ink-soft);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .loading-state, .empty-state {
      padding: 48px;
      text-align: center;
      color: var(--ink-soft);
    }

    @media (max-width: 768px) {
      .book-summary {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 24px;
      }
      
      .actions-row {
        flex-direction: column;
        width: 100%;
      }
      
      .actions-row button {
        width: 100%;
      }
      
      .meta-row {
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .dashboard-header {
        padding: 32px 0;
      }

      .chapter-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .chapter-status {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class StoryDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  api = inject(ApiService);

  book: any = null;
  chapters: any[] = [];
  isLoading = true;
  totalWords = 0;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchBookDetails(id);
      }
    });
  }

  fetchBookDetails(id: string) {
    this.isLoading = true;
    this.bookService.getBookById(id).subscribe({
      next: (bookRes) => {
        this.book = bookRes;
        this.fetchChapters(id);
      },
      error: (err) => {
        console.error('Failed to fetch book', err);
        this.isLoading = false;
      }
    });
  }

  fetchChapters(id: string) {
    this.bookService.getChapters(id).subscribe({
      next: (chaptersRes) => {
        this.chapters = chaptersRes;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch chapters', err);
        this.isLoading = false;
      }
    });
  }

  get completionPercentage(): number {
    if (!this.book || !this.book.targetWordCount || this.book.targetWordCount <= 0) return 0;
    return Math.min(100, Math.round((this.totalWords / this.book.targetWordCount) * 100));
  }

  onCoverError(event: any) {
    event.target.src = this.api.getFallbackCover();
  }

  toggleCompletionStatus() {
    if (!this.book) return;
    
    const newStatus = this.book.completionStatus === 'completed' ? 'ongoing' : 'completed';
    this.bookService.updateBookStatus(this.book._id, newStatus).subscribe({
      next: (res) => {
        this.book.completionStatus = res.completionStatus;
      },
      error: (err) => {
        console.error('Failed to update status', err);
        alert('Failed to update book status');
      }
    });
  }

  deleteChapter(chapterId: string) {
    if (!confirm('Are you sure you want to delete this chapter? This cannot be undone.')) {
      return;
    }
    
    this.bookService.deleteChapter(this.book._id, chapterId).subscribe({
      next: () => {
        this.chapters = this.chapters.filter(c => c._id !== chapterId);
      },
      error: (err) => {
        console.error('Failed to delete chapter', err);
        alert('Failed to delete chapter. Please try again.');
      }
    });
  }
}
