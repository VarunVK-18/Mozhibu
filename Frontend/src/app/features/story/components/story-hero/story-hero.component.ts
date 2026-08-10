import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-story-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hero-container" [style.background-image]="'url(' + coverImage + ')'">
      <div class="scrim"></div>
      
      <div class="hero-content">
        <div class="genres">
          @for (genre of genres; track genre) {
            <span class="genre-pill">{{ genre }}</span>
          }
        </div>
        
        <h1 class="title">{{ title }}</h1>
        <p class="subtitle">{{ subtitle }}</p>
        
        <div class="author-row" (click)="authorClicked.emit(author.id)">
          <img [src]="author.avatar" [alt]="author.name" class="author-avatar">
          <span class="author-name">By {{ author.name }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-container {
      position: relative;
      width: 100%;
      height: 60vh;
      min-height: 400px;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: flex-end;
    }
    
    .scrim {
      position: absolute;
      inset: 0;
      /* Functional solid scrim at the bottom for text legibility, no multi-color decorative gradients */
      background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.7) 40%, transparent 100%);
      pointer-events: none;
    }
    
    .hero-content {
      position: relative;
      z-index: 1;
      padding: 40px;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      color: #fff;
    }
    
    .title {
      font-family: var(--display);
      font-size: 48px;
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 12px;
      color: #fff;
    }
    
    .subtitle {
      font-size: 18px;
      color: #cbd5e1;
      margin-bottom: 24px;
      max-width: 600px;
    }
    
    .genres {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .genre-pill {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(4px);
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .author-row {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .author-row:hover {
      opacity: 0.8;
    }
    
    .author-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .author-name {
      font-weight: 500;
      font-size: 15px;
    }
    
    @media (max-width: 768px) {
      .hero-content { padding: 24px; }
      .title { font-size: 36px; }
    }
  `]
})
export class StoryHeroComponent {
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() coverImage!: string;
  @Input() author!: { id: string; name: string; avatar: string };
  @Input() genres!: string[];
  
  @Output() authorClicked = new EventEmitter<string>();
}
