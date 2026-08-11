import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoryComment } from '../../../../core/services/story.service';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="comments-section">
      <h2>Comments ({{ comments.length }})</h2>

      <!-- Comment Input -->
      <div class="comment-input-area">
        <img [src]="currentUserAvatar" alt="You" class="avatar">
        <div class="input-wrapper">
          <textarea 
            [(ngModel)]="newCommentText" 
            placeholder="Add a public comment..."
            rows="1"
            (focus)="isFocused = true"
            (blur)="onBlur()"
          ></textarea>
          @if (isFocused || newCommentText.trim().length > 0) {
            <div class="input-actions">
              <button class="btn-cancel" (click)="cancelComment()">Cancel</button>
              <button class="btn-submit" [disabled]="!newCommentText.trim()" (click)="submitComment()">Comment</button>
            </div>
          }
        </div>
      </div>

      <!-- Comment List -->
      <div class="comments-list">
        @for (comment of comments; track comment.id) {
          <div class="comment-card">
            <img [src]="comment.authorAvatar" [alt]="comment.authorName" class="avatar">
            <div class="comment-content">
              <div class="comment-header">
                <span class="author-name">{{ comment.authorName }}</span>
                <span class="timestamp">{{ comment.timestamp }}</span>
              </div>
              <p class="comment-text">{{ comment.text }}</p>
              <div class="comment-actions">
                <button class="btn-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  <span>{{ comment.likes }}</span>
                </button>
                <button class="btn-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
                </button>
                <button class="btn-text">Reply</button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .comments-section {
      margin-top: 48px;
    }
    h2 {
      font-family: var(--display);
      font-size: 20px;
      margin-bottom: 24px;
      color: var(--ink);
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    
    .comment-input-area {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }
    .input-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    textarea {
      width: 100%;
      border: none;
      border-bottom: 1px solid var(--border-soft);
      background: transparent;
      padding: 8px 0;
      font-size: 14px;
      color: var(--ink);
      resize: none;
      outline: none;
      transition: border-color 0.2s;
    }
    textarea:focus {
      border-bottom-color: var(--ink);
    }
    .input-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
    }
    .btn-cancel, .btn-submit {
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }
    .btn-cancel {
      background: transparent;
      color: var(--ink);
    }
    .btn-cancel:hover { background: var(--paper-soft); }
    .btn-submit {
      background: var(--forest);
      color: white;
    }
    .btn-submit:disabled {
      background: var(--border-soft);
      color: var(--ink-soft);
      cursor: not-allowed;
    }
    
    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .comment-card {
      display: flex;
      gap: 16px;
    }
    .comment-content {
      flex: 1;
    }
    .comment-header {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 4px;
    }
    .author-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--ink);
    }
    .timestamp {
      font-size: 12px;
      color: var(--ink-soft);
    }
    .comment-text {
      font-size: 14px;
      color: var(--ink);
      line-height: 1.5;
      margin-bottom: 8px;
    }
    .comment-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .btn-icon {
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--ink-soft);
      cursor: pointer;
      font-size: 13px;
    }
    .btn-icon:hover { color: var(--ink); }
    .btn-icon svg { width: 16px; height: 16px; }
    .btn-text { background: transparent; border: none; font-size: 13px; font-weight: 600; color: var(--ink-soft); cursor: pointer; }
    .btn-text:hover { color: var(--ink); }

    @media (max-width: 480px) {
      .avatar { width: 32px; height: 32px; }
      .comment-input-area { gap: 10px; }
      .comment-card { gap: 10px; }
      h2 { font-size: 17px; }
    }
  `]
})
export class CommentListComponent {
  @Input() comments: StoryComment[] = [];
  @Input() currentUserAvatar = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&q=80';
  @Output() postComment = new EventEmitter<string>();

  newCommentText = '';
  isFocused = false;

  onBlur() {
    setTimeout(() => {
      if (!this.newCommentText.trim()) {
        this.isFocused = false;
      }
    }, 200);
  }

  cancelComment() {
    this.newCommentText = '';
    this.isFocused = false;
  }

  submitComment() {
    if (this.newCommentText.trim()) {
      this.postComment.emit(this.newCommentText.trim());
      this.newCommentText = '';
      this.isFocused = false;
    }
  }
}
