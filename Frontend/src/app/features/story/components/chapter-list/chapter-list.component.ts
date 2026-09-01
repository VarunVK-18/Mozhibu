import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoryEpisode } from '../../../../core/services/story.service';
import { OfflineService } from '../../../../core/services/offline.service';
import { SafeUrlPipe } from '../../../../shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-chapter-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SafeUrlPipe],
  template: `
    <div class="chapters-container">
      <div class="chapters-header">
        <h2>Chapters</h2>
        @if (availableSeasons.length > 1) {
          <select [(ngModel)]="activeSeason" class="season-selector">
            @for (s of availableSeasons; track s) {
              <option [value]="s">Season {{ s }}</option>
            }
          </select>
        } @else if (
          availableSeasons.length === 1 && availableSeasons[0] !== 1
        ) {
          <span class="season-selector-label"
            >Season {{ availableSeasons[0] }}</span
          >
        }
      </div>

      <div class="episodes-list">
        @for (ep of filteredEpisodes; track ep.id) {
          <a
            (click)="onChapterClick($event, ep.episode)"
            style="cursor: pointer;"
            class="episode-card"
            [class.locked]="!ep.isUnlocked"
          >
            <div class="ep-number">{{ ep.episode }}</div>

            <div class="ep-thumbnail-wrapper">
              <img
                [src]="ep.thumbnail | safeUrl"
                [alt]="ep.title"
                class="ep-thumbnail"
              />
              @if (ep.isRead) {
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
              } @else if (!ep.isUnlocked) {
                <div class="lock-overlay">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="lock-icon"
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
              } @else {
                <div class="play-overlay">
                  <svg
                    viewBox="0 0 24 24"
                    fill="white"
                    stroke="none"
                    class="play-icon"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              }
            </div>

            <div class="ep-details">
              <div class="ep-title-row">
                <h4 class="ep-title">{{ ep.title }}</h4>
                <div class="ep-duration-wrapper">
                  @if (isDownloaded(ep.id)) {
                    <svg
                      class="download-check"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  }
                  <span class="ep-duration">{{ ep.readingTime }}</span>
                </div>
              </div>
              <p class="ep-synopsis" [innerHTML]="ep.synopsis"></p>
            </div>
          </a>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .chapters-container {
        margin-top: 48px;
      }
      .chapters-header {
        display: flex;
        align-items: center;
        gap: 24px;
        margin-bottom: 24px;
      }
      .chapters-header h2 {
        font-family: var(--display);
        font-size: 24px;
        color: var(--ink);
      }
      .season-selector {
        font-size: 16px;
        font-weight: 600;
        color: var(--ink-soft);
        cursor: pointer;
        background: var(--paper-soft);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 6px 12px;
        outline: none;
      }
      .season-selector-label {
        font-size: 16px;
        font-weight: 600;
        color: var(--ink-soft);
        background: var(--paper-soft);
        padding: 6px 12px;
        border-radius: 6px;
      }

      .episodes-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .episode-card {
        display: flex;
        gap: 24px;
        padding: 16px;
        border-radius: var(--radius-m);
        border-bottom: 1px solid var(--border-soft);
        transition: background 0.2s;
        cursor: pointer;
        text-decoration: none;
        color: inherit;
      }
      .episode-card:hover {
        background: var(--paper-soft);
      }
      .episode-card.locked {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .ep-number {
        font-size: 24px;
        font-weight: 600;
        color: var(--ink-soft);
        width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ep-thumbnail-wrapper {
        position: relative;
        width: 160px;
        height: 90px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        background: #e2e8f0;
      }
      .ep-thumbnail {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
      }
      .progress-fill {
        height: 100%;
        background: var(--rose);
      }

      .lock-overlay,
      .play-overlay {
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .lock-icon {
        width: 24px;
        height: 24px;
        color: white;
      }
      .play-icon {
        width: 32px;
        height: 32px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .episode-card:hover .play-overlay .play-icon {
        opacity: 1;
      }

      .ep-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .ep-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .ep-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--ink);
      }
      .ep-duration-wrapper {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .download-check {
        width: 14px;
        height: 14px;
        color: var(--forest);
      }
      .ep-duration {
        font-size: 14px;
        color: var(--ink-faint);
      }
      .ep-synopsis {
        font-size: 14px;
        color: var(--ink-soft);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      @media (max-width: 768px) {
        .episode-card {
          gap: 16px;
          flex-direction: column;
        }
        .ep-number {
          display: none;
        }
        .ep-thumbnail-wrapper {
          width: 100%;
          height: 180px;
        }
      }
    `,
  ],
})
export class ChapterListComponent implements OnChanges {
  @Input() episodes: StoryEpisode[] = [];
  @Input() storyId: string = '';
  @Output() chapterClick = new EventEmitter<number>();

  activeSeason: number = 1;
  availableSeasons: number[] = [1];

  constructor(private offlineService: OfflineService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['episodes'] && this.episodes.length > 0) {
      const seasons = new Set(this.episodes.map((e) => e.season));
      this.availableSeasons = Array.from(seasons).sort((a, b) => a - b);
      if (!this.availableSeasons.includes(this.activeSeason)) {
        this.activeSeason = this.availableSeasons[0];
      }
    }
  }

  onChapterClick(event: Event, chapter: number) {
    event.preventDefault();
    this.chapterClick.emit(chapter);
  }

  get filteredEpisodes() {
    return this.episodes.filter((ep) => ep.season === this.activeSeason);
  }

  isDownloaded(chapterId: string): boolean {
    return this.offlineService.isChapterDownloaded(chapterId);
  }
}
