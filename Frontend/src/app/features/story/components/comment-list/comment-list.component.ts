import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="comments-section" id="reviews-section">
      <!-- Ratings & Reviews Dashboard -->
      <div class="ratings-dashboard">
        <div class="dashboard-left">
          <h2>Ratings & Reviews</h2>
          <div class="avg-score">
            <span class="big-number">{{ averageRating }}</span>
            <div class="stars-display">
              @for (star of [1, 2, 3, 4, 5]; track star) {
                <svg
                  viewBox="0 0 24 24"
                  [attr.fill]="
                    star <= roundedAverageRating ? 'currentColor' : 'none'
                  "
                  [attr.stroke]="
                    star <= roundedAverageRating ? 'none' : 'currentColor'
                  "
                  stroke-width="2"
                  class="avg-star-icon"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  ></path>
                </svg>
              }
            </div>
          </div>
          <p class="total-reviews">{{ totalReviewsCount }} reviews</p>
        </div>

        <div class="dashboard-right">
          <div class="rating-bars">
            @for (dist of ratingDistribution; track dist.stars) {
              <div class="bar-row">
                <span class="star-label">{{ dist.stars }}</span>
                <svg
                  class="mini-star-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  ></path>
                </svg>
                <div class="progress-bar-bg">
                  <div
                    class="progress-bar-fill"
                    [style.width.%]="dist.percent"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Write Review/Comment Input -->
      <div class="comment-input-area write-review-box">
        <img [src]="currentUserAvatar" alt="You" class="avatar" />
        <div class="input-wrapper">
          @if (isFocused || newCommentText.trim().length > 0) {
            <div class="rating-selector">
              <span class="rating-label">Tap to Rate:</span>
              <div class="stars">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <svg
                    viewBox="0 0 24 24"
                    [attr.fill]="star <= newRating ? 'currentColor' : 'none'"
                    [attr.stroke]="star <= newRating ? 'none' : 'currentColor'"
                    stroke-width="2"
                    (click)="newRating = star"
                    class="star-icon"
                  >
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    ></path>
                  </svg>
                }
              </div>
            </div>
          }
          <textarea
            [(ngModel)]="newCommentText"
            [placeholder]="'Write a review (with rating)...'"
            rows="1"
            (focus)="isFocused = true"
            (blur)="onBlur()"
          ></textarea>

          @if (isFocused || newCommentText.trim().length > 0) {
            <div class="input-footer">
              <div class="emoji-picker">
                @for (emoji of quickEmojis; track emoji) {
                  <button
                    class="emoji-btn"
                    (click)="addEmojiToComment(emoji)"
                    type="button"
                  >
                    {{ emoji }}
                  </button>
                }
              </div>
              <div class="input-actions">
                <button class="btn-cancel" (click)="cancelComment()">
                  Cancel
                </button>
                <button
                  class="btn-submit"
                  [disabled]="!newCommentText.trim() || newRating === 0"
                  (click)="submitComment()"
                >
                  Post Review
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Comment Thread Template -->
      <ng-template #commentThread let-comment>
        <div class="comment-thread" [class.pinned]="comment.isPinned">
          <!-- Parent Comment -->
          <div class="comment-card" [class.highlight-pinned]="comment.isPinned">
            <img
              [src]="comment.authorAvatar"
              [alt]="comment.authorName"
              class="avatar"
            />
            <div class="comment-content">
              <div class="comment-header">
                <div class="comment-header-left">
                  <span class="author-name">{{ comment.authorName }}</span>
                  <span class="timestamp">{{ comment.timestamp }}</span>
                  @if (comment.isPinned) {
                    <span class="pinned-badge">📌 Pinned</span>
                  }
                  @if (comment.rating) {
                    <div class="comment-rating">
                      @for (star of [1, 2, 3, 4, 5]; track star) {
                        <svg
                          viewBox="0 0 24 24"
                          [attr.fill]="
                            star <= comment.rating ? 'currentColor' : 'none'
                          "
                          [attr.stroke]="
                            star <= comment.rating ? 'none' : 'currentColor'
                          "
                          stroke-width="2"
                          class="mini-star-icon"
                        >
                          <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          ></path>
                        </svg>
                      }
                    </div>
                  }
                </div>

                <!-- Three Dot Menu -->
                <div class="comment-menu-wrapper">
                  <button
                    class="btn-icon menu-btn"
                    (click)="toggleMenu(comment.id, $event)"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                  <div
                    class="comment-dropdown"
                    [class.open]="activeDropdownId === comment.id"
                  >
                    <button
                      *ngIf="isStoryAuthor"
                      class="dropdown-item"
                      (click)="pinComment(comment)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <line x1="12" y1="17" x2="12" y2="22"></line>
                        <path
                          d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"
                        ></path>
                      </svg>
                      {{ comment.isPinned ? 'Unpin' : 'Pin' }} Comment
                    </button>
                    <button
                      *ngIf="comment.authorName === currentUserName"
                      class="dropdown-item delete"
                      (click)="deleteComment(comment.id)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M3 6h18"></path>
                        <path
                          d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        ></path>
                      </svg>
                      Delete
                    </button>
                    <button
                      *ngIf="comment.authorName !== currentUserName"
                      class="dropdown-item"
                      (click)="reportComment(comment.id)"
                    >
                      <svg
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
                      Report
                    </button>
                  </div>
                </div>
              </div>

              <p class="comment-text">{{ comment.text }}</p>

              <div class="comment-actions">
                <button
                  class="btn-icon"
                  [class.active]="comment.isLiked"
                  (click)="toggleLike(comment.id)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    *ngIf="comment.isLiked"
                    stroke="none"
                  >
                    <path
                      d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                    ></path>
                  </svg>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    *ngIf="!comment.isLiked"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                    ></path>
                  </svg>
                  <span>{{ comment.likes }}</span>
                </button>
                <button
                  class="btn-icon"
                  [class.active]="comment.isDisliked"
                  (click)="toggleDislike(comment.id)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    *ngIf="comment.isDisliked"
                    stroke="none"
                  >
                    <path
                      d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                    ></path>
                  </svg>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    *ngIf="!comment.isDisliked"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                    ></path>
                  </svg>
                </button>
                <button
                  class="btn-text"
                  (click)="openReplyBox(comment.id, comment.id)"
                >
                  Reply
                </button>
              </div>

              <!-- Reply Input Box (Under Parent) -->
              <div
                class="comment-input-area reply-area"
                *ngIf="activeReplyId === comment.id"
              >
                <img
                  [src]="currentUserAvatar"
                  alt="You"
                  class="avatar avatar-sm"
                />
                <div class="input-wrapper">
                  <textarea
                    [(ngModel)]="replyText"
                    placeholder="Add a reply..."
                    rows="1"
                    #replyInputRef
                  ></textarea>

                  <div class="input-footer" *ngIf="replyText.trim().length > 0">
                    <div class="emoji-picker">
                      @for (emoji of quickEmojis; track emoji) {
                        <button
                          class="emoji-btn"
                          (click)="addEmojiToReply(emoji)"
                          type="button"
                        >
                          {{ emoji }}
                        </button>
                      }
                    </div>
                    <div class="input-actions">
                      <button
                        class="btn-cancel"
                        (click)="activeReplyId = null; replyText = ''"
                      >
                        Cancel
                      </button>
                      <button
                        class="btn-submit"
                        (click)="submitReply(comment.id)"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Nested Replies -->
              <div
                class="replies-list"
                *ngIf="comment.replies && comment.replies.length > 0"
              >
                @for (reply of (expandedReplies.has(comment.id) ? comment.replies : comment.replies.slice(0, 2)); track reply.id) {
                  <div class="comment-card reply-card">
                    <img
                      [src]="reply.authorAvatar"
                      [alt]="reply.authorName"
                      class="avatar avatar-sm"
                    />
                    <div class="comment-content">
                      <div class="comment-header">
                        <div class="comment-header-left">
                          <span class="author-name">{{
                            reply.authorName
                          }}</span>
                          <span class="timestamp">{{ reply.timestamp }}</span>
                        </div>

                        <div class="comment-menu-wrapper">
                          <button
                            class="btn-icon menu-btn"
                            (click)="toggleMenu(reply.id, $event)"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                            >
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="12" cy="5" r="1"></circle>
                              <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                          </button>
                          <div
                            class="comment-dropdown"
                            [class.open]="activeDropdownId === reply.id"
                          >
                            <button
                              *ngIf="reply.authorName === currentUserName"
                              class="dropdown-item delete"
                              (click)="deleteComment(reply.id)"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                              >
                                <path d="M3 6h18"></path>
                                <path
                                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                                ></path>
                              </svg>
                              Delete
                            </button>
                            <button
                              *ngIf="reply.authorName !== currentUserName"
                              class="dropdown-item"
                              (click)="reportComment(reply.id)"
                            >
                              <svg
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
                              Report
                            </button>
                          </div>
                        </div>
                      </div>

                      <p class="comment-text">
                        <span
                          class="mentioned-user"
                          *ngIf="reply.text && reply.text.startsWith('@')"
                          >{{ reply.text.split(' ')[0] }}</span
                        >
                        {{
                          reply.text && reply.text.startsWith('@')
                            ? reply.text.substring(reply.text.indexOf(' ') + 1)
                            : reply.text
                        }}
                      </p>

                      <!-- Reply actions -->
                      <div class="comment-actions">
                        <button
                          class="btn-icon"
                          [class.active]="reply.isLiked"
                          (click)="toggleLike(reply.id)"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            *ngIf="reply.isLiked"
                            stroke="none"
                          >
                            <path
                              d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                            ></path>
                          </svg>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            *ngIf="!reply.isLiked"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                            ></path>
                          </svg>
                          <span>{{ reply.likes }}</span>
                        </button>
                        <button
                          class="btn-icon"
                          [class.active]="reply.isDisliked"
                          (click)="toggleDislike(reply.id)"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            *ngIf="reply.isDisliked"
                            stroke="none"
                          >
                            <path
                              d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                            ></path>
                          </svg>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            *ngIf="!reply.isDisliked"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                            ></path>
                          </svg>
                        </button>
                        <button
                          class="btn-text"
                          (click)="
                            openReplyBox(reply.id, comment.id, reply.authorName)
                          "
                        >
                          Reply
                        </button>
                      </div>

                      <!-- Reply Input Box (Under Nested Reply) -->
                      <div
                        class="comment-input-area reply-area"
                        *ngIf="activeReplyId === reply.id"
                      >
                        <img
                          [src]="currentUserAvatar"
                          alt="You"
                          class="avatar avatar-sm"
                        />
                        <div class="input-wrapper">
                          <textarea
                            [(ngModel)]="replyText"
                            placeholder="Add a reply..."
                            rows="1"
                          ></textarea>

                          <div
                            class="input-footer"
                            *ngIf="replyText.trim().length > 0"
                          >
                            <div class="emoji-picker">
                              @for (emoji of quickEmojis; track emoji) {
                                <button
                                  class="emoji-btn"
                                  (click)="addEmojiToReply(emoji)"
                                  type="button"
                                >
                                  {{ emoji }}
                                </button>
                              }
                            </div>
                            <div class="input-actions">
                              <button
                                class="btn-cancel"
                                (click)="activeReplyId = null; replyText = ''"
                              >
                                Cancel
                              </button>
                              <button
                                class="btn-submit"
                                (click)="submitReply(comment.id)"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                
                @if (comment.replies.length > 2) {
                  <button class="btn-text" style="margin-top: 8px; color: var(--forest); margin-left: 0; padding-left: 0;" (click)="toggleReplies(comment.id)">
                    {{ expandedReplies.has(comment.id) ? 'Show less' : 'View ' + (comment.replies.length - 2) + ' more replies' }}
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </ng-template>

      <!-- Sort Navigation -->
      <div class="reviews-tabs">
        <div class="right-sort" style="margin-left: auto;">
          <span class="sort-label">Sort by:</span>
          <select [(ngModel)]="sortOrder" class="sort-select">
            <option value="popular">Top</option>
            <option value="newest">Recent</option>
          </select>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="reviews-list-container">
        <div class="comments-list" style="max-width: 800px;">
          @for (comment of sortedComments; track comment.id) {
            <ng-container
              *ngTemplateOutlet="
                commentThread;
                context: { $implicit: comment }
              "
            ></ng-container>
          }
        </div>
      </div>

      @if (hasMore) {
        <div class="load-more-container">
          <button
            class="btn-load-more"
            (click)="onLoadMore()"
            [disabled]="loadingMore"
          >
            {{ loadingMore ? 'Loading...' : 'Load More Comments' }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .comments-section {
        margin-top: 48px;
      }

      /* Two Column Grid Styles */
      .comments-reviews-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }
      .column-title {
        font-family: var(--display);
        font-size: 20px;
        color: var(--ink);
        margin-bottom: 24px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--border-soft);
      }
      @media (max-width: 900px) {
        .comments-reviews-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Ratings Dashboard Styles */
      .ratings-dashboard {
        display: flex;
        gap: 40px;
        margin-bottom: 32px;
        align-items: flex-end;
      }
      .dashboard-left {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-width: 150px;
      }
      .dashboard-left h2 {
        font-family: var(--display);
        font-size: 20px;
        color: var(--ink);
        margin: 0 0 16px 0;
      }
      .avg-score {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;
      }
      .big-number {
        font-size: 48px;
        font-weight: 700;
        color: var(--ink);
        line-height: 1;
      }
      .stars-display {
        display: flex;
        gap: 2px;
      }
      .avg-star-icon {
        width: 20px;
        height: 20px;
        color: #ffb800;
      }
      .total-reviews {
        font-size: 14px;
        color: var(--ink-soft);
        margin: 0;
      }

      .dashboard-right {
        flex: 1;
        max-width: 320px;
      }
      .rating-bars {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .bar-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .star-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--ink);
        width: 10px;
        text-align: right;
      }
      .mini-star-icon {
        width: 12px;
        height: 12px;
        color: #ffb800;
      }
      .progress-bar-bg {
        flex: 1;
        height: 6px;
        background: var(--border-soft);
        border-radius: 4px;
        overflow: hidden;
      }
      .progress-bar-fill {
        height: 100%;
        background: var(--forest);
        border-radius: 4px;
        transition: width 0.5s ease;
      }

      /* Write Review Section */
      .write-review-box {
        background: var(--paper-soft);
        padding: 16px;
        border-radius: 12px;
        border: 1px solid var(--border-soft);
      }

      /* Load More Styles */
      .load-more-container {
        display: flex;
        justify-content: center;
        padding: 20px 0;
      }
      .btn-load-more {
        background: var(--paper-soft);
        border: 1px solid var(--border-soft);
        color: var(--ink);
        padding: 10px 24px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-load-more:hover:not(:disabled) {
        background: var(--border-soft);
      }
      .btn-load-more:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* Tabs */
      .reviews-tabs {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-soft);
        margin-bottom: 24px;
      }
      .left-tabs {
        display: flex;
        gap: 24px;
      }
      .right-sort {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .sort-label {
        font-size: 13px;
        color: var(--ink-soft);
      }
      .sort-select {
        background: var(--paper-soft);
        border: 1px solid var(--border-soft);
        color: var(--ink);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 13px;
        outline: none;
        cursor: pointer;
      }
      .tab-btn {
        background: transparent;
        border: none;
        font-size: 15px;
        font-weight: 600;
        color: var(--ink-soft);
        padding: 12px 0;
        cursor: pointer;
        position: relative;
        transition: color 0.2s;
      }
      .tab-btn:hover {
        color: var(--ink);
      }
      .tab-btn.active {
        color: var(--ink);
      }
      .tab-btn.active::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--forest);
      }

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .rating-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }
      .rating-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--ink);
      }
      .stars {
        display: flex;
        gap: 4px;
      }
      .star-icon {
        width: 28px;
        height: 28px;
        color: #ffb800;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .star-icon:hover {
        transform: scale(1.1);
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
      .write-review-box textarea {
        border-bottom: none;
        background: var(--paper);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid var(--border-soft);
      }
      .write-review-box textarea:focus {
        border-color: var(--forest);
      }
      textarea:focus {
        border-bottom-color: var(--ink);
      }
      .input-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
      }
      .emoji-picker {
        display: flex;
        gap: 4px;
      }
      .emoji-btn {
        background: transparent;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition:
          background 0.2s,
          transform 0.1s;
      }
      .emoji-btn:hover {
        background: var(--paper-soft);
        transform: scale(1.1);
      }
      .input-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .btn-cancel,
      .btn-submit {
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
      .btn-cancel:hover {
        background: var(--paper-soft);
      }
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
        padding: 12px;
        border-radius: 8px;
        transition: background-color 0.3s ease;
      }
      .comment-card:hover {
        background-color: var(--paper-warm);
      }
      .highlight-pinned {
        background-color: var(--paper-soft);
        border-left: 3px solid var(--forest);
      }
      .comment-content {
        flex: 1;
      }
      .comment-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      .comment-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .pinned-badge {
        font-size: 11px;
        font-weight: 700;
        color: var(--forest);
        background: var(--forest-tint);
        padding: 2px 6px;
        border-radius: 100px;
        text-transform: uppercase;
      }
      .comment-rating {
        display: flex;
        gap: 2px;
        margin-left: 8px;
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
      .mentioned-user {
        color: var(--forest);
        font-weight: 600;
      }
      .comment-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .comment-menu-wrapper {
        position: relative;
      }
      .comment-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 100;
        min-width: 160px;
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      .comment-dropdown.open {
        display: flex;
      }
      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border: none;
        background: transparent;
        color: var(--ink);
        font-size: 14px;
        cursor: pointer;
        text-align: left;
        transition: background 0.2s;
      }
      .dropdown-item svg {
        width: 16px;
        height: 16px;
      }
      .dropdown-item:hover {
        background: var(--paper-soft);
      }
      .dropdown-item.delete {
        color: #e53935;
      }

      .btn-icon {
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: var(--ink-soft);
        cursor: pointer;
        font-size: 13px;
        padding: 6px;
        border-radius: 50%;
        transition:
          background-color 0.2s ease,
          color 0.2s ease;
      }
      .btn-icon:hover {
        color: var(--ink);
        background-color: var(--paper-soft);
      }
      .btn-icon.active {
        color: var(--ink);
      }
      .btn-icon.active svg {
        animation: popBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)
          forwards;
      }
      .btn-icon svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }
      .menu-btn {
        padding: 4px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .comment-card:hover .menu-btn {
        opacity: 1;
      }

      .btn-text {
        background: transparent;
        border: none;
        font-size: 13px;
        font-weight: 600;
        color: var(--ink-soft);
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 100px;
        margin-left: 8px;
      }
      .btn-text:hover {
        color: var(--ink);
        background-color: var(--paper-soft);
      }

      .star-icon {
        cursor: pointer;
        transition: transform 0.1s;
      }
      .star-icon:hover {
        transform: scale(1.1);
      }

      @keyframes popBounce {
        0% {
          transform: scale(1);
        }
        40% {
          transform: scale(1.3);
        }
        100% {
          transform: scale(1);
        }
      }

      .comment-thread {
        display: flex;
        flex-direction: column;
      }
      .reply-area {
        margin-top: 16px;
        margin-bottom: 16px;
      }
      .replies-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-top: 16px;
      }
      .reply-card {
        margin-top: 0;
      }
      .avatar-sm {
        width: 28px;
        height: 28px;
      }

      @media (max-width: 768px) {
        .ratings-dashboard {
          flex-direction: column;
          gap: 24px;
          align-items: flex-start;
        }
        .dashboard-right {
          width: 100%;
          max-width: none;
        }
      }

      @media (max-width: 480px) {
        .avatar {
          width: 32px;
          height: 32px;
        }
        .comment-input-area {
          gap: 10px;
        }
        .comment-card {
          gap: 10px;
        }
        h2 {
          font-size: 17px;
        }
        .big-number {
          font-size: 36px;
        }
      }
    `,
  ],
})
export class CommentListComponent {
  @Input() comments: any[] = [];
  @Input() currentUserAvatar = '';
  @Input() storyAuthorName = '';
  @Input() hasMore = false;
  @Input() loadingMore = false;

  public api = inject(ApiService);
  public authService = inject(AuthService);
  private confirmService = inject(ConfirmService);

  get currentUserName(): string {
    const user = this.authService.user();
    return user ? user.username : '';
  }

  get isStoryAuthor(): boolean {
    return (
      !!this.storyAuthorName && this.currentUserName === this.storyAuthorName
    );
  }

  // Rating Dashboard Logic
  get ratedComments() {
    return this.comments.filter(
      (c) => typeof c.rating === 'number' && c.rating > 0,
    );
  }

  get unratedComments() {
    return this.comments.filter((c) => !c.rating || c.rating === 0);
  }

  get totalReviewsCount(): number {
    return this.comments.length;
  }

  get averageRating(): string {
    const rated = this.ratedComments;
    if (!rated.length) return '0.0';
    const sum = rated.reduce((acc, c) => acc + c.rating, 0);
    return (sum / rated.length).toFixed(1);
  }

  get roundedAverageRating(): number {
    return Math.round(parseFloat(this.averageRating));
  }

  get ratingDistribution() {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const rated = this.ratedComments;
    rated.forEach((c) => {
      if (dist[c.rating as keyof typeof dist] !== undefined) {
        dist[c.rating as keyof typeof dist]++;
      }
    });

    const total = rated.length || 1;

    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: dist[stars as keyof typeof dist],
      percent: (dist[stars as keyof typeof dist] / total) * 100,
    }));
  }

  sortOrder: 'newest' | 'popular' = 'popular';

  get sortedComments() {
    return this.sortList(this.comments);
  }

  private sortList(source: any[]) {
    let sorted = [...source];

    if (this.sortOrder === 'newest') {
      sorted.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    } else if (this.sortOrder === 'popular') {
      sorted.sort((a, b) => b.likes - a.likes);
    }

    // Always keep pinned comments at top
    sorted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    return sorted;
  }

  getAvatarUrl(path: string | undefined, name?: string): string {
    if (!path) return this.api.getFallbackAvatar(name);
    return this.api.getImageUrl(path);
  }

  onAvatarError(event: any, name?: string) {
    event.target.src = this.api.getFallbackAvatar(name);
  }

  @Output() postComment = new EventEmitter<{ text: string; rating: number }>();
  @Output() likeComment = new EventEmitter<string>();
  @Output() dislikeComment = new EventEmitter<string>();
  @Output() postReply = new EventEmitter<{ parentId: string; text: string }>();
  @Output() loadMore = new EventEmitter<void>();

  expandedReplies = new Set<string>();

  toggleReplies(commentId: string) {
    if (this.expandedReplies.has(commentId)) {
      this.expandedReplies.delete(commentId);
    } else {
      this.expandedReplies.add(commentId);
    }
  }

  newCommentText = '';
  newRating = 0;
  isFocused = false;
  activeReplyId: string | null = null;
  replyText = '';

  activeDropdownId: string | null = null;
  quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏'];

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.comment-menu-wrapper')) {
      this.activeDropdownId = null;
    }
  }

  toggleMenu(commentId: string, event: Event) {
    event.stopPropagation();
    this.activeDropdownId =
      this.activeDropdownId === commentId ? null : commentId;
  }

  addEmojiToComment(emoji: string) {
    this.newCommentText += emoji;
  }

  addEmojiToReply(emoji: string) {
    this.replyText += emoji;
  }

  openReplyBox(
    replyToId: string,
    parentCommentId: string,
    authorName?: string,
  ) {
    this.activeReplyId = this.activeReplyId === replyToId ? null : replyToId;
    if (this.activeReplyId && authorName) {
      this.replyText = `@${authorName} `;
    } else {
      this.replyText = '';
    }
  }

  deleteComment(id: string) {
    this.confirmService
      .confirm(
        'Delete Comment',
        'Are you sure you want to delete this comment?',
        true,
        'Delete',
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.comments = this.comments.filter((c) => {
            if (c.id === id) return false;
            if (c.replies) {
              c.replies = c.replies.filter((r: any) => r.id !== id);
            }
            return true;
          });
          alert('Comment deleted. (Backend integration required)');
        }
      });
    this.activeDropdownId = null;
  }

  pinComment(comment: any) {
    comment.isPinned = !comment.isPinned;
    if (comment.isPinned) {
      alert('Comment pinned to top!');
    }
    this.activeDropdownId = null;
  }

  reportComment(id: string) {
    const reason = prompt(
      'Why are you reporting this comment? (e.g. spam, harassment)',
    );
    if (reason) {
      alert('Report submitted successfully.');
    }
    this.activeDropdownId = null;
  }

  onBlur() {
    setTimeout(() => {
      if (!this.newCommentText.trim()) {
        this.isFocused = false;
      }
    }, 200);
  }

  cancelComment() {
    this.newCommentText = '';
    this.newRating = 0;
    this.isFocused = false;
  }

  submitComment() {
    if (this.newCommentText.trim() && this.newRating > 0) {
      const ratingToSubmit = this.newRating;
      this.postComment.emit({
        text: this.newCommentText.trim(),
        rating: ratingToSubmit,
      });
      this.newCommentText = '';
      this.newRating = 0;
      this.isFocused = false;
    }
  }

  toggleLike(commentId: string) {
    this.likeComment.emit(commentId);
  }

  toggleDislike(commentId: string) {
    this.dislikeComment.emit(commentId);
  }

  submitReply(parentId: string) {
    if (this.replyText.trim()) {
      this.postReply.emit({ parentId, text: this.replyText.trim() });
      this.activeReplyId = null;
      this.replyText = '';
    }
  }

  onLoadMore() {
    this.loadMore.emit();
  }
}
