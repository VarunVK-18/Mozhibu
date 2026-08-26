import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { BookService } from '../../../../core/services/book.service';
import { ApiService } from '../../../../core/services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hero-grid">

      <!-- Featured Story Card -->
      <div class="featured-card">
        <div class="featured-bg-glow"></div>
        
        <ng-container *ngIf="featuredBooks.length > 0; else defaultHero">
          <div class="carousel-slide" *ngFor="let book of featuredBooks; let i = index" [class.active]="i === activeIndex">
            <!-- Mobile full-bleed background image -->
            <div class="mobile-hero-bg" [style.background-image]="'url(' + book.coverImage + ')'"></div>
            <div class="featured-content">
              <div class="featured-eyebrow">
                <span class="live-dot"></span>
                {{ book.tag }}
              </div>
              <h1 class="featured-title">{{ book.title }}</h1>
              <p class="featured-desc">{{ book.description | slice:0:140 }}...</p>
              <div class="featured-meta">
                <span class="genre-pill">{{ book.genre }}</span>
                <span class="meta-sep">·</span>
                <span class="author-text">{{ book.author }}</span>
              </div>
              <button class="read-btn" (click)="onStartReading(book.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>
                Read Now
              </button>
            </div>
            <div class="featured-cover">
              <img [src]="book.coverImage" [alt]="book.title">
              <div class="cover-shine"></div>
            </div>
          </div>
          
          <div class="carousel-indicators">
            <button class="indicator" *ngFor="let book of featuredBooks; let i = index" [class.active]="i === activeIndex" (click)="setSlide(i)"></button>
          </div>
        </ng-container>

        <ng-template #defaultHero>
          <div class="section-loader-container" style="height: 100%; color: white">
            <div class="section-loading-bar" style="background: rgba(255,255,255,0.1)">
              <div class="section-loading-progress" style="background: #fff"></div>
            </div>
          </div>
        </ng-template>
      </div>

      <!-- Trending Authors -->
      <aside class="authors-panel">
        <div class="panel-header">
          <h3 class="panel-title">Trending Authors</h3>
          <a routerLink="/login" class="view-all">View All</a>
        </div>
        
        <div class="section-loader-container" *ngIf="isLoadingAuthors">
          <div class="section-loading-bar">
            <div class="section-loading-progress"></div>
          </div>
        </div>

        <div class="author-list" *ngIf="!isLoadingAuthors">
          <div class="author-row" *ngFor="let author of authors">
            <div class="author-avatar">
              <img *ngIf="author.avatar" [src]="author.avatar" [alt]="author.name">
              <span *ngIf="!author.avatar">{{ author.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="author-info">
              <span class="author-name">{{ author.name }}</span>
              <span class="author-followers">{{ author.followers }} followers</span>
            </div>
            <button 
              class="follow-btn" 
              [class.following]="author.following"
              (click)="onFollowAuthor(author)">
              {{ author.following ? '✓ Following' : 'Follow' }}
            </button>
          </div>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 32px 0 48px 0;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
      align-items: stretch;
    }

    /* Hidden on desktop, shown on mobile */
    .mobile-hero-bg {
      display: none;
    }

    .featured-card {
      background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
      border-radius: var(--radius-l);
      padding: 48px 48px 48px 56px;
      color: #fff;
      overflow: hidden;
      position: relative;
      min-height: 420px;
    }
    
    .carousel-slide {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      opacity: 0;
      position: absolute;
      top: 48px;
      left: 56px;
      right: 48px;
      bottom: 48px;
      visibility: hidden;
      transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
      transform: translateY(10px);
    }
    .carousel-slide.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      position: relative;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    
    .carousel-indicators {
      position: absolute;
      bottom: 24px;
      left: 56px;
      display: flex;
      gap: 8px;
      z-index: 10;
    }
    .indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
    }
    .indicator.active {
      width: 24px;
      border-radius: 100px;
      background: #fff;
    }

    .featured-content {
      flex: 1;
      z-index: 2;
    }

    .featured-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 20px;
      color: #94A3B8;
    }
    
    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ef4444;
      box-shadow: 0 0 8px #ef4444;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.5; }
      100% { transform: scale(1); opacity: 1; }
    }

    .featured-title {
      font-family: var(--display);
      font-size: 28px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 14px;
      color: #fff;
    }

    .featured-desc {
      font-size: 14px;
      color: #94A3B8;
      line-height: 1.6;
      margin-bottom: 20px;
      max-width: 380px;
    }

    .featured-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
    }

    .genre-pill {
      background: rgba(255,255,255,0.1);
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
    }

    .author-text {
      font-size: 13px;
      color: #CBD5E1;
    }

    .read-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      color: #0F172A;
      font-family: var(--display);
      font-weight: 700;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 100px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .read-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }

    .featured-cover {
      width: 200px;
      height: 300px;
      border-radius: var(--radius-m);
      overflow: hidden;
      box-shadow: 0 24px 48px rgba(0,0,0,0.5);
      flex-shrink: 0;
      z-index: 2;
      transform: rotate(2deg);
      transition: transform 0.4s ease;
    }
    .featured-cover:hover {
      transform: rotate(0deg) scale(1.03);
    }
    .featured-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .authors-panel {
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-l);
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .panel-title {
      font-family: var(--display);
      font-size: 18px;
      font-weight: 700;
      color: var(--ink);
      margin: 0;
    }
    
    .view-all {
      font-size: 13px;
      font-weight: 600;
      color: var(--forest);
      text-decoration: none;
    }
    .view-all:hover {
      text-decoration: underline;
    }

    .author-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .author-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .author-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--forest-tint);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--display);
      font-weight: 700;
      font-size: 16px;
      color: var(--forest-deep);
      flex-shrink: 0;
      overflow: hidden;
    }
    .author-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .author-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .author-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--ink);
    }

    .author-followers {
      font-size: 12px;
      color: var(--ink-soft);
    }

    .follow-btn {
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 5px 14px;
      font-size: 12px;
      font-weight: 600;
      color: var(--ink);
      cursor: pointer;
      font-family: var(--display);
      transition: all 0.2s ease;
      background: none;
    }
    .follow-btn:hover {
      background: var(--forest);
      color: #fff;
      border-color: var(--forest);
    }

    @media (max-width: 1024px) {
      .hero-grid {
        grid-template-columns: 1fr;
      }
      .authors-panel {
        display: none;
      }
    }
    @media (max-width: 640px) {
      .hero-grid { gap: 32px; }

      .featured-card {
        padding: 0;
        min-height: auto;
        background: transparent;
        border-radius: 0;
        overflow: visible;
      }
      .featured-bg-glow { display: none; }

      /* Completely reset slides for standard mobile flow */
      .carousel-slide {
        display: flex;
        position: absolute;
        top: 0; left: 0; right: 0; bottom: auto;
        flex-direction: column;
        padding: 0;
        transform: none;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.5s ease-in-out;
        pointer-events: none;
      }
      .carousel-slide.active {
        position: relative;
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      /* Clean landscape banner */
      .mobile-hero-bg {
        display: block;
        width: 100%;
        height: 220px;
        background-size: cover;
        background-position: center;
        border-radius: var(--radius-l);
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        margin-bottom: 24px;
      }
      .mobile-hero-bg::after {
        display: none; /* Remove any gradient overlays */
      }

      /* Desktop cover hidden */
      .featured-cover {
        display: none;
      }

      /* Text content below the banner */
      .featured-content {
        padding: 0;
        background: transparent;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }

      .featured-eyebrow {
        color: var(--ink-soft);
        margin-bottom: 8px;
      }

      .featured-title {
        color: var(--ink);
        font-size: 20px;
        margin-bottom: 10px;
        text-shadow: none;
        line-height: 1.3;
      }

      .featured-desc {
        display: -webkit-box;
        color: var(--ink-soft);
        font-size: 14px;
        margin-bottom: 20px;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .featured-meta {
        color: var(--ink-soft);
        justify-content: flex-start;
        margin-bottom: 24px;
        text-shadow: none;
      }

      .author-text {
        color: var(--ink-soft);
      }

      .genre-pill {
        background: var(--paper-soft);
        color: var(--ink);
        border: 1px solid var(--border-soft);
      }
      
      .read-btn {
        width: 100%;
        justify-content: center;
        background: var(--ink);
        color: var(--paper);
        border: 1px solid var(--border);
      }

      /* Dots placed right below the banner image */
      .carousel-indicators {
        position: absolute;
        top: 232px; /* 220px height + 12px gap */
        left: 0;
        right: 0;
        bottom: auto;
        justify-content: center;
        padding: 0;
      }
      .indicator {
        background: var(--border-strong);
      }
      .indicator.active {
        background: var(--forest);
      }
    }
    .section-loader-container {
      width: 100%;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .section-loading-bar {
      width: 100px;
      height: 4px;
      background-color: rgba(194, 159, 96, 0.2);
      border-radius: 100px;
      overflow: hidden;
    }
    .section-loading-progress {
      width: 100%;
      height: 100%;
      background: var(--gold);
      transform-origin: 0% 50%;
      animation: loadingSlide 1.5s infinite linear;
      border-radius: 100px;
    }
  `]
})
export class HeroComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  bookService = inject(BookService);
  router = inject(Router);
  api = inject(ApiService);

  authors: any[] = [];
  isLoadingAuthors = true;

  featuredBooks: any[] = [];
  activeIndex = 0;
  carouselInterval: any;

  ngOnInit() {
    // Fetch Authors
    this.authService.getAuthors().subscribe({
      next: (data) => {
        this.authors = data.slice(0, 3).map((a: any) => {
          return {
            id: a._id,
            name: a.username || 'Unknown',
            avatar: a.avatar || '',
            followers: a.followersCount ? `${(a.followersCount / 1000).toFixed(1)}K` : '0',
            following: false
          };
        });
        this.isLoadingAuthors = false;
      },
      error: (err) => {
        console.error('Failed to load trending authors', err);
        this.isLoadingAuthors = false;
      }
    });

    // Fetch Latest and Trending Books for Carousel
    forkJoin({
      latest: this.bookService.getBooks('latest'),
      trending: this.bookService.getBooks('trending')
    }).subscribe({
      next: (res: any) => {
        let combinedBooks: any[] = [];
        
        const mapBook = (b: any, tag: string) => ({
          id: b._id,
          title: b.title,
          description: b.description || 'Dive into this epic story.',
          genre: b.genre || 'Fiction',
          author: b.author?.username || 'Unknown Author',
          coverImage: this.api.getImageUrl(b.cover) || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
          tag
        });

        if (res.latest?.books && Array.isArray(res.latest.books)) {
          const topLatest = res.latest.books.slice(0, 2).map((b: any) => mapBook(b, 'New Release'));
          combinedBooks = [...combinedBooks, ...topLatest];
        }

        if (res.trending?.books && Array.isArray(res.trending.books)) {
          // ensure we don't duplicate books that are both new and trending
          const existingIds = new Set(combinedBooks.map(b => b.id));
          const topTrending = res.trending.books
            .filter((b: any) => !existingIds.has(b._id))
            .slice(0, 2)
            .map((b: any) => mapBook(b, 'Trending'));
          
          combinedBooks = [...combinedBooks, ...topTrending];
        }

        if (combinedBooks.length > 0) {
          this.featuredBooks = combinedBooks;
          this.startCarousel();
        }
      },
      error: (err) => console.error('Failed to load featured books', err)
    });
  }

  startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.activeIndex = (this.activeIndex + 1) % this.featuredBooks.length;
    }, 5000);
  }

  setSlide(index: number) {
    this.activeIndex = index;
    clearInterval(this.carouselInterval);
    this.startCarousel();
  }

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  onFollowAuthor(author: any) {
    if (!this.authService.user()) {
      this.router.navigate(['/login']);
      return;
    }
    
    author.following = !author.following;
    this.authService.followAuthor(author.id).subscribe({
      error: () => {
        author.following = !author.following; // revert on fail
      }
    });
  }

  onStartReading(bookId?: string) {
    if (this.authService.user()) {
      this.router.navigate(['/library']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
