import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Lang, LangOption } from '../../core/services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  langMenuOpen = signal(false);
  profileMenuOpen = signal(false);



  get currentLang(): LangOption {
    return this.langService.getCurrentLangOption();
  }

  toggleLangMenu(): void {
    this.langMenuOpen.update(v => !v);
  }

  selectLang(lang: Lang): void {
    this.langService.setLanguage(lang);
    this.langMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.lang-dropdown-wrapper')) {
      this.langMenuOpen.set(false);
    }
    if (!target.closest('.user-profile-wrapper')) {
      this.profileMenuOpen.set(false);
    }
  }

  constructor(
    public langService: LanguageService,
    public authService: AuthService,
    private router: Router
  ) {}

  get camelCaseName(): string {
    const user = this.authService.user();
    if (!user || !user.username) return '';
    // Format username to camelCase (e.g. split by space and camelcase)
    const words = user.username.trim().split(/\s+/);
    if (words.length === 1) return words[0].toLowerCase();
    
    const first = words[0].toLowerCase();
    const rest = words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    return first + rest;
  }

  get firstInitial(): string {
    const user = this.authService.user();
    return (user && user.username) ? user.username.charAt(0).toUpperCase() : '';
  }

  onProfileClick(): void {
    if (!this.authService.user()) {
      this.router.navigate(['/login']);
    } else {
      this.profileMenuOpen.update(v => !v);
    }
  }

  onLogout(): void {
    if (confirm('Are you sure you want to log out?')) {
      this.authService.logout();
      this.profileMenuOpen.set(false);
    }
  }

  requireAuth(event: Event, action?: () => void): void {
    event.preventDefault();
    if (!this.authService.user()) {
      this.router.navigate(['/login']);
    } else if (action) {
      action();
    }
  }
}
