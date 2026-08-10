import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
      font-size: 42px;
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
        padding: 48px 0;
        margin-bottom: 32px;
      }
      .hero-section h1 {
        font-size: 32px;
      }
      .category-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }
      .card-content {
        padding: 16px 12px;
      }
      .card-content h2 {
        font-size: 18px;
      }
      .card-content p {
        font-size: 12px;
        margin-bottom: 8px;
      }
    }
  `]
})
export class CategoriesComponent {
  categories: Category[] = [
    {
      id: 'romance',
      name: 'Romance',
      description: 'Stories of love, passion, and emotional journeys.',
      image: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&q=80',
      count: 1420
    },
    {
      id: 'sci-fi',
      name: 'Sci-Fi',
      description: 'Explore the future, space, and advanced technology.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
      count: 895
    },
    {
      id: 'fantasy',
      name: 'Fantasy',
      description: 'Magic, mythical creatures, and epic adventures.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
      count: 2150
    },
    {
      id: 'thriller',
      name: 'Thriller',
      description: 'Suspenseful tales that keep you on the edge of your seat.',
      image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&q=80',
      count: 630
    },
    {
      id: 'mystery',
      name: 'Mystery',
      description: 'Puzzles, crimes, and secrets waiting to be uncovered.',
      image: 'https://images.unsplash.com/photo-1549488344-c6c748c15664?w=600&q=80',
      count: 940
    },
    {
      id: 'horror',
      name: 'Horror',
      description: 'Dark, terrifying, and bone-chilling stories.',
      image: 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=600&q=80',
      count: 420
    },
    {
      id: 'adventure',
      name: 'Adventure',
      description: 'Action-packed journeys across the world.',
      image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&q=80',
      count: 1120
    },
    {
      id: 'historical',
      name: 'Historical',
      description: 'Step back in time to experience the past.',
      image: 'https://images.unsplash.com/photo-1582298642055-6677461ab1d0?w=600&q=80',
      count: 580
    }
  ];
}
