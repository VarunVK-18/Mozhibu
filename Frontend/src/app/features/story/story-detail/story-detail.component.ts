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
    StoryCardComponent
  ],
  template: `
    <div class="story-detail-page">
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
            <button class="btn-read-more" (click)="synopsisExpanded.set(!synopsisExpanded())">
              {{ synopsisExpanded() ? 'Read Less' : 'Read More' }}
            </button>
          </div>
          
          <app-chapter-list [episodes]="episodes()" [storyId]="story()?.id || ''"></app-chapter-list>
          
          <app-comment-list 
            [comments]="comments()"
            [currentUserAvatar]="getAvatarUrl(currentUser()?.avatar)"
            [storyAuthorName]="story()?.author?.name || ''"
            (postComment)="onPostComment($event)"
            (likeComment)="onLikeComment($event)"
            (dislikeComment)="onDislikeComment($event)"
            (postReply)="onPostReply($event)"
          ></app-comment-list>
          
          <!-- Related Stories -->
          <div class="related-section">
            <h2>More like this</h2>
            <div class="related-grid">
              @for (related of relatedStories(); track related.id) {
                <app-story-card
                  [story]="related"
                ></app-story-card>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
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
      .content-wrapper { padding: 0 20px 40px; }
      .related-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
    }
  `]
})
export class StoryDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  storyService = inject(StoryService);
  authService = inject(AuthService);
  subService = inject(SubscriptionService);
  private bookService = inject(BookService);
  api = inject(ApiService);
  
  story = this.storyService.getActiveStory();
  episodes = this.storyService.getEpisodes();
  comments = this.storyService.getComments();
  currentUser = this.authService.user;
  
  synopsisExpanded = signal(false);
  isPremiumSubscriber = signal(false);
  relatedStories = signal<any[]>([]);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
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
        error: () => {}
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
          next: (books: any[]) => {
            const related = books
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
                genre: b.genre
              }));
            this.relatedStories.set(related);
          },
          error: () => {}
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

  onReadClicked() {
    if (this.story()?.accessType === 'premium' && !this.isPremiumSubscriber()) {
       this.router.navigate(['/subscription/plans']);
       return;
    }

    const readUrl = `/read/${this.story()?.id || '1'}`;
    if (this.requireAuth(readUrl)) {
      this.storyService.startReading();
      this.router.navigate([readUrl]);
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
        this.router.navigate(['/settings'], { queryParams: { tab: 'subscription' } });
      } else {
        const story = this.story();
        if (story) {
          const downloads = JSON.parse(localStorage.getItem('downloaded_books') || '[]');
          if (!downloads.find((b: any) => b.id === story.id)) {
            downloads.push(story);
            localStorage.setItem('downloaded_books', JSON.stringify(downloads));
          }
          this.router.navigate(['/library'], { queryParams: { tab: 'downloaded' } });
        }
      }
    }
  }

  getAvatarUrl(path: string | undefined): string {
    const baseUrl = environment.apiUrl.replace('/api', '');
    if (!path) return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser()?.username || 'You')}&background=random&color=fff&size=100&length=1`;
    if (path.startsWith('http')) return path;
    return `${baseUrl}${path}`;
  }

  onPostComment(event: {text: string, rating: number}) {
    if (this.requireAuth()) {
      this.storyService.addComment(event.text, this.currentUser(), event.rating);
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

  onPostReply(event: {parentId: string, text: string}) {
    if (this.requireAuth()) {
      this.storyService.replyToComment(event.parentId, event.text, this.currentUser());
    }
  }

  onReportSubmitted(reason: string) {
    if (this.requireAuth()) {
      this.storyService.reportBook(reason);
    }
  }
}
