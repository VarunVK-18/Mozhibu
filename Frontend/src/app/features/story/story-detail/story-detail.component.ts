import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StoryService } from '../../../core/services/story.service';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { BookService } from '../../../core/services/book.service';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

import { StoryHeroComponent } from '../components/story-hero/story-hero.component';
import { StoryMetaRowComponent } from '../components/story-meta-row/story-meta-row.component';
import { StoryActionsComponent } from '../components/story-actions/story-actions.component';
import { ChapterListComponent } from '../components/chapter-list/chapter-list.component';
import { CommentListComponent } from '../components/comment-list/comment-list.component';
import { StoryCardComponent } from '../../../shared/components/story-card/story-card.component';
import { DownloadModalComponent } from '../../../shared/components/download-modal/download-modal.component';
import { OfflineService } from '../../../core/services/offline.service';

@Component({
  selector: 'app-story-detail',
  standalone: true,
  imports: [
    CommonModule,
    StoryHeroComponent,
    StoryMetaRowComponent,
    StoryActionsComponent,
    ChapterListComponent,
    CommentListComponent,
    StoryCardComponent,
    DownloadModalComponent,
  ],
  template: `
    <div class="story-detail-page">
      @if (showDownloadModal()) {
        <app-download-modal
          (close)="showDownloadModal.set(false)"
          (confirm)="onDownloadConfirmed($event)"
        ></app-download-modal>
      }

      @if (offlineService.downloadProgress().status) {
        <div class="download-toast">
          {{ offlineService.downloadProgress().status }}
        </div>
      }

      @if (showAgeWarning()) {
        <div class="modal-overlay" (click)="showAgeWarning.set(false)">
          <div class="modal-container warning-modal" (click)="$event.stopPropagation()">
            <div class="modal-header warning-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="warning-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3>Access Denied</h3>
            </div>
            <div class="modal-body">
              <p>{{ ageWarningMessage() }}</p>
            </div>
            <div class="modal-actions">
              <button class="btn-confirm warning-btn" (click)="showAgeWarning.set(false)">Understood</button>
            </div>
          </div>
        </div>
      }

      @if (story()) {
        <app-story-hero
          [title]="story()!.title"
          [subtitle]="story()!.subtitle"
          [coverImage]="story()!.coverImage"
          [author]="story()!.author"
          [genres]="story()!.genres"
          [accessType]="story()!.accessType"
          (authorClicked)="goToAuthor($event)"
        ></app-story-hero>

        <div class="content-wrapper">
          <app-story-meta-row
            [readingTime]="story()!.readingTime"
            [views]="story()!.views"
            [rating]="story()!.rating"
            [reviewCount]="story()!.reviewCount"
            [chapterCount]="story()!.chapterCount"
            [status]="story()!.status"
            [language]="story()!.language"
            [updatedDate]="story()!.updatedDate"
          ></app-story-meta-row>

          <app-story-actions
            [userProgress]="story()!.userProgress"
            [isBookmarked]="story()!.isBookmarked"
            [isLiked]="story()!.isLiked"
            [bookmarks]="story()!.bookmarks"
            [likes]="story()!.likes"
            [accessType]="story()!.accessType"
            [isPremiumSubscriber]="isPremiumSubscriber()"
            (readClicked)="onReadClicked()"
            (bookmarkClicked)="onBookmarkClicked()"
            (likeClicked)="onLikeClicked()"
            (downloadClicked)="onDownloadClicked()"
            (reportSubmitted)="onReportSubmitted($event)"
          ></app-story-actions>

          <div class="synopsis-section">
            <h3>Synopsis</h3>
            <p [class.expanded]="synopsisExpanded()">
              {{ story()!.synopsis }}
            </p>
            <button
              class="btn-read-more"
              (click)="synopsisExpanded.set(!synopsisExpanded())"
            >
              {{ synopsisExpanded() ? 'Read Less' : 'Read More' }}
            </button>
          </div>

          <app-chapter-list
            [episodes]="episodes()"
            [storyId]="story()?.id || ''"
            (chapterClick)="onReadClicked($event)"
          ></app-chapter-list>

          <app-comment-list
            [comments]="comments()"
            [currentUserAvatar]="getAvatarUrl(currentUser()?.avatar)"
            [storyAuthorName]="story()?.author?.name || ''"
            [hasMore]="
              storyService.commentsPage() < storyService.commentsTotalPages()
            "
            [loadingMore]="storyService.loadingMoreComments()"
            (postComment)="onPostComment($event)"
            (likeComment)="onLikeComment($event)"
            (dislikeComment)="onDislikeComment($event)"
            (postReply)="onPostReply($event)"
            (loadMore)="onLoadMoreComments()"
          ></app-comment-list>

          <!-- Related Stories -->
          <div class="related-section">
            <h2>More like this</h2>
            <div class="related-grid">
              @for (related of relatedStories(); track related.id) {
                <app-story-card [story]="related"></app-story-card>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .story-detail-page {
        width: 100%;
        min-height: 100vh;
        background: var(--paper);
      }

      .content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 40px 80px;
      }

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.2s ease-out;
      }

      .modal-container {
        background: var(--card, #fff);
        width: 90%;
        max-width: 400px;
        border-radius: var(--radius-l, 16px);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        animation: slideUp 0.2s ease-out;
      }

      .modal-header {
        padding: 24px 24px 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .warning-header {
        color: #dc2626;
      }
      
      .warning-header h3 {
        margin: 0;
        font-size: 20px;
        font-family: var(--display, 'Inter', sans-serif);
      }

      .warning-icon {
        color: #dc2626;
      }

      .modal-body {
        padding: 0 24px 24px;
        text-align: center;
      }

      .modal-body p {
        margin: 0;
        font-size: 15px;
        color: var(--ink-soft, #5a554c);
        line-height: 1.5;
      }

      .modal-actions {
        padding: 16px 24px;
        background: var(--surface-soft, #f7f6f4);
        display: flex;
        justify-content: center;
      }

      .btn-confirm.warning-btn {
        background: #dc2626;
        color: white;
        border: none;
        padding: 12px 32px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }

      .btn-confirm.warning-btn:hover {
        background: #b91c1c;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .synopsis-section {
        margin-top: 32px;
      }
      .synopsis-section h3 {
        font-family: var(--display);
        font-size: 20px;
        margin-bottom: 12px;
        color: var(--ink);
      }
      .synopsis-section p {
        font-size: 15px;
        color: var(--ink-soft);
        line-height: 1.6;
        white-space: pre-line;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: all 0.3s;
      }
      .synopsis-section p.expanded {
        -webkit-line-clamp: unset;
      }

      .btn-read-more {
        background: transparent;
        border: none;
        color: var(--forest);
        font-weight: 600;
        font-size: 14px;
        padding: 8px 0;
        cursor: pointer;
        margin-top: 4px;
      }
      .btn-read-more:hover {
        text-decoration: underline;
      }

      .related-section {
        margin-top: 64px;
      }
      .related-section h2 {
        font-family: var(--display);
        font-size: 24px;
        margin-bottom: 24px;
        color: var(--ink);
      }
      .related-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 24px;
      }

      @media (max-width: 768px) {
        .content-wrapper {
          padding: 0 20px 40px;
        }
        .related-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
      }

      .download-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--ink);
        color: white;
        padding: 12px 24px;
        border-radius: 100px;
        font-weight: 500;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideUp 0.3s ease-out;
      }
    `,
  ],
})
export class StoryDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  storyService = inject(StoryService);
  authService = inject(AuthService);
  subService = inject(SubscriptionService);
  private bookService = inject(BookService);
  public offlineService = inject(OfflineService);
  api = inject(ApiService);

  story = this.storyService.getActiveStory();
  episodes = this.storyService.getEpisodes();
  comments = this.storyService.getComments();
  currentUser = this.authService.user;

  synopsisExpanded = signal(false);
  isPremiumSubscriber = signal(false);
  relatedStories = signal<any[]>([]);
  showDownloadModal = signal(false);
  showAgeWarning = signal(false);
  ageWarningMessage = signal('');

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      const resume = this.route.snapshot.queryParamMap.get('resume') === 'true';
      if (id) {
        this.storyService.loadStory(id, resume);
        // Load related stories once story genre is available
        this.loadRelatedStories(id);
      }
    });

    if (this.currentUser()) {
      this.subService.getMySubscription().subscribe({
        next: (sub) => {
          if (sub && sub.active) {
            this.isPremiumSubscriber.set(true);
          }
        },
        error: () => {},
      });
    }
  }

  private loadRelatedStories(currentBookId: string) {
    // Wait for story to load to get genre, then fetch related by genre
    const checkStory = setInterval(() => {
      const story = this.story();
      if (story) {
        clearInterval(checkStory);
        const genre = story.genres?.[0] || '';
        this.bookService.getBooks('popular', genre).subscribe({
          next: (res: any) => {
            const related = res.books
              .filter((b: any) => b._id !== currentBookId)
              .slice(0, 4)
              .map((b: any) => ({
                id: b._id,
                title: b.title,
                author: b.author?.username || 'Unknown',
                cover: (() => {
                  const c = b.cover;
                  if (!c) return this.api.getFallbackCover();
                  if (c.startsWith('http') || c.startsWith('data:')) return c;
                  return this.api.getImageUrl(c);
                })(),
                rating: b.rating || 0,
                genre: b.genre,
              }));
            this.relatedStories.set(related);
          },
          error: () => {},
        });
      }
    }, 300);
    // Stop polling after 5 seconds
    setTimeout(() => clearInterval(checkStory), 5000);
  }

  goToAuthor(id: string) {
    this.router.navigate(['/author', id]);
  }

  requireAuth(customReturnUrl?: string): boolean {
    if (!this.currentUser()) {
      const returnUrl = customReturnUrl || this.router.url;
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return false;
    }
    return true;
  }

  onReadClicked(chapter?: number) {
    if (this.story()?.accessType === 'premium' && !this.isPremiumSubscriber()) {
      this.router.navigate(['/subscription/plans']);
      return;
    }

    const readUrl = `/read/${this.story()?.id || '1'}`;
    if (this.requireAuth(readUrl)) {
      if (this.story()?.isMature) {
        const user = this.currentUser();
        if (user && user.dob) {
          const dob = new Date(user.dob);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
          if (age < 18) {
            this.ageWarningMessage.set('You must be at least 18 years old to access this mature content.');
            this.showAgeWarning.set(true);
            return;
          }
        } else {
            this.ageWarningMessage.set('Please update your Date of Birth in your profile to verify your age before accessing mature content.');
            this.showAgeWarning.set(true);
            return;
        }
      }
      
      this.storyService.startReading();
      if (chapter !== undefined) {
        this.router.navigate([readUrl], { queryParams: { chapter: chapter } });
      } else {
        this.router.navigate([readUrl]);
      }
    }
  }

  onBookmarkClicked() {
    if (this.requireAuth()) {
      this.storyService.toggleBookmark();
    }
  }

  onLikeClicked() {
    if (this.requireAuth()) {
      this.storyService.toggleLike();
    }
  }

  onDownloadClicked() {
    if (this.requireAuth()) {
      if (!this.isPremiumSubscriber()) {
        this.router.navigate(['/subscription/plans']);
      } else {
        this.showDownloadModal.set(true);
      }
    }
  }

  onDownloadConfirmed(count: number | 'all') {
    this.showDownloadModal.set(false);
    const story = this.story();
    const episodes = this.episodes();

    if (story && episodes.length > 0) {
      let chaptersToDownload = [];
      if (count === 'all') {
        chaptersToDownload = episodes;
      } else {
        chaptersToDownload = episodes.slice(0, count);
      }

      this.offlineService.downloadBatch(story.id, chaptersToDownload);

      // Keep simple history of downloaded books for library view
      const downloads = JSON.parse(
        localStorage.getItem('downloaded_books') || '[]',
      );
      if (!downloads.find((b: any) => b.id === story.id)) {
        downloads.push(story);
        localStorage.setItem('downloaded_books', JSON.stringify(downloads));
      }
    }
  }

  getAvatarUrl(path: string | undefined): string {
    const baseUrl = environment.apiUrl.replace('/api', '');
    if (!path)
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser()?.username || 'You')}&background=random&color=fff&size=100&length=1`;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  onPostComment(event: { text: string; rating: number }) {
    if (this.requireAuth()) {
      this.storyService.addComment(
        event.text,
        this.currentUser(),
        event.rating,
      );
    }
  }

  onLikeComment(commentId: string) {
    if (this.requireAuth()) {
      this.storyService.toggleCommentLike(commentId);
    }
  }

  onDislikeComment(commentId: string) {
    if (this.requireAuth()) {
      this.storyService.toggleCommentDislike(commentId);
    }
  }

  onPostReply(event: { parentId: string; text: string }) {
    if (this.requireAuth()) {
      this.storyService.replyToComment(
        event.parentId,
        event.text,
        this.currentUser(),
      );
    }
  }

  onReportSubmitted(reason: string) {
    if (this.requireAuth()) {
      this.storyService.reportBook(reason);
    }
  }

  onLoadMoreComments() {
    this.storyService.loadMoreComments();
  }
}
