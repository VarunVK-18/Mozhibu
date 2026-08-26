import { Component, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HeroComponent } from './components/hero/hero.component';
import { StorySectionComponent } from '../../shared/components/story-section/story-section.component';
import { CompetitionBannerComponent } from './components/competition-banner/competition-banner.component';
import { AuthService } from '../../core/services/auth.service';
import { UserCardComponent, UserProfile } from '../../shared/components/user-card/user-card.component';
import { AnnouncementCardComponent, Announcement } from '../../shared/components/announcement-card/announcement-card.component';
import { ContinueReadingComponent } from './components/continue-reading/continue-reading.component';
import { BookService } from '../../core/services/book.service';
import { ApiService } from '../../core/services/api.service';
import { OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GoogleAdComponent } from '../../shared/components/ad/google-ad.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    StorySectionComponent,
    CompetitionBannerComponent,
    UserCardComponent,
    AnnouncementCardComponent,
    ContinueReadingComponent,
    RouterModule,
    GoogleAdComponent
  ],
  template: `
    <div class="page-wrapper">
      @if (!authService.user()) {
        <!-- GUEST VIEW -->
        <app-hero></app-hero>
        
        <app-story-section title="Recommended for You" [stories]="recommendedStories" [isLoading]="isStoriesLoading" viewAllLink="/categories"></app-story-section>
        
        <div class="ad-banner-wrapper">
          <app-google-ad></app-google-ad>
        </div>
        
        <app-story-section title="Trending Today" [stories]="trendingStories" [isLoading]="isStoriesLoading" viewAllLink="/categories"></app-story-section>
        <app-story-section title="Most Read" [stories]="mostReadStories" [isLoading]="isStoriesLoading" viewAllLink="/categories"></app-story-section>
        
        <app-competition-banner></app-competition-banner>
        
        <app-story-section title="Editor's Picks" [stories]="editorPicks" [isLoading]="isStoriesLoading" viewAllLink="/categories"></app-story-section>
        <app-story-section title="Newly Published" [stories]="newlyPublished" [isLoading]="isStoriesLoading" viewAllLink="/categories"></app-story-section>
        <app-story-section title="Completed Stories" [stories]="completedStories" [isLoading]="isStoriesLoading" viewAllLink="/categories"></app-story-section>
        <app-story-section title="Ongoing Stories" [stories]="ongoingStories" [isLoading]="isStoriesLoading" viewAllLink="/categories"></app-story-section>
        <app-story-section title="Audio Stories" [stories]="audioStories" [isLoading]="isStoriesLoading" viewAllLink="/categories"></app-story-section>
      } @else {
        <!-- LOGGED IN VIEW -->
        <div class="logged-in-container">
          <app-continue-reading></app-continue-reading>
          
          <app-story-section title="Recommended" [stories]="recommendedStories" [isLoading]="isStoriesLoading" viewAllLink="/categories"></app-story-section>
          
          <div class="ad-banner-wrapper">
            <app-google-ad></app-google-ad>
          </div>
          
          <app-story-section title="Latest" [stories]="newlyPublished" [isLoading]="isStoriesLoading" viewAllLink="/categories"></app-story-section>
          
          <app-story-section title="Trending" [stories]="trendingStories" [isLoading]="isStoriesLoading" viewAllLink="/categories"></app-story-section>
          
          <!-- Following Users -->
          <section class="user-section">
            <div class="section-header">
              <h2 class="section-title">Following</h2>
              <a routerLink="/community" class="view-all">View All</a>
            </div>
            <div class="scroll-container">
              <div class="users-track">
                <app-user-card *ngFor="let user of followingUsers" [user]="user"></app-user-card>
              </div>
            </div>
          </section>

          <!-- Followers Users -->
          <section class="user-section">
            <div class="section-header">
              <h2 class="section-title">Followers</h2>
              <a routerLink="/community" class="view-all">View All</a>
            </div>
            <div class="scroll-container">
              <div class="users-track">
                <app-user-card *ngFor="let user of followerUsers" [user]="user"></app-user-card>
              </div>
            </div>
          </section>

          <app-competition-banner></app-competition-banner>

          <!-- Announcements -->
          <section class="announcement-section">
            <div class="section-header">
              <h2 class="section-title">Announcements</h2>
            </div>
            <div class="scroll-container">
              <div class="announcements-track">
                <app-announcement-card *ngFor="let ann of announcements" [announcement]="ann"></app-announcement-card>
              </div>
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 32px 80px 32px;
    }
    .ad-banner-wrapper {
      margin: 40px 0;
      width: 100%;
    }
    .logged-in-container {
      padding-top: 48px;
    }
    .user-section, .announcement-section {
      margin-bottom: 64px;
      width: 100%;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding: 0 4px;
    }
    .section-title {
      font-family: var(--display);
      font-size: 24px;
      font-weight: 700;
      color: var(--ink);
    }
    .view-all {
      font-size: 14px;
      font-weight: 600;
      color: var(--forest);
      text-decoration: none;
    }
    .view-all:hover { text-decoration: underline; }
    .scroll-container {
      width: 100%;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 10px 4px 20px 4px;
      margin: -10px -4px -20px -4px;
    }
    .scroll-container::-webkit-scrollbar { display: none; }
    .users-track, .announcements-track {
      display: flex;
      gap: 24px;
      width: max-content;
    }
    @media (max-width: 768px) {
      .page-wrapper {
        padding: 0 16px 48px 16px;
      }
      .scroll-container {
        width: calc(100% + 32px);
        margin-left: -16px;
        margin-right: -16px;
        padding-left: 16px;
        padding-right: 16px;
      }
      .users-track::after, .announcements-track::after {
        content: '';
        width: 1px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  bookService = inject(BookService);
  private apiService = inject(ApiService);

  recommendedStories: any[] = [];
  trendingStories: any[] = [];
  mostReadStories: any[] = [];
  editorPicks: any[] = [];
  newlyPublished: any[] = [];
  completedStories: any[] = [];
  ongoingStories: any[] = [];
  audioStories: any[] = [];

  isStoriesLoading = true;

  ngOnInit() {
    forkJoin({
      popular: this.bookService.getBooks('popular'),
      trending: this.bookService.getBooks('trending'),
      latest: this.bookService.getBooks('latest'),
      audio: this.bookService.getBooks('', '', true)
    }).subscribe({
      next: (res) => {
        this.recommendedStories = this.mapStories(res.popular).slice(0, 5);
        this.trendingStories = this.mapStories(res.trending).slice(0, 5);
        this.newlyPublished = this.mapStories(res.latest).slice(0, 5);
        this.audioStories = this.mapStories(res.audio).slice(0, 5);
        
        // Some fallback slices for completed/ongoing/picks
        this.mostReadStories = this.mapStories(res.popular).slice(5, 10);
        this.editorPicks = this.mapStories(res.trending).slice(5, 10);
        this.completedStories = this.mapStories(res.latest).slice(5, 10);
        this.ongoingStories = this.mapStories(res.audio).slice(5, 10);

        this.isStoriesLoading = false;
      },
      error: (err) => {
        console.error('Failed to load books:', err);
        this.isStoriesLoading = false;
      }
    });

    if (this.authService.user()) {
      this.authService.getFollowing().subscribe({
        next: (authors) => {
          this.followingUsers = authors.map((a: any) => ({
            id: a._id,
            name: a.username,
            avatar: a.avatar ? this.apiService.getImageUrl(a.avatar) : this.apiService.getFallbackAvatar(a.username),
            followers: a.followersCount || 0,
            isFollowing: true
          }));
        }
      });
      
      // Also get all authors for the "Followers" track just to showcase other authors on the platform for now
      // Alternatively this would be an endpoint to get users following the current user
      this.authService.getAuthors().subscribe({
        next: (authors) => {
          this.followerUsers = authors.map((a: any) => ({
            id: a._id,
            name: a.username,
            avatar: a.avatar ? this.apiService.getImageUrl(a.avatar) : this.apiService.getFallbackAvatar(a.username),
            followers: a.followersCount || 0
          }));
        }
      });
    }

    // Fetch real announcements from backend broadcasts
    this.apiService.get<any[]>('/notifications/broadcasts').subscribe({
      next: (broadcasts) => {
        this.announcements = broadcasts.map((b: any) => ({
          id: b._id,
          type: 'news' as 'news' | 'update' | 'event',
          date: new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          title: b.title,
          content: b.message
        }));
      },
      error: () => { this.announcements = []; }
    });
  }

  private mapStories(books: any[]) {
    return books.map(b => ({
      id: b._id,
      title: b.title,
      author: b.author?.username || 'Unknown',
      cover: b.cover || 'assets/placeholder.jpg',
      genre: b.genre,
      views: (b.views / 1000).toFixed(1) + 'K',
      rating: b.rating ? Number(b.rating).toFixed(1) : 0,
      isAudio: !!b.isAudio,
      accessType: b.accessType
    }));
  }


  followingUsers: UserProfile[] = [];
  followerUsers: UserProfile[] = [];
  announcements: Announcement[] = [];
}
