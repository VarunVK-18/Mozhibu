import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-story-meta-row',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="meta-row-container">
      <div class="meta-item">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>{{ readingTime }}</span>
      </div>
      
      <div class="meta-divider"></div>
      
      <div class="meta-item">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        <span>{{ views | number:'1.0-0' }} views</span>
      </div>
      
      <div class="meta-divider"></div>
      
      <div class="meta-item">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <span>{{ rating | number:'1.1-1' }} ({{ reviewCount | number:'1.0-0' }})</span>
      </div>
      
      <div class="meta-divider"></div>
      
      <div class="meta-item">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <span>{{ chapterCount }} Chapters</span>
      </div>
      
      <div class="meta-divider hide-mobile"></div>
      
      <div class="meta-item badge hide-mobile" [ngClass]="status.toLowerCase()">
        {{ status }}
      </div>
      
      <div class="meta-divider hide-mobile"></div>
      
      <div class="meta-item text-secondary hide-mobile">
        <span>{{ language }}</span>
      </div>
      
      <div class="meta-item text-secondary hide-mobile">
        <span>Updated: {{ updatedDate }}</span>
      </div>
    </div>
  `,
  styles: [`
    .meta-row-container {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 20px 0;
      border-bottom: 1px solid var(--border-soft);
      font-size: 14px;
      color: var(--ink);
      font-weight: 500;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .icon {
      width: 16px;
      height: 16px;
      color: var(--ink-soft);
    }
    
    .meta-divider {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--border-soft);
    }
    
    .badge {
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge.ongoing { background: var(--paper-warm); color: #b45309; }
    .badge.completed { background: var(--forest-tint); color: var(--forest-deep); }
    
    .text-secondary {
      color: var(--ink-soft);
      font-weight: 400;
    }
    
    @media (max-width: 768px) {
      .hide-mobile { display: none; }
      .meta-row-container { gap: 12px; }
    }
  `]
})
export class StoryMetaRowComponent {
  @Input() readingTime!: string;
  @Input() views!: number;
  @Input() rating!: number;
  @Input() reviewCount!: number;
  @Input() chapterCount!: number;
  @Input() status!: 'Ongoing' | 'Completed';
  @Input() language!: string;
  @Input() updatedDate!: string;
}
