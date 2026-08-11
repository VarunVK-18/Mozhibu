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
import { OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

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
    RouterModule
  ],
  template: `
    <div class="page-wrapper">
      @if (!authService.user()) {
        <!-- GUEST VIEW -->
        <app-hero></app-hero>
        
        <app-story-section title="Recommended for You" [stories]="recommendedStories" viewAllLink="/categories"></app-story-section>
        <app-story-section title="Trending Today" [stories]="trendingStories" viewAllLink="/categories"></app-story-section>
        <app-story-section title="Most Read" [stories]="mostReadStories" viewAllLink="/categories"></app-story-section>
        
        <app-competition-banner></app-competition-banner>
        
        <app-story-section title="Editor's Picks" [stories]="editorPicks" viewAllLink="/categories"></app-story-section>
        <app-story-section title="Newly Published" [stories]="newlyPublished" viewAllLink="/categories"></app-story-section>
        <app-story-section title="Completed Stories" [stories]="completedStories" viewAllLink="/categories"></app-story-section>
        <app-story-section title="Ongoing Stories" [stories]="ongoingStories" viewAllLink="/categories"></app-story-section>
        <app-story-section title="Audio Stories" [stories]="audioStories" viewAllLink="/categories"></app-story-section>
      } @else {
        <!-- LOGGED IN VIEW -->
        <div class="logged-in-container">
          <app-continue-reading></app-continue-reading>
          
          <app-story-section title="Recommended" [stories]="recommendedStories" viewAllLink="/categories"></app-story-section>
          
          <app-story-section title="Latest" [stories]="newlyPublished" viewAllLink="/categories"></app-story-section>
          
          <app-story-section title="Trending" [stories]="trendingStories" viewAllLink="/categories"></app-story-section>
          
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
    }
  `]
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  bookService = inject(BookService);

  recommendedStories: any[] = [];
  trendingStories: any[] = [];
  mostReadStories: any[] = [];
  editorPicks: any[] = [];
  newlyPublished: any[] = [];
  completedStories: any[] = [];
  ongoingStories: any[] = [];
  audioStories: any[] = [];

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
      },
      error: (err) => console.error('Failed to load books:', err)
    });

    if (this.authService.user()) {
      this.authService.getFollowing().subscribe({
        next: (authors) => {
          this.followingUsers = authors.map((a: any) => ({
            id: a._id,
            name: a.username,
            avatar: a.avatar,
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
            avatar: a.avatar,
            followers: a.followersCount || 0
          }));
        }
      });
    }
  }

  private mapStories(books: any[]) {
    return books.map(b => ({
      id: b._id,
      title: b.title,
      author: b.author?.username || 'Unknown',
      cover: b.cover || 'assets/placeholder.jpg',
      genre: b.genre,
      views: (b.views / 1000).toFixed(1) + 'K',
      rating: b.rating || 0,
      isAudio: !!b.isAudio
    }));
  }

  private createMockAnnouncements(): Announcement[] {
    return [
      { id: '1', type: 'update', date: 'Oct 12, 2026', title: 'New Reading Experience', content: 'We just rolled out an entirely new immersive reading mode that saves your progress seamlessly across all devices.' },
      { id: '2', type: 'event', date: 'Oct 15, 2026', title: 'Winter Writing Contest', content: 'Join thousands of authors in our annual Winter Writing Contest for a chance to win publishing contracts.' },
      { id: '3', type: 'news', date: 'Oct 10, 2026', title: 'Platform Milestone', content: 'Mozhibu just crossed 1 million published stories in over 15 regional languages! Thank you to our incredible community.' },
      { id: '4', type: 'update', date: 'Oct 8, 2026', title: 'Audio Stories Expansion', content: 'We have added text-to-speech integration for over 5 new languages including Malayalam and Kannada.' }
    ];
  }

  followingUsers: UserProfile[] = [];
  followerUsers: UserProfile[] = [];
  announcements = this.createMockAnnouncements();
}
