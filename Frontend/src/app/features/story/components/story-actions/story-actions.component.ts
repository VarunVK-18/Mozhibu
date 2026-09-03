import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-story-actions',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="actions-container">
      <button 
        class="btn-primary" 
        [disabled]="chapterCount === 0"
        (click)="readClicked.emit()">
        <svg
          class="icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        {{
          chapterCount === 0
            ? 'No Chapters Yet'
            : accessType === 'premium' && !isPremiumSubscriber
              ? 'Unlock Premium'
              : userProgress.hasStarted
                ? 'Resume Reading'
                : 'Start Reading'
        }}
      </button>

      <button
        class="action-btn bookmark-btn"
        [class.active]="isBookmarked"
        (click)="bookmarkClicked.emit()"
      >
        <svg
          class="icon"
          viewBox="0 0 24 24"
          [attr.fill]="isBookmarked ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="count">{{ bookmarks }}</span>
      </button>

      <button
        class="action-btn like-btn"
        [class.active]="isLiked"
        (click)="likeClicked.emit()"
      >
        <svg
          class="icon"
          viewBox="0 0 24 24"
          [attr.fill]="isLiked ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          ></path>
        </svg>
        <span class="count">{{ likes }}</span>
      </button>

      <button
        class="action-btn favorite-btn"
        [class.active]="isFavorited"
        (click)="favoriteClicked.emit()"
      >
        <svg
          class="icon"
          viewBox="0 0 24 24"
          [attr.fill]="isFavorited ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <span class="count">{{ favorites }}</span>
      </button>

      <div class="divider"></div>

      <button
        class="action-btn icon-only"
        title="Download"
        (click)="downloadClicked.emit()"
      >
        <svg
          class="icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </button>

      <button
        class="action-btn icon-only"
        title="Share"
        (click)="showShareModal = true"
      >
        <svg
          class="icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </button>

      @if (!isAuthor) {
      <button
        class="action-btn icon-only text-rose"
        title="Report"
        (click)="showReportModal = true"
      >
        <svg
          class="icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
          ></path>
          <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
      </button>
      }
    </div>

    <!-- Modals (Simple overlays) -->
    @if (showShareModal) {
      <div class="modal-backdrop" (click)="showShareModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Share this story</h3>
          <p>Share a link to this story with your friends.</p>
          <div class="share-box">
            <input
              type="text"
              readonly
              [value]="currentUrl"
              class="share-input"
            />
            <button class="btn-primary" (click)="copyLink()">Copy</button>
          </div>
          @if (showCopyToast) {
            <p class="toast-text text-success">Link copied to clipboard!</p>
          }
        </div>
      </div>
    }

    @if (showReportModal) {
      <div class="modal-backdrop" (click)="showReportModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>{{ 'reportModal.title' | translate }}</h3>
          <p>{{ 'reportModal.subtitle' | translate }}</p>
          <select class="report-select" #reportReason>
            <option value="plagiarism">{{ 'reportModal.plagiarism' | translate }}</option>
            <option value="inappropriate">{{ 'reportModal.inappropriate' | translate }}</option>
            <option value="spam">{{ 'reportModal.spam' | translate }}</option>
            <option value="other">{{ 'reportModal.other' | translate }}</option>
          </select>
          <textarea
            class="report-comment"
            #reportComment
            [placeholder]="'reportModal.placeholder' | translate"
            rows="3"
            (input)="onReportCommentInput($event)"
          ></textarea>
          <div class="word-count" [class.over-limit]="reportWordCount > 100">
            {{ reportWordCount }}/100 words
          </div>
          <div class="modal-actions">
            <button class="btn-outline" (click)="showReportModal = false">
              {{ 'reportModal.cancel' | translate }}
            </button>
            <button
              class="btn-primary btn-danger"
              [disabled]="reportWordCount > 100"
              (click)="submitReport(reportReason.value, reportComment.value)"
            >
              {{ 'reportModal.submit' | translate }}
            </button>
          </div>
          @if (showReportToast) {
            <p class="toast-text text-success">
              {{ 'reportModal.success' | translate }}
            </p>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .actions-container {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 24px 0;
        flex-wrap: wrap;
      }

      .btn-primary {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--forest);
        color: white;
        border: none;
        border-radius: var(--radius-m);
        padding: 12px 24px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .btn-primary:hover {
        opacity: 0.9;
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--paper);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 10px 16px;
        color: var(--ink);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .action-btn:hover {
        background: var(--paper-soft);
      }
      .action-btn.active.like-btn {
        color: var(--rose);
        border-color: var(--border-soft);
        background: var(--paper);
      }
      .action-btn.active.bookmark-btn {
        color: var(--forest);
        border-color: var(--border-soft);
        background: var(--paper);
      }
      .action-btn.icon-only {
        padding: 10px;
      }

      .icon {
        width: 18px;
        height: 18px;
      }
      .text-rose {
        color: var(--rose);
      }
      .text-rose:hover {
        background: var(--rose-tint);
        border-color: var(--rose-tint);
      }

      .divider {
        width: 1px;
        height: 24px;
        background: var(--border-soft);
        margin: 0 8px;
      }

      /* Modal Styles */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal-content {
        background: var(--card);
        border-radius: var(--radius-l);
        padding: 32px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }
      .modal-content h3 {
        font-family: var(--display);
        font-size: 20px;
        margin-bottom: 8px;
      }
      .modal-content p {
        color: var(--ink-soft);
        font-size: 14px;
        margin-bottom: 24px;
      }

      .share-box {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      .share-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        font-size: 14px;
        background: var(--paper);
        color: var(--ink-soft);
        outline: none;
      }

      .report-select {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        font-size: 14px;
        margin-bottom: 12px;
        outline: none;
      }

      .report-comment {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        font-size: 14px;
        margin-bottom: 24px;
        outline: none;
        font-family: inherit;
        resize: vertical;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      .btn-outline {
        background: transparent;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 10px 20px;
        font-weight: 500;
        cursor: pointer;
      }
      .btn-danger {
        background: var(--rose);
      }

      .toast-text {
        font-size: 13px !important;
        margin-bottom: 0 !important;
        font-weight: 500;
      }
      .text-success {
        color: var(--forest);
      }
      .word-count {
        font-size: 12px;
        color: var(--ink-faint);
        text-align: right;
        margin-top: -20px;
        margin-bottom: 16px;
      }
      .word-count.over-limit {
        color: var(--rose);
        font-weight: 600;
      }

      @media (max-width: 600px) {
        .actions-container {
          gap: 8px;
        }
        .btn-primary {
          padding: 10px 18px;
          font-size: 14px;
        }
        .action-btn {
          padding: 8px 12px;
          font-size: 13px;
        }
        .modal-content {
          margin: 0 16px;
          padding: 24px 20px;
        }
        .share-box {
          flex-direction: column;
        }
        .modal-actions {
          flex-direction: column;
        }
        .modal-actions button {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
})
export class StoryActionsComponent {
  @Input() userProgress!: { hasStarted: boolean };
  @Input() chapterCount = 0;
  @Input() isBookmarked = false;
  @Input() isLiked = false;
  @Input() isFavorited = false;
  @Input() bookmarks = 0;
  @Input() likes = 0;
  @Input() favorites = 0;
  @Input() accessType?: string;
  @Input() isPremiumSubscriber = false;
  @Input() isAuthor = false;

  @Output() readClicked = new EventEmitter<void>();
  @Output() bookmarkClicked = new EventEmitter<void>();
  @Output() likeClicked = new EventEmitter<void>();
  @Output() favoriteClicked = new EventEmitter<void>();
  @Output() downloadClicked = new EventEmitter<void>();
  @Output() reportSubmitted = new EventEmitter<{ reason: string; comment: string }>();

  showShareModal = false;
  showReportModal = false;
  showCopyToast = false;
  showReportToast = false;
  reportWordCount = 0;
  get currentUrl(): string {
    return window.location.href;
  }

  copyLink() {
    navigator.clipboard.writeText(this.currentUrl);
    this.showCopyToast = true;
    setTimeout(() => {
      this.showCopyToast = false;
      this.showShareModal = false;
    }, 1500);
  }

  onReportCommentInput(event: Event) {
    const text = (event.target as HTMLTextAreaElement).value.trim();
    this.reportWordCount = text ? text.split(/\s+/).length : 0;
  }

  submitReport(reason: string, comment: string) {
    this.reportSubmitted.emit({ reason, comment });
    this.showReportToast = true;
    setTimeout(() => {
      this.showReportToast = false;
      this.showReportModal = false;
    }, 1500);
  }
}

