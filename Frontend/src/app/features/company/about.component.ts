import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-layout">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-content wrap">
          <h1>Stories worth staying up for.</h1>
          <p>We're on a mission to connect readers and writers across the globe through the power of serialization. Read, write, and share your imagination.</p>
        </div>
        <div class="hero-bg"></div>
      </div>

      <!-- Stats -->
      <div class="stats-section wrap">
        <div class="stat-card">
          <h3>2.5M+</h3>
          <p>Active Readers</p>
        </div>
        <div class="stat-card">
          <h3>150K+</h3>
          <p>Original Stories</p>
        </div>
        <div class="stat-card">
          <h3>12+</h3>
          <p>Languages Supported</p>
        </div>
        <div class="stat-card">
          <h3>$5M+</h3>
          <p>Paid to Authors</p>
        </div>
      </div>

      <!-- Story/Mission -->
      <div class="mission-section wrap">
        <div class="mission-text">
          <h2>Our Story</h2>
          <p>Mozhibu started in 2026 with a simple idea: great stories shouldn't be hidden behind publishers. We built a platform where anyone with an imagination can find an audience.</p>
          <p>Today, we're a global community of dreamers, readers, and creators. We believe in fair compensation for artists and an uninterrupted, immersive reading experience for fans.</p>
        </div>
        <div class="mission-image">
          <img src="https://placehold.co/600x400/3F6259/FFFFFF?text=Team+Mozhibu" alt="Team Mozhibu">
        </div>
      </div>

      <!-- Core Values -->
      <div class="values-section alt-bg">
        <div class="wrap">
          <h2 class="section-title">Our Core Values</h2>
          <div class="values-grid">
            <div class="value-card">
              <div class="value-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </div>
              <h4>Global First</h4>
              <p>We build tools that break down language barriers, allowing stories to reach readers worldwide.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </div>
              <h4>Creator Centric</h4>
              <p>Authors are the lifeblood of Mozhibu. We prioritize their monetization and creative control.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h4>Safe Space</h4>
              <p>We enforce strict community guidelines to ensure a welcoming environment for all genres and readers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-layout {
      min-height: calc(100vh - 73px);
      background: var(--paper);
    }
    .hero {
      position: relative;
      padding: 120px 0;
      overflow: hidden;
      background: var(--forest-deep);
      color: white;
      text-align: center;
    }
    .hero-bg {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at center, rgba(174, 98, 116, 0.2) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 800px;
    }
    .hero h1 {
      font-size: 56px;
      font-weight: 800;
      color: white;
      margin-bottom: 24px;
      line-height: 1.1;
    }
    .hero p {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.8);
      max-width: 600px;
      margin: 0 auto;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-top: -40px;
      position: relative;
      z-index: 10;
      margin-bottom: 80px;
    }
    .stat-card {
      background: var(--card);
      padding: 32px 24px;
      border-radius: var(--radius-m);
      box-shadow: 0 12px 32px rgba(0,0,0,0.06);
      text-align: center;
      border: 1px solid var(--border-soft);
    }
    .stat-card h3 {
      font-size: 36px;
      color: var(--forest);
      margin-bottom: 8px;
    }
    .stat-card p {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ink-soft);
      margin: 0;
    }

    .mission-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: center;
      padding: 64px 32px;
      margin-bottom: 64px;
    }
    .mission-text h2 {
      font-size: 36px;
      margin-bottom: 24px;
      color: var(--ink);
    }
    .mission-text p {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .mission-image img {
      width: 100%;
      border-radius: var(--radius-l);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .alt-bg {
      background: var(--paper-warm);
      padding: 80px 0;
    }
    .section-title {
      text-align: center;
      font-size: 32px;
      margin-bottom: 48px;
    }
    .values-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
    }
    .value-card {
      background: var(--card);
      padding: 40px;
      border-radius: var(--radius-l);
      text-align: center;
    }
    .value-icon {
      margin-bottom: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--forest-tint);
      color: var(--forest-deep);
    }
    .value-card h4 {
      font-size: 22px;
      margin-bottom: 16px;
    }

    @media (max-width: 900px) {
      .stats-section { grid-template-columns: repeat(2, 1fr); }
      .mission-section { grid-template-columns: 1fr; gap: 40px; }
      .values-grid { grid-template-columns: 1fr; }
      .hero h1 { font-size: 40px; }
    }
  `]
})
export class AboutComponent {}
