import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoryCardComponent, Story } from '../story-card/story-card.component';

@Component({
  selector: 'app-story-section',
  standalone: true,
  imports: [CommonModule, RouterModule, StoryCardComponent],
  template: `
    <section class="story-section">
      <div class="section-header">
        <h2 class="section-title">{{ title }}</h2>
        <div class="section-actions">
          <a *ngIf="viewAllLink" [routerLink]="viewAllLink" class="view-all">View All</a>
          <div class="nav-btns" *ngIf="stories.length > 5">
            <button class="nav-btn" (click)="scrollLeft()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button class="nav-btn" (click)="scrollRight()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div class="scroll-container" #scrollContainer>
        <div class="stories-track">
          <app-story-card 
            *ngFor="let story of stories" 
            [story]="story"
            class="story-item">
          </app-story-card>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .story-section {
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
    .section-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .view-all {
      font-size: 14px;
      font-weight: 600;
      color: var(--forest);
      text-decoration: none;
    }
    .view-all:hover {
      text-decoration: underline;
    }
    .nav-btns {
      display: flex;
      gap: 8px;
    }
    .nav-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--card);
      border: 1px solid var(--border-soft);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ink-soft);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .nav-btn:hover {
      background: var(--paper-warm);
      color: var(--ink);
      border-color: var(--border);
    }
    .scroll-container {
      width: 100%;
      overflow-x: auto;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none;  /* IE and Edge */
      scroll-behavior: smooth;
      padding: 10px 4px 20px 4px;
      margin: -10px -4px -20px -4px;
    }
    .scroll-container::-webkit-scrollbar {
      display: none;
    }
    .stories-track {
      display: flex;
      gap: 24px;
      width: max-content;
    }
    .story-item {
      width: 200px;
      flex-shrink: 0;
    }
    @media (max-width: 768px) {
      .story-item {
        width: 160px;
      }
      .nav-btns {
        display: none;
      }
    }
  `]
})
export class StorySectionComponent {
  @Input() title: string = 'Section Title';
  @Input() stories: Story[] = [];
  @Input() viewAllLink?: string;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  scrollLeft() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({ left: -600, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({ left: 600, behavior: 'smooth' });
    }
  }
}
