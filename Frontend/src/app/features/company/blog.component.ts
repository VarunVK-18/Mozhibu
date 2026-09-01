import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-layout">
      <!-- Header -->
      <div class="blog-header wrap">
        <h1>Mozhibu <span class="accent">Blog</span></h1>
        <p>News, author highlights, and writing tips from the Mozhibu team.</p>

        <div class="category-filters">
          <button class="filter-btn active">All</button>
          <button class="filter-btn">Announcements</button>
          <button class="filter-btn">Writing Tips</button>
          <button class="filter-btn">Author Spotlight</button>
        </div>
      </div>

      <!-- Featured Post -->
      <div class="featured-post wrap">
        <div class="featured-image">
          <img
            src="https://placehold.co/800x500/3F6259/FFFFFF?text=Writing+Contest"
            alt="Featured"
          />
        </div>
        <div class="featured-content">
          <span class="tag">Announcements</span>
          <h2>The 2026 Mozhibu Summer Writing Contest</h2>
          <p>
            Join our biggest writing competition of the year. Over $50,000 in
            prizes, exclusive publishing contracts, and a chance to have your
            story featured on the front page.
          </p>
          <div class="meta">
            <img
              src="assets/logo.png"
              alt="Mozhibu Team"
              class="author-avatar"
            />
            <div>
              <span class="author-name">Mozhibu Staff</span>
              <span class="date">Aug 20, 2026 • 3 min read</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Article Grid -->
      <div class="article-grid wrap">
        <div class="article-card" *ngFor="let post of posts">
          <img loading="lazy" [src]="post.image" [alt]="post.title" class="card-image" />
          <div class="card-content">
            <span class="tag">{{ post.category }}</span>
            <h3>{{ post.title }}</h3>
            <p>{{ post.excerpt }}</p>
            <div class="meta small">
              <span class="date">{{ post.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-layout {
        min-height: calc(100vh - 73px);
        background: var(--paper);
        padding: 64px 0 120px;
      }
      .blog-header {
        text-align: center;
        margin-bottom: 64px;
      }
      .blog-header h1 {
        font-size: 56px;
        margin-bottom: 16px;
      }
      .accent {
        color: var(--rose);
      }
      .blog-header p {
        font-size: 20px;
        color: var(--ink-soft);
        max-width: 600px;
        margin: 0 auto 40px;
      }
      .category-filters {
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .filter-btn {
        padding: 10px 24px;
        border-radius: 100px;
        background: var(--card);
        border: 1px solid var(--border);
        font-family: var(--display);
        font-weight: 600;
        color: var(--ink-soft);
        cursor: pointer;
        transition: all 0.2s;
      }
      .filter-btn:hover {
        border-color: var(--ink);
        color: var(--ink);
      }
      .filter-btn.active {
        background: var(--ink);
        color: white;
        border-color: var(--ink);
      }

      .featured-post {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 48px;
        align-items: center;
        margin-bottom: 80px;
        background: var(--paper-warm);
        border-radius: var(--radius-l);
        overflow: hidden;
        border: 1px solid var(--border-soft);
      }
      .featured-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        min-height: 400px;
      }
      .featured-content {
        padding: 48px 48px 48px 0;
      }
      .tag {
        display: inline-block;
        padding: 6px 12px;
        background: var(--forest-tint);
        color: var(--forest-deep);
        font-weight: 600;
        font-size: 12px;
        border-radius: 4px;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .featured-content h2 {
        font-size: 36px;
        margin-bottom: 16px;
      }
      .featured-content p {
        font-size: 16px;
        margin-bottom: 32px;
      }

      .meta {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .author-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #ccc;
      }
      .author-name {
        display: block;
        font-weight: 600;
        font-size: 15px;
        color: var(--ink);
      }
      .date {
        font-size: 13px;
        color: var(--ink-faint);
      }

      .article-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
      }
      .article-card {
        background: var(--card);
        border-radius: var(--radius-m);
        overflow: hidden;
        border: 1px solid var(--border-soft);
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        cursor: pointer;
      }
      .article-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
      }
      .card-image {
        width: 100%;
        height: 220px;
        object-fit: cover;
      }
      .card-content {
        padding: 24px;
      }
      .card-content h3 {
        font-size: 20px;
        margin-bottom: 12px;
        line-height: 1.4;
      }
      .card-content p {
        font-size: 14px;
        margin-bottom: 24px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .meta.small .date {
        font-size: 12px;
      }

      @media (max-width: 900px) {
        .featured-post {
          grid-template-columns: 1fr;
          gap: 0;
        }
        .featured-image img {
          min-height: 250px;
        }
        .featured-content {
          padding: 32px;
        }
        .article-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 600px) {
        .article-grid {
          grid-template-columns: 1fr;
        }
        .blog-header h1 {
          font-size: 40px;
        }
      }
    `,
  ],
})
export class BlogComponent {
  posts = [
    {
      title: 'How to Build Pacing in a Serialization',
      category: 'Writing Tips',
      image: 'https://placehold.co/600x400/8A7B5C/FFFFFF?text=Writing',
      excerpt:
        'Master the art of the cliffhanger and keep your readers coming back week after week.',
      date: 'Aug 15, 2026',
    },
    {
      title: 'Author Spotlight: Sarah Jenkins',
      category: 'Author Spotlight',
      image: 'https://placehold.co/600x400/AE6274/FFFFFF?text=Spotlight',
      excerpt:
        'How one indie author went from 0 to 10,000 subscribers in her first three months on the platform.',
      date: 'Aug 12, 2026',
    },
    {
      title: 'Platform Update: New Reading Stats',
      category: 'Announcements',
      image: 'https://placehold.co/600x400/5E6B7A/FFFFFF?text=Update',
      excerpt:
        'We have completely revamped the author dashboard to give you deeper insights into reader retention.',
      date: 'Aug 05, 2026',
    },
    {
      title: 'The Rise of LitRPG on Mozhibu',
      category: 'Deep Dive',
      image: 'https://placehold.co/600x400/B08655/FFFFFF?text=LitRPG',
      excerpt:
        'Exploring the massive surge in popularity of game-mechanic fiction and why readers love it.',
      date: 'Jul 28, 2026',
    },
    {
      title: '5 Ways to Monetize Your Free Serial',
      category: 'Writing Tips',
      image: 'https://placehold.co/600x400/4E7A6B/FFFFFF?text=Monetization',
      excerpt:
        'You do not have to lock everything behind a paywall. Here are alternative ways to earn as a writer.',
      date: 'Jul 20, 2026',
    },
    {
      title: 'Introducing Custom Chapter Scheduling',
      category: 'Announcements',
      image: 'https://placehold.co/600x400/9A5C4C/FFFFFF?text=Scheduling',
      excerpt:
        'You can now queue up your chapters months in advance. Learn how to use the new calendar tool.',
      date: 'Jul 15, 2026',
    },
  ];
}
