import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StoryService } from '../../../core/services/story.service';
import { AuthService } from '../../../core/services/auth.service';

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
            (readClicked)="onReadClicked()"
            (bookmarkClicked)="onBookmarkClicked()"
            (likeClicked)="onLikeClicked()"
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
          
          <app-chapter-list [episodes]="episodes()"></app-chapter-list>
          
          <app-comment-list 
            [comments]="comments()"
            [currentUserAvatar]="getAvatarUrl(currentUser()?.avatar)"
            (postComment)="onPostComment($event)"
            (likeComment)="onLikeComment($event)"
            (dislikeComment)="onDislikeComment($event)"
            (postReply)="onPostReply($event)"
          ></app-comment-list>
          
          <!-- Related Stories -->
          <div class="related-section">
            <h2>More like this</h2>
            <div class="related-grid">
              @for (related of mockRelatedStories; track related.id) {
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
  
  story = this.storyService.getActiveStory();
  episodes = this.storyService.getEpisodes();
  comments = this.storyService.getComments();
  currentUser = this.authService.user;
  
  synopsisExpanded = signal(false);

  mockRelatedStories = [
    { id: '101', title: 'Whispers of the Wind', author: 'Elara Vance', cover: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=300&q=80', rating: 4.5, genre: 'Fantasy' },
    { id: '102', title: 'The Chronos Paradox', author: 'J.T. Sterling', cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80', rating: 4.8, genre: 'Sci-Fi' },
    { id: '103', title: 'Crimson Tide', author: 'Maya Lin', cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80', rating: 4.2, genre: 'Adventure' },
    { id: '104', title: 'A Memory of Light', author: 'Robert Jordan', cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80', rating: 4.9, genre: 'Fantasy' }
  ];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const resume = this.route.snapshot.queryParamMap.get('resume') === 'true';
      if (id) {
        this.storyService.loadStory(id, resume);
      }
    });
  }

  goToAuthor(id: string) {
    // Navigate to author profile
    console.log('Navigate to author:', id);
  }

  requireAuth(): boolean {
    if (!this.currentUser()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  onReadClicked() {
    if (this.requireAuth()) {
      this.storyService.startReading();
      this.router.navigate(['/read', this.story()?.id || '1']);
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

  getAvatarUrl(path: string | undefined): string {
    if (!path) return 'https://placehold.co/100x100/333333/999999?text=You';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  }

  onPostComment(text: string) {
    if (this.requireAuth()) {
      this.storyService.addComment(text, this.currentUser());
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
