import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="placeholder-container">
      <div class="placeholder-content">
        <div class="icon-wrapper">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            ></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h1>{{ pageTitle() }}</h1>
        <p>
          We are currently building the {{ pageTitle() }} experience. Check back
          soon for exciting updates!
        </p>

        <div class="notify-form" *ngIf="!subscribed()">
          <input
            type="email"
            placeholder="Enter your email address..."
            class="notify-input"
            [(ngModel)]="email"
          />
          <button class="btn-primary" (click)="subscribe()">Notify Me</button>
        </div>

        <div class="success-msg" *ngIf="subscribed()">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          You're on the list! We'll notify you when it's ready.
        </div>

        <button class="btn-text" (click)="goHome()" style="margin-top: 24px;">
          Back to Home
        </button>
      </div>
    </div>
  `,
  styles: [
    `
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
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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
      .notify-form {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
      }
      .notify-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid var(--border);
        border-radius: var(--radius-m);
        font-size: 15px;
        font-family: inherit;
      }
      .notify-input:focus {
        outline: none;
        border-color: var(--forest);
      }
      .success-msg {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #2e7d32;
        background: #e8f5e9;
        padding: 12px;
        border-radius: var(--radius-m);
        font-weight: 500;
        margin-bottom: 24px;
      }
      .btn-text {
        background: none;
        border: none;
        color: var(--ink-soft);
        font-weight: 500;
        cursor: pointer;
        font-size: 14px;
      }
      .btn-text:hover {
        color: var(--ink);
        text-decoration: underline;
      }
      .btn-primary {
        background: var(--forest);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: var(--radius-m);
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .btn-primary:hover {
        opacity: 0.9;
      }
    `,
  ],
})
export class PlaceholderPageComponent implements OnInit {
  router = inject(Router);
  pageTitle = signal('');
  subscribed = signal(false);
  email = '';

  ngOnInit() {
    const url = this.router.url.split('/')[1] || '';
    const title = url.replace('-', ' ');
    this.pageTitle.set(title);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  subscribe() {
    if (this.email && this.email.includes('@')) {
      this.subscribed.set(true);
    }
  }
}
