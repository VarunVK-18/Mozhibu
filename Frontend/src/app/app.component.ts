import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { CommonModule } from '@angular/common';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  template: `
    @if (loadingService.loading()) {
      <div class="global-loading-bar">
        <div class="global-loading-progress"></div>
      </div>
    }
    @if (!isStandaloneRoute) {
      <app-header></app-header>
    }
    <main>
      <router-outlet></router-outlet>
    </main>
    @if (!isStandaloneRoute) {
      <app-footer></app-footer>
    }
  `,
  styles: [`
    main { min-height: calc(100vh - 73px); }
  `]
})
export class AppComponent {
  private router = inject(Router);
  public loadingService = inject(LoadingService);
  isStandaloneRoute = false;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isStandaloneRoute = event.urlAfterRedirects.startsWith('/admin') || event.urlAfterRedirects.startsWith('/read');
    });
  }
}
