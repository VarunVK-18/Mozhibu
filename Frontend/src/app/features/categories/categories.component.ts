import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookService } from '../../core/services/book.service';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="categories-page">
      <div class="hero-section">
        <div class="wrap">
          <h1>Explore by Category</h1>
          <p>Dive into worlds of wonder, mystery, and romance. Find your next favorite story.</p>
        </div>
      </div>
      
      <div class="wrap categories-content">
        <div class="category-grid">
          @for (category of categories; track category.id) {
            <a [routerLink]="['/category', category.id]" class="category-card group">
              <div class="card-bg">
                <img [src]="category.image" [alt]="category.name" class="bg-img" />
                <div class="overlay"></div>
              </div>
              <div class="card-content">
                <h2>{{ category.name }}</h2>
                <p>{{ category.description }}</p>
                <span class="count">{{ category.count }} Stories</span>
              </div>
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .categories-page {
      min-height: calc(100vh - 72px);
      background: var(--paper-warm);
      padding-bottom: 80px;
    }
    
    .hero-section {
      background: var(--card);
      padding: 64px 0;
      text-align: center;
      border-bottom: 1px solid var(--border-soft);
      margin-bottom: 48px;
    }
    
    .hero-section h1 {
      font-family: var(--display);
      font-size: 28px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    
    .hero-section p {
      font-size: 16px;
      color: var(--ink-soft);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 20px;
    }
    
    .category-card {
      position: relative;
      border-radius: var(--radius-m);
      overflow: hidden;
      aspect-ratio: 16/11;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      text-decoration: none;
      box-shadow: 0 4px 20px rgba(43, 38, 32, 0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .category-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(43, 38, 32, 0.15);
    }
    
    .card-bg {
      position: absolute;
      inset: 0;
      z-index: 1;
    }
    
    .bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    
    .category-card:hover .bg-img {
      transform: scale(1.08);
    }
    
    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%);
    }
    
    .card-content {
      position: relative;
      z-index: 2;
      padding: 20px 16px;
      color: white;
    }
    
    .card-content h2 {
      font-family: var(--display);
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    
    .card-content p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.85);
      margin-bottom: 12px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .count {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    
    @media (max-width: 768px) {
      .hero-section {
        padding: 40px 16px;
        margin-bottom: 24px;
      }
      .hero-section h1 {
        font-size: 28px;
      }
      .hero-section p {
        font-size: 14px;
      }
      .category-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .card-content {
        padding: 12px 10px;
      }
      .card-content h2 {
        font-size: 16px;
        margin-bottom: 2px;
      }
      .card-content p {
        font-size: 11px;
        margin-bottom: 6px;
        -webkit-line-clamp: 1;
      }
      .count {
        font-size: 10px;
        padding: 4px 10px;
      }
    }
    @media (max-width: 400px) {
      .category-grid {
        grid-template-columns: 1fr;
      }
      .category-card {
        aspect-ratio: 21/9;
      }
      .card-content {
        padding: 16px;
      }
      .card-content h2 {
        font-size: 20px;
      }
      .card-content p {
        font-size: 13px;
        -webkit-line-clamp: 2;
      }
    }
  `]
})
export class CategoriesComponent implements OnInit {
  bookService = inject(BookService);

  categories: Category[] = [];

  private allGenres = [
    { name: 'Romance', desc: 'Stories of love, passion, and emotional journeys.', img: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&q=80' },
    { name: 'Fantasy', desc: 'Magic, mythical creatures, and epic adventures.', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80' },
    { name: 'Thriller', desc: 'Suspenseful tales that keep you on the edge of your seat.', img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&q=80' },
    { name: 'Horror', desc: 'Dark, terrifying, and bone-chilling stories.', img: 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=600&q=80' },
    { name: 'Mystery', desc: 'Puzzles, crimes, and secrets waiting to be uncovered.', img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80' },
    { name: 'Historical', desc: 'Step back in time to experience the past.', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80' },
    { name: 'Drama', desc: 'Emotional, gripping character studies.', img: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&q=80' },
    { name: 'Comedy', desc: 'Lighthearted, funny, and entertaining stories.', img: 'https://images.unsplash.com/photo-1543584756-8f40a802e14f?w=600&q=80' },
    { name: 'Sci-Fi', desc: 'Explore the future, space, and advanced technology.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80' },
    { name: 'Children', desc: 'Fun and educational tales for kids.', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80' },
    { name: 'Poetry', desc: 'Beautiful verses and rhythmic expressions.', img: 'https://images.unsplash.com/photo-1505664173622-1816f58f7e1a?w=600&q=80' },
    { name: 'Short Stories', desc: 'Quick reads for every mood.', img: 'https://images.unsplash.com/photo-1474366521946-c3d4b507abf2?w=600&q=80' },
    { name: 'Fan Fiction', desc: 'Stories set in your favorite universes.', img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&q=80' },
    { name: 'Motivational', desc: 'Inspiring words to lift you up.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80' },
    { name: 'Biography', desc: 'True life stories of remarkable people.', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80' }
  ];

  ngOnInit() {
    // Show the full robust list directly to match the user's requirements exactly.
    // In a real app, you would fetch counts from the backend or let the backend dictate this list.
    this.categories = this.allGenres.map(genre => ({
      id: genre.name.toLowerCase().replace(/\s+/g, '-'),
      name: genre.name,
      description: genre.desc,
      image: genre.img,
      count: Math.floor(Math.random() * 500) + 100 // Mock count for UI
    }));
  }
}
