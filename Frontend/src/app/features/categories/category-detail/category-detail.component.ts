import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { StoryCardComponent, Story } from '../../../shared/components/story-card/story-card.component';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StoryCardComponent],
  template: `
    <div class="category-detail-page">
      <div class="hero-section">
        <div class="wrap">
          <a routerLink="/categories" class="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All Categories
          </a>
          <h1>{{ categoryName }}</h1>
          <p>{{ categoryDesc }}</p>
        </div>
      </div>
      
      <div class="wrap content-section">
        <div class="controls">
          <span class="results-count">{{ books.length }} Stories found</span>
          <!-- In a full app, we would add sort dropdowns here -->
        </div>

        @if (isLoading) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading stories...</p>
          </div>
        } @else if (books.length > 0) {
          <div class="story-grid">
            @for (book of books; track book.id) {
              <app-story-card [story]="book"></app-story-card>
            }
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <h2>No stories found</h2>
            <p>We couldn't find any published stories in the {{ categoryName }} category yet.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .category-detail-page {
      min-height: calc(100vh - 72px);
      background: var(--paper-warm);
      padding-bottom: 80px;
    }
    
    .hero-section {
      background: var(--card);
      padding: 48px 0;
      text-align: left;
      border-bottom: 1px solid var(--border-soft);
      margin-bottom: 32px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--ink-soft);
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 24px;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: var(--forest);
    }
    
    .hero-section h1 {
      font-family: var(--display);
      font-size: 26px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }
    
    .hero-section p {
      font-size: 16px;
      color: var(--ink-soft);
      max-width: 600px;
      line-height: 1.6;
    }

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-soft);
    }

    .results-count {
      font-size: 14px;
      color: var(--ink-soft);
      font-weight: 500;
    }
    
    .story-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 24px;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 64px 20px;
      background: var(--card);
      border-radius: var(--radius-l);
      border: 1px dashed var(--border);
      margin-top: 24px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(43, 38, 32, 0.1);
      border-top-color: var(--forest);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    .empty-icon {
      font-size: 36px;
      margin-bottom: 16px;
    }
    
    .empty-state h2 {
      font-family: var(--display);
      font-size: 20px;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 8px;
    }
    
    .empty-state p {
      font-size: 14px;
      color: var(--ink-soft);
    }
    
    @media (max-width: 768px) {
      .hero-section {
        padding: 32px 16px;
      }
      .hero-section h1 {
        font-size: 28px;
      }
      .story-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
    }
  `]
})
export class CategoryDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  bookService = inject(BookService);

  categoryName = '';
  categoryDesc = '';
  books: Story[] = [];
  isLoading = true;

  // Re-use the same mapping from CategoriesComponent
  private allGenres = [
    { name: 'Romance', desc: 'Stories of love, passion, and emotional journeys.' },
    { name: 'Fantasy', desc: 'Magic, mythical creatures, and epic adventures.' },
    { name: 'Thriller', desc: 'Suspenseful tales that keep you on the edge of your seat.' },
    { name: 'Horror', desc: 'Dark, terrifying, and bone-chilling stories.' },
    { name: 'Mystery', desc: 'Puzzles, crimes, and secrets waiting to be uncovered.' },
    { name: 'Historical', desc: 'Step back in time to experience the past.' },
    { name: 'Drama', desc: 'Emotional, gripping character studies.' },
    { name: 'Comedy', desc: 'Lighthearted, funny, and entertaining stories.' },
    { name: 'Sci-Fi', desc: 'Explore the future, space, and advanced technology.' },
    { name: 'Children', desc: 'Fun and educational tales for kids.' },
    { name: 'Poetry', desc: 'Beautiful verses and rhythmic expressions.' },
    { name: 'Short Stories', desc: 'Quick reads for every mood.' },
    { name: 'Fan Fiction', desc: 'Stories set in your favorite universes.' },
    { name: 'Motivational', desc: 'Inspiring words to lift you up.' },
    { name: 'Biography', desc: 'True life stories of remarkable people.' }
  ];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCategory(id);
      }
    });
  }

  loadCategory(id: string) {
    this.isLoading = true;
    
    // Find the genre by id (e.g. 'sci-fi' -> 'Sci-Fi')
    const genreMatch = this.allGenres.find(g => g.name.toLowerCase().replace(/\s+/g, '-') === id);
    
    if (genreMatch) {
      this.categoryName = genreMatch.name;
      this.categoryDesc = genreMatch.desc;
    } else {
      // Fallback if someone types a random URL
      this.categoryName = id.charAt(0).toUpperCase() + id.slice(1);
      this.categoryDesc = 'Explore stories in this category.';
    }

    // Call the BookService to get books by genre
    this.bookService.getBooks('', this.categoryName).subscribe({
      next: (data: any[]) => {
        this.books = data.map(b => ({
          id: b._id,
          title: b.title,
          author: b.author?.username || 'Unknown',
          cover: b.cover || 'assets/placeholder.jpg',
          genre: b.genre,
          views: (b.views / 1000).toFixed(1) + 'K',
          rating: b.rating || 0,
          isAudio: !!b.isAudio
        }));
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load books for category', err);
        this.isLoading = false;
      }
    });
  }
}
