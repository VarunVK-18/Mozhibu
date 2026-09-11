import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-container">
      <div class="error-visual">
        <h1 class="error-code">404</h1>
        <div class="cloud-overlay"></div>
      </div>
      
      <div class="error-content">
        <h2>Sorry, that page could not be found</h2>
        <p>The requested page either doesn't exist or you don't have access to it.</p>
        <button class="home-btn" routerLink="/">Return Home</button>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found-container {
        min-height: calc(100vh - 140px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: #fdfdfd;
        overflow: hidden;
        position: relative;
        padding: 40px 20px;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .not-found-container {
          background: var(--surface-bg, #0f172a);
        }
      }

      .error-visual {
        position: relative;
        margin-bottom: 30px;
        display: flex;
        justify-content: center;
      }

      .error-code {
        font-size: 25vw;
        line-height: 0.8;
        font-weight: 800;
        margin: 0;
        color: #8ab0a4; /* Sage/teal color from screenshot */
        font-family: var(--display, system-ui, sans-serif);
        letter-spacing: -0.05em;
        z-index: 1;
      }

      @media (min-width: 1200px) {
        .error-code {
          font-size: 300px;
        }
      }

      /* Cloud fade effect using CSS masks and gradients */
      .cloud-overlay {
        position: absolute;
        bottom: -20px;
        left: -10vw;
        right: -10vw;
        height: 60%;
        z-index: 2;
        background: linear-gradient(
          to top,
          #fdfdfd 0%,
          rgba(253, 253, 253, 0.9) 20%,
          rgba(253, 253, 253, 0.5) 60%,
          transparent 100%
        );
        /* Add some SVG noise/clouds via mask if desired, but a smooth gradient works well for the fade */
      }

      @media (prefers-color-scheme: dark) {
        .cloud-overlay {
          background: linear-gradient(
            to top,
            var(--surface-bg, #0f172a) 0%,
            rgba(15, 23, 42, 0.9) 20%,
            rgba(15, 23, 42, 0.5) 60%,
            transparent 100%
          );
        }
        .error-code {
          color: #4b7a6c;
        }
      }

      .error-content {
        position: relative;
        z-index: 3;
        animation: slideUp 0.6s ease-out forwards;
        animation-delay: 0.2s;
        opacity: 0;
        transform: translateY(20px);
      }

      .error-content h2 {
        font-size: 2rem;
        color: #111827;
        margin-bottom: 12px;
        font-family: var(--display, system-ui, sans-serif);
      }

      .error-content p {
        color: #6b7280;
        font-size: 1.1rem;
        margin-bottom: 30px;
      }

      @media (prefers-color-scheme: dark) {
        .error-content h2 { color: #f9fafb; }
        .error-content p { color: #9ca3af; }
      }

      .home-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 12px 32px;
        border-radius: 100px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, background 0.2s;
      }

      .home-btn:hover {
        background: #059669;
        transform: translateY(-2px);
      }

      @keyframes slideUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  ]
})
export class NotFoundComponent {}
