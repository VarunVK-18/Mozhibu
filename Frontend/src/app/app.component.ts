import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { CommonModule, ViewportScroller } from '@angular/common';
import { LoadingService } from './core/services/loading.service';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';
import { OnboardingComponent } from './features/auth/onboarding/onboarding.component';

import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    ConfirmModalComponent,
    OnboardingComponent,
  ],
  template: `
    <!-- Update Available Banner -->
    @if (showUpdateBanner()) {
      <div class="update-banner">
        <span>🚀 A new version of Mozhibu is available!</span>
        <button class="update-btn" (click)="applyUpdate()">Update Now</button>
        <button class="dismiss-btn" (click)="showUpdateBanner.set(false)">✕</button>
      </div>
    }
    @if (!isStandaloneRoute) {
      <app-header></app-header>
    }
    <main [class.with-header]="!isStandaloneRoute">
      <router-outlet></router-outlet>
    </main>
    @if (!isStandaloneRoute) {
      <app-footer></app-footer>
    }
    <app-confirm-modal></app-confirm-modal>
    @if (authService.user() && authService.user()?.role !== 'admin' && authService.user()?.role !== 'superadmin' && (!authService.user()?.penName || !authService.user()?.legalName || !authService.user()?.dob) && !currentUrl.startsWith('/settings')) {
      <app-onboarding></app-onboarding>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      main {
        flex: 1 0 auto;
        display: flex;
        flex-direction: column;
      }
      main.with-header {
        padding-top: 73px;
      }
      app-header, app-footer {
        flex-shrink: 0;
      }

      /* Update Banner */
      .update-banner {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99998;
        display: flex;
        align-items: center;
        gap: 12px;
        background: #1a1a2e;
        color: #fff;
        padding: 12px 20px;
        border-radius: 100px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.35);
        font-size: 14px;
        font-weight: 500;
        animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        white-space: nowrap;
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      .update-btn {
        background: #10b981;
        color: #fff;
        border: none;
        padding: 6px 16px;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s;
      }
      .update-btn:hover { background: #059669; }
      .dismiss-btn {
        background: transparent;
        border: none;
        color: rgba(255,255,255,0.5);
        cursor: pointer;
        font-size: 16px;
        padding: 0 4px;
        line-height: 1;
        transition: color 0.2s;
      }
      .dismiss-btn:hover { color: #fff; }

      @media (max-width: 480px) {
        .update-banner {
          bottom: 16px;
          left: 16px;
          right: 16px;
          transform: none;
          border-radius: 16px;
          white-space: normal;
          flex-wrap: wrap;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      }
    `,
  ],
})
export class AppComponent {
  private router = inject(Router);
  public authService = inject(AuthService);
  public loadingService = inject(LoadingService);
  private themeService = inject(ThemeService);
  private swUpdate = inject(SwUpdate);
  private viewportScroller = inject(ViewportScroller);
  isStandaloneRoute = false;
  currentUrl = '';
  showUpdateBanner = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.currentUrl = url;
        this.isStandaloneRoute =
          url.startsWith('/admin') ||
          url.startsWith('/read') ||
          url.startsWith('/login') ||
          url.startsWith('/signup') ||
          url.startsWith('/account-suspended') ||
          url.startsWith('/onboarding');

        const user = this.authService.user();

        if (user?.status === 'suspended') {
          if (
            !url.startsWith('/account-suspended') &&
            !url.startsWith('/help') &&
            !url.startsWith('/contact')
          ) {
            this.router.navigate(['/account-suspended']);
          }
        }

        // Check for new SW version on each navigation (catches deployments faster)
        if (this.swUpdate.isEnabled) {
          this.swUpdate.checkForUpdate().catch(() => {});
        }
      });

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(
          filter(
            (evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY',
          ),
        )
        .subscribe(() => {
          // Show non-blocking banner instead of native confirm()
          this.showUpdateBanner.set(true);
        });
    }
  }

  applyUpdate() {
    window.location.reload();
  }
}
