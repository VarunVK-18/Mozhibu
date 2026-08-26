import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoryCardComponent, Story } from '../story-card/story-card.component';

@Component({
  selector: 'app-story-section',
  standalone: true,
  imports: [CommonModule, RouterModule, StoryCardComponent],
  template: `
    <section class="story-section" *ngIf="isLoading || stories.length > 0">
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
      
      <div class="scroll-container" #scrollContainer (scroll)="onScroll($event)">
        <div class="stories-track" *ngIf="!isLoading || stories.length > 0">
          <app-story-card 
            *ngFor="let story of stories" 
            [story]="story"
            class="story-item">
          </app-story-card>
        </div>
        
        <!-- Skeleton Loader -->
        <div class="stories-track skeleton-track" *ngIf="isLoading">
          <div class="story-item skeleton-card" *ngFor="let i of [1,2,3,4,5]">
            <div class="skeleton-cover"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-author"></div>
          </div>
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
    .skeleton-track {
      gap: 24px;
    }
    .skeleton-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .skeleton-cover {
      width: 100%;
      height: 300px;
      border-radius: var(--radius-m);
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: loadingSlide 1.5s infinite linear;
    }
    .skeleton-title {
      width: 80%;
      height: 16px;
      border-radius: 4px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: loadingSlide 1.5s infinite linear;
    }
    .skeleton-author {
      width: 60%;
      height: 14px;
      border-radius: 4px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: loadingSlide 1.5s infinite linear;
    }
    @media (max-width: 768px) {
      .story-item {
        width: 130px;
      }
      .nav-btns {
        display: none;
      }
      .stories-track {
        gap: 16px;
      }
      /* Edge-to-edge scrolling on mobile */
      .scroll-container {
        width: calc(100% + 32px);
        margin-left: -16px;
        margin-right: -16px;
        padding-left: 16px;
        padding-right: 16px;
      }
      .stories-track::after {
        content: '';
        width: 1px;
      }
    }
  `]
})
export class StorySectionComponent {
  @Input() title: string = 'Section Title';
  @Input() stories: Story[] = [];
  @Input() viewAllLink?: string;
  @Input() isLoading: boolean = false;
  
  @Output() loadMore = new EventEmitter<void>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  onScroll(event: any) {
    const el = event.target;
    // If scrolled to within 50px of the right edge, emit loadMore
    if (el.scrollWidth - el.scrollLeft - el.clientWidth < 50) {
      this.loadMore.emit();
    }
  }

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
