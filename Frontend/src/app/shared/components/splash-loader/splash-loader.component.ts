import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash-overlay" [class.show]="show">
      <div class="splash-content">
        <!-- Logo Animation -->
        <div class="logo-container">
          <img src="assets/Mozhibu%20topbarcropednewLogo%20(1).png" alt="Mozhibu Logo" class="pulse-logo" />
        </div>
        
        <!-- Text -->
        <h2 class="splash-title">Loading Mozhibu Contents</h2>
        
        <!-- Progress Bar -->
        <div class="progress-bar-container">
          <div class="progress-bar"></div>
        </div>
        
        <!-- Subtext -->
        <p class="splash-subtext">This may take a few moments</p>
      </div>
    </div>
  `,
  styles: [
    `
      .splash-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #ffffff;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      
      .splash-overlay.show {
        opacity: 1;
        visibility: visible;
      }

      .splash-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 100%;
        max-width: 400px;
        padding: 24px;
      }

      .logo-container {
        margin-bottom: 40px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pulse-logo {
        width: 100px;
        height: auto;
        animation: pulse 2s infinite ease-in-out;
        filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
      }

      .splash-title {
        font-family: var(--display, 'Inter', sans-serif);
        font-size: 24px;
        font-weight: 600;
        color: var(--ink, #1a1a1a);
        margin-bottom: 32px;
        letter-spacing: -0.01em;
      }

      .progress-bar-container {
        width: 100%;
        height: 4px;
        background: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 24px;
        position: relative;
      }

      .progress-bar {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 40%;
        background: var(--ink, #1a1a1a);
        border-radius: 4px;
        animation: progress 2s infinite ease-in-out;
      }

      .splash-subtext {
        font-size: 14px;
        color: var(--ink-soft, #64748b);
        font-weight: 500;
      }

      @keyframes pulse {
        0% { transform: scale(0.95); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0.8; }
      }

      @keyframes progress {
        0% { left: -40%; width: 40%; }
        50% { left: 20%; width: 80%; }
        100% { left: 100%; width: 40%; }
      }
      
      /* Dark mode support */
      :host-context(.dark-mode) .splash-overlay {
        background: var(--paper, #18181b);
      }
      :host-context(.dark-mode) .splash-title {
        color: #ffffff;
      }
      :host-context(.dark-mode) .progress-bar-container {
        background: rgba(255, 255, 255, 0.1);
      }
      :host-context(.dark-mode) .progress-bar {
        background: #ffffff;
      }
      :host-context(.dark-mode) .splash-subtext {
        color: #a1a1aa;
      }
      
      @media (max-width: 480px) {
        .splash-content {
          padding: 20px;
          max-width: 320px;
        }
        .logo-container {
          margin-bottom: 32px;
        }
        .pulse-logo {
          width: 80px;
        }
        .splash-title {
          font-size: 20px;
          margin-bottom: 24px;
        }
        .progress-bar-container {
          margin-bottom: 20px;
        }
        .splash-subtext {
          font-size: 13px;
        }
      }
    `
  ]
})
export class SplashLoaderComponent {
  @Input() show = false;
}
