import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  NavigationEnd,
} from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { ApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { Subject, filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-story-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SafeUrlPipe],
  template: `
    <div class="dashboard-page">
      @if (isLoading) {
        <div class="loading-state">Loading story details...</div>
      } @else if (book) {
        @if (book.status === 'pending') {
          <div class="status-banner pending-banner">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div class="banner-content">
              <strong>Pending Admin Approval:</strong> Your book contains Erotic content and is currently under review by our moderation team. It will be published automatically once approved.
            </div>
          </div>
        }
        <div class="dashboard-header">
          <div class="wrap">
            <div class="book-summary">
              <div class="book-cover-container">
                <img
                  [src]="
                    (api.getImageUrl(book.cover) | safeUrl) ||
                    'assets/default-cover.png'
                  "
                  [alt]="book.title"
                  class="book-cover"
                  (error)="onCoverError($event)"
                />
              </div>
              <div class="book-info">
                <h1>{{ book.title }}</h1>
                <div class="meta-row">
                  <span
                    class="status-badge"
                    [ngClass]="
                      book.completionStatus === 'completed'
                        ? 'completed'
                        : book.status
                    "
                    >{{
                      book.completionStatus === 'completed'
                        ? 'Completed'
                        : book.status
                    }}</span
                  >
                  <span class="genre">{{ book.genre }}</span>
                  <span>•</span>
                  <span style="display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {{ book.views || 0 }}
                  </span>
                  <span>•</span>
                  <span style="display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {{ book.likesCount || 0 }}
                  </span>
                </div>

                <div class="actions-row">
                  <button
                    class="btn-primary"
                    [routerLink]="['/write/book', book._id, 'chapter', 'new']"
                    [queryParams]="{ clear: 'true' }"
                  >
                    + Add New Chapter
                  </button>
                  @if (book.status === 'draft' || book.status === 'published') {
                    <button
                      class="btn-outline"
                      (click)="book.status === 'draft' ? showPublishModal() : togglePublishStatus()"
                      [style.borderColor]="book.status === 'draft' ? 'var(--forest)' : ''"
                      [style.color]="book.status === 'draft' ? 'var(--forest)' : ''"
                    >
                      {{ book.status === 'published' ? 'Unpublish Story' : 'Publish Story' }}
                    </button>
                  }

                  <!-- Publish Confirmation Modal -->
                  @if (publishModalVisible) {
                    <div class="publish-modal-overlay" (click)="closePublishModal()">
                      <div class="publish-modal" (click)="$event.stopPropagation()">
                        <div class="publish-modal-header">
                          <div class="publish-modal-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                              <path d="M2 17l10 5 10-5"/>
                              <path d="M2 12l10 5 10-5"/>
                            </svg>
                          </div>
                          <div>
                            <h3>Ready to Publish?</h3>
                            <p>Please review and accept the following before publishing.</p>
                          </div>
                          <button class="modal-close-btn" (click)="closePublishModal()">✕</button>
                        </div>

                        <div class="publish-modal-body">
                          <label class="policy-checkbox">
                            <input
                              type="checkbox"
                              [(ngModel)]="agreedToOriginal"
                              id="cb-original"
                            />
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label">
                              I confirm that this content is <strong>my original work</strong> and does not infringe on any third-party copyrights, trademarks, or intellectual property rights.
                            </span>
                          </label>

                          <label class="policy-checkbox">
                            <input
                              type="checkbox"
                              [(ngModel)]="agreedToTerms"
                              id="cb-terms"
                            />
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label">
                              I have read and agree to Mozhibu's
                              <a routerLink="/terms" target="_blank" class="policy-link">Terms of Service</a>
                              and
                              <a routerLink="/privacy" target="_blank" class="policy-link">Privacy Policy</a>.
                            </span>
                          </label>
                        </div>

                        <div class="publish-modal-footer">
                          <button class="btn-outline" (click)="closePublishModal()">Cancel</button>
                          <button
                            class="btn-primary"
                            [disabled]="!agreedToOriginal || !agreedToTerms"
                            (click)="confirmPublish()"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Publish Story
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                  <button
                    class="btn-outline"
                    [routerLink]="['/write/book', book._id, 'settings']"
                  >
                    Edit Story Settings
                  </button>
                  <button
                    class="btn-outline"
                    (click)="toggleCompletionStatus()"
                  >
                    {{
                      book.completionStatus === 'completed'
                        ? 'Mark as Ongoing'
                        : 'Mark as Completed'
                    }}
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
                      <div class="chapter-thumbnail">
                        <img
                          [src]="
                            chapter.cover
                              ? (api.getImageUrl(chapter.cover) | safeUrl)
                              : 'assets/default-cover.png'
                          "
                          [alt]="chapter.title"
                          (error)="onCoverError($event)"
                        />
                      </div>
                      <div class="chapter-text">
                        <span class="chapter-number"
                          >Chapter {{ chapter.order }}</span
                        >
                        <h4 class="chapter-title">{{ chapter.title }}</h4>
                      </div>
                    </div>
                    <div class="chapter-status">
                      <span
                        class="status-indicator"
                        [ngClass]="chapter.status"
                        >{{
                          chapter.status === 'published' ? 'Published' : 'Draft'
                        }}</span
                      >
                      <button
                        class="btn-outline btn-sm"
                        (click)="toggleChapterPublish(chapter)"
                      >
                        {{ chapter.status === 'published' ? 'Unpublish' : 'Publish' }}
                      </button>
                      <button
                        class="btn-outline btn-sm"
                        [routerLink]="[
                          '/write/book',
                          book._id,
                          'chapter',
                          chapter._id,
                        ]"
                      >
                        Edit
                      </button>
                      <button
                        class="btn-outline btn-sm"
                        style="color: #c62828; border-color: #ef9a9a;"
                        (click)="deleteChapter(chapter._id)"
                      >
                        Delete
                      </button>
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
  styles: [
    `
      .dashboard-page {
        min-height: 100vh;
        background: var(--paper-warm);
        padding-bottom: 80px;
      }
      .status-banner {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px 24px;
        font-size: 14px;
        line-height: 1.5;
        border-radius: 0;
      }
      .pending-banner {
        background: #fff8e6;
        color: #856404;
        border-bottom: 1px solid #ffeeba;
      }
      .banner-content strong {
        font-weight: 600;
        margin-right: 4px;
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
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
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

      .status-badge.published {
        background: rgba(63, 98, 89, 0.1);
        color: var(--forest);
      }
      .status-badge.ongoing {
        background: rgba(185, 139, 50, 0.1);
        color: var(--gold);
      }
      .status-badge.completed {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }

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
      .chapter-thumbnail img {
        width: 40px;
        height: 56px;
        border-radius: 4px;
        object-fit: cover;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .chapter-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
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

      .loading-state,
      .empty-state {
        padding: 48px;
        text-align: center;
        color: var(--ink-soft);
      }

      @media (max-width: 768px) {
        .wrap {
          padding: 0 16px;
        }

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
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 12px;
        }
      }

      /* Publish Confirmation Modal */
      .publish-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: fadeOverlay 0.2s ease;
      }

      @keyframes fadeOverlay {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .publish-modal {
        background: #fff;
        border-radius: 20px;
        padding: 32px;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 24px 64px rgba(0,0,0,0.3);
        animation: popModal 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes popModal {
        from { opacity: 0; transform: scale(0.92) translateY(12px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      .publish-modal-header {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 28px;
      }

      .publish-modal-icon {
        width: 52px;
        height: 52px;
        flex-shrink: 0;
        background: rgba(16, 185, 129, 0.1);
        color: var(--forest);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .publish-modal-header h3 {
        font-size: 18px;
        font-weight: 700;
        color: #111827;
        margin: 0 0 4px;
      }

      .publish-modal-header p {
        font-size: 13px;
        color: #6b7280;
        margin: 0;
      }

      .modal-close-btn {
        margin-left: auto;
        background: none;
        border: none;
        font-size: 18px;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        flex-shrink: 0;
        transition: color 0.2s;
      }

      .modal-close-btn:hover { color: #374151; }

      .publish-modal-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 28px;
      }

      .policy-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        cursor: pointer;
        padding: 16px;
        border-radius: 12px;
        border: 1.5px solid #e5e7eb;
        transition: border-color 0.2s, background 0.2s;
      }

      .policy-checkbox:has(input:checked) {
        border-color: var(--forest);
        background: rgba(16, 185, 129, 0.04);
      }

      .policy-checkbox input[type="checkbox"] {
        display: none;
      }

      .checkbox-custom {
        width: 22px;
        height: 22px;
        border-radius: 6px;
        border: 2px solid #d1d5db;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        margin-top: 1px;
        background: #fff;
      }

      .policy-checkbox input:checked + .checkbox-custom {
        background: var(--forest);
        border-color: var(--forest);
      }

      .policy-checkbox input:checked + .checkbox-custom::after {
        content: '';
        display: block;
        width: 6px;
        height: 10px;
        border: 2px solid #fff;
        border-top: none;
        border-left: none;
        transform: rotate(45deg) translateY(-1px);
      }

      .checkbox-label {
        font-size: 14px;
        color: #374151;
        line-height: 1.5;
      }

      .checkbox-label strong {
        color: #111827;
      }

      .policy-link {
        color: var(--forest);
        font-weight: 600;
        text-decoration: none;
      }

      .policy-link:hover {
        text-decoration: underline;
      }

      .publish-modal-footer {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .publish-modal-footer .btn-primary {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .publish-modal-footer .btn-primary:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
    `,
  ],
})
export class StoryDashboardComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private confirmService = inject(ConfirmService);
  api = inject(ApiService);
  private destroy$ = new Subject<void>();

  book: any = null;
  chapters: any[] = [];
  isLoading = true;
  totalWords = 0;
  private currentBookId: string | null = null;

  // Publish modal state
  publishModalVisible = false;
  agreedToOriginal = false;
  agreedToTerms = false;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.currentBookId = id;
      if (id) {
        this.fetchBookDetails(id);
      }
    });

    // Re-fetch on every NavigationEnd to pick up cover changes after returning from settings
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        if (this.currentBookId) {
          this.fetchBookDetails(this.currentBookId);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
      },
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
      },
    });
  }

  get completionPercentage(): number {
    if (
      !this.book ||
      !this.book.targetWordCount ||
      this.book.targetWordCount <= 0
    )
      return 0;
    return Math.min(
      100,
      Math.round((this.totalWords / this.book.targetWordCount) * 100),
    );
  }

  onCoverError(event: any) {
    event.target.src = this.api.getFallbackCover();
  }

  toggleCompletionStatus() {
    if (!this.book) return;

    const newStatus =
      this.book.completionStatus === 'completed' ? 'ongoing' : 'completed';
    this.bookService.updateBookStatus(this.book._id, newStatus).subscribe({
      next: (res) => {
        this.book.completionStatus = res.completionStatus;
      },
      error: (err) => {
        console.error('Failed to update status', err);
        this.showAlert('Failed to update book status');
      },
    });
  }

  showPublishModal() {
    if (!this.book) return;
    if (!this.book.cover) {
      this.showAlert('Please upload a cover image before publishing the story.');
      return;
    }
    const hasPublishedChapter = this.chapters.some(c => c.status === 'published');
    if (!hasPublishedChapter) {
      this.showAlert('You cannot publish a book without any published chapters.');
      return;
    }
    // Reset checkboxes each time
    this.agreedToOriginal = false;
    this.agreedToTerms = false;
    this.publishModalVisible = true;
  }

  closePublishModal() {
    this.publishModalVisible = false;
  }

  confirmPublish() {
    this.publishModalVisible = false;
    this.togglePublishStatus();
  }

  togglePublishStatus() {
    if (!this.book) return;

    const newStatus = this.book.status === 'published' ? 'draft' : 'published';

    if (newStatus === 'published' && !this.book.cover) {
      this.showAlert('Please upload a cover image before publishing the story.');
      return;
    }
    
    if (newStatus === 'published') {
      const hasPublishedChapter = this.chapters.some(c => c.status === 'published');
      if (!hasPublishedChapter) {
        this.showAlert('You cannot publish a book without any published chapters.');
        return;
      }
    }
    
    this.bookService.updateBook(this.book._id, { status: newStatus }).subscribe({
      next: (res) => {
        this.book.status = res.status;
      },
      error: (err) => {
        console.error('Failed to update publish status', err);
        const errorMsg = err.error?.msg || 'Failed to update story status';
        this.showAlert(errorMsg);
      },
    });
  }

  toggleChapterPublish(chapter: any) {
    if (!this.book) return;
    
    const newStatus = chapter.status === 'published' ? 'draft' : 'published';
    
    if (newStatus === 'published') {
      if (!chapter.cover) {
        this.showAlert('Please upload a cover image for this chapter before publishing.');
        return;
      }
    }
    
    this.bookService.updateChapter(this.book._id, chapter._id, { status: newStatus }).subscribe({
      next: (res) => {
        chapter.status = res.status;
      },
      error: (err) => {
        console.error('Failed to update chapter publish status', err);
        this.showAlert('Failed to update chapter status');
      }
    });
  }

  deleteChapter(chapterId: string) {
    this.confirmService
      .confirm(
        'Delete Chapter',
        'Are you sure you want to delete this chapter? This cannot be undone.',
        true,
        'Delete',
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.bookService.deleteChapter(this.book._id, chapterId).subscribe({
            next: () => {
              this.chapters = this.chapters.filter((c) => c._id !== chapterId);
            },
            error: (err) => {
              console.error('Failed to delete chapter', err);
              this.showAlert('Failed to delete chapter. Please try again.');
            },
          });
        }
      });
  }

  private showAlert(message: string) {
    this.confirmService.confirm('Notice', message, false, 'OK', '').subscribe();
  }
}
