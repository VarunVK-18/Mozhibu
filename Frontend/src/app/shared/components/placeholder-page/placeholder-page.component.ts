import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-container">
      <div class="placeholder-content">
        <div class="icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <h1>{{ pageTitle() }}</h1>
        <p>We are currently building the {{ pageTitle() }} experience. Check back soon for exciting updates!</p>
        <button class="btn-primary" (click)="goHome()">Back to Home</button>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      width: 100%;
      min-height: calc(100vh - 72px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--paper);
      padding: 40px 20px;
    }
    .placeholder-content {
      max-width: 500px;
      text-align: center;
      background: white;
      padding: 48px;
      border-radius: var(--radius-l);
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }
    .icon-wrapper {
      width: 80px;
      height: 80px;
      background: var(--paper-warm);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      color: var(--forest);
    }
    .icon-wrapper svg {
      width: 32px;
      height: 32px;
    }
    h1 {
      font-family: var(--display);
      font-size: 32px;
      color: var(--ink);
      margin-bottom: 16px;
      text-transform: capitalize;
    }
    p {
      color: var(--ink-soft);
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .btn-primary {
      background: var(--forest);
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 100px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-primary:hover {
      opacity: 0.9;
    }
  `]
})
export class PlaceholderPageComponent implements OnInit {
  router = inject(Router);
  pageTitle = signal('');

  ngOnInit() {
    const url = this.router.url.split('/')[1] || '';
    const title = url.replace('-', ' ');
    this.pageTitle.set(title);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
