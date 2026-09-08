import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { CommonModule } from '@angular/common';
import { LoadingService } from './core/services/loading.service';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';

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
  ],
  template: `
    @if (!isStandaloneRoute) {
      <app-header></app-header>
    }
    <main>
      <router-outlet></router-outlet>
    </main>
    @if (!isStandaloneRoute) {
      <app-footer></app-footer>
    }
    <app-confirm-modal></app-confirm-modal>
  `,
  styles: [
    `
      main {
        min-height: calc(100vh - 73px);
      }
    `,
  ],
})
export class AppComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  public loadingService = inject(LoadingService);
  private themeService = inject(ThemeService);
  private swUpdate = inject(SwUpdate);
  isStandaloneRoute = false;

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.isStandaloneRoute =
          url.startsWith('/admin') ||
          url.startsWith('/read') ||
          url.startsWith('/login') ||
          url.startsWith('/signup') ||
          url.startsWith('/account-suspended');

        if (this.authService.user()?.status === 'suspended') {
          if (
            !url.startsWith('/account-suspended') &&
            !url.startsWith('/help') &&
            !url.startsWith('/contact')
          ) {
            this.router.navigate(['/account-suspended']);
          }
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
          if (confirm('A new update is available! Reload to apply?')) {
            window.location.reload();
          }
        });
    }
  }
}
