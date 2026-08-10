import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Featured + Trending Authors -->
    <div class="hero-grid">
      <!-- Featured Story Card -->
      <div class="featured-card">
        <div class="featured-content">
          <span class="featured-tag">Featured Story</span>
          <h1 class="featured-title">The Last Ferry to Vaikuntam</h1>
          <p class="featured-desc">An epic journey through mythology and time. Join the ferryman as he navigates the cosmic rivers, facing demons and gods alike.</p>
          <div class="featured-meta">
            <span class="genre-pill">Mythology</span>
            <span class="author-text">by Anitha Suresh</span>
          </div>
          <button class="btn btn-primary start-btn">Start Reading</button>
        </div>
        <div class="featured-cover">
          <img src="https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=800" alt="Featured Story Cover">
        </div>
      </div>

      <!-- Trending Authors -->
      <aside class="authors-panel">
        <h3 class="panel-title">Trending Authors</h3>
        <div class="author-list">
          <div class="author-row" *ngFor="let author of authors">
            <div class="author-avatar">{{ author.name.charAt(0) }}</div>
            <div class="author-info">
              <span class="author-name">{{ author.name }}</span>
              <span class="author-followers">{{ author.followers }} followers</span>
            </div>
            <button class="follow-btn">Follow</button>
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

    /* Hero grid */
    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
      align-items: stretch;
    }

    /* Featured card */
    .featured-card {
      background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
      border-radius: var(--radius-l);
      padding: 48px 48px 48px 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      color: #fff;
      overflow: hidden;
      position: relative;
      min-height: 420px;
    }

    .featured-content {
      flex: 1;
      z-index: 2;
    }

    .featured-tag {
      display: inline-block;
      background: rgba(255,255,255,0.12);
      padding: 5px 14px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .featured-title {
      font-family: var(--display);
      font-size: 38px;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 14px;
      color: #fff;
    }

    .featured-desc {
      font-size: 14px;
      color: #94A3B8;
      line-height: 1.7;
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

    .start-btn {
      font-size: 14px;
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

    /* Authors Panel */
    .authors-panel {
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-l);
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
    }

    .panel-title {
      font-family: var(--display);
      font-size: 18px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 24px;
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

    /* Responsive */
    @media (max-width: 1024px) {
      .hero-grid {
        grid-template-columns: 1fr;
      }
      .authors-panel {
        display: none;
      }
    }
    @media (max-width: 640px) {
      .featured-card {
        flex-direction: column;
        padding: 32px 24px;
        text-align: center;
        min-height: auto;
      }
      .featured-title {
        font-size: 28px;
      }
      .featured-desc {
        margin: 0 auto 20px auto;
      }
      .featured-meta {
        justify-content: center;
      }
      .featured-cover {
        width: 140px;
        height: 210px;
      }
    }
  `]
})
export class HeroComponent {
  authors = [
    { name: 'Kalki Krishnamurthy', followers: '12.4K' },
    { name: 'Sujatha Rangarajan', followers: '8.9K' },
    { name: 'Jayakanthan', followers: '6.2K' },
  ];
}
