import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-account-suspended',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="suspended-container">
      <div class="suspended-card">
        <div class="badge-wrapper">
          <span class="suspended-badge">SUSPENDED</span>
        </div>

        <h1 class="suspended-title">Your Mozhibu account is suspended</h1>

        <p class="suspended-desc">
          @if (remainingText()) {
            Your Mozhibu account has been suspended. You can access your account again in
            <strong>{{ remainingText() }}</strong>. For more information,
            visit the <a routerLink="/help" class="inline-link">Help Center</a> or
            <a routerLink="/contact" class="inline-link">file a support ticket</a>.
          } @else {
            Your Mozhibu account has been suspended which means you can’t
            access your author portal, stories, or interact on Mozhibu. For more information,
            visit the <a routerLink="/help" class="inline-link">Help Center</a> or
            <a routerLink="/contact" class="inline-link">file a support ticket</a>.
          }
        </p>

        <div class="actions">
          <button class="help-btn" (click)="goToHelp()">
            Help Center
          </button>

          <button class="logout-btn" (click)="logout()">
            Log out
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .suspended-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 24px 16px;
        background-color: var(--bg-primary, #ffffff);
        color: var(--text-primary, #0f1419);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }

      .suspended-card {
        max-width: 540px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 40px 24px;
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .badge-wrapper {
        margin-bottom: 20px;
      }

      .suspended-badge {
        display: inline-block;
        background-color: #e0245e;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 5px 16px;
        border-radius: 9999px;
        box-shadow: 0 2px 6px rgba(224, 36, 94, 0.25);
      }

      .suspended-title {
        font-size: 28px;
        font-weight: 800;
        line-height: 1.25;
        margin: 0 0 16px 0;
        color: var(--text-primary, #0f1419);
      }

      .suspended-desc {
        font-size: 15px;
        line-height: 1.6;
        color: var(--text-secondary, #536471);
        margin: 0 0 32px 0;
        max-width: 480px;
      }

      .inline-link {
        color: var(--gold, #b98b32);
        font-weight: 600;
        text-decoration: none;
        transition: text-decoration 0.2s;
      }

      .inline-link:hover {
        text-decoration: underline;
      }

      .actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        width: 100%;
      }

      /* Logo Gold Button */
      .help-btn {
        background: var(--gold, #b98b32);
        color: #ffffff;
        border: none;
        border-radius: 9999px;
        font-size: 15px;
        font-weight: 700;
        padding: 13px 48px;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
        box-shadow: 0 4px 12px rgba(185, 139, 50, 0.35);
      }

      .help-btn:hover {
        background: #a67c29;
        box-shadow: 0 6px 16px rgba(185, 139, 50, 0.45);
      }

      .help-btn:active {
        transform: scale(0.98);
      }

      .logout-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary, #536471);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        padding: 6px 16px;
        transition: color 0.2s;
      }

      .logout-btn:hover {
        color: #e0245e;
        text-decoration: underline;
      }

      @media (max-width: 600px) {
        .suspended-title {
          font-size: 24px;
        }

        .suspended-desc {
          font-size: 14px;
        }

        .help-btn {
          width: 100%;
          max-width: 280px;
        }
      }
    `,
  ],
})
export class AccountSuspendedComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  remainingText = computed(() => {
    const user = this.authService.user();
    if (!user || !user.suspendedUntil) return null;
    const diff = new Date(user.suspendedUntil).getTime() - Date.now();
    if (diff <= 0) return null;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 1) {
      const remHours = hours % 24;
      return remHours > 0 ? `${days} days ${remHours} hours` : `${days} days`;
    }
    if (days === 1) {
      const remHours = hours % 24;
      return remHours > 0 ? `1 day ${remHours} hours` : `1 day`;
    }
    if (hours > 1) return `${hours} hours`;
    if (hours === 1) {
      const remMins = minutes % 60;
      return remMins > 0 ? `1 hour ${remMins} minutes` : `1 hour`;
    }
    if (minutes > 1) return `${minutes} minutes`;
    return '1 minute';
  });

  goToHelp() {
    this.router.navigate(['/help']);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
