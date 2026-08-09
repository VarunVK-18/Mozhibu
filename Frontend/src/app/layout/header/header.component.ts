import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Lang, LangOption } from '../../core/services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  langMenuOpen = signal(false);



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
  }

  constructor(
    public langService: LanguageService,
    public authService: AuthService,
    private router: Router
  ) {}

  get camelCaseName(): string {
    const user = this.authService.user();
    if (!user) return '';
    // Format firstName and lastName to camelCase (e.g., "John", "Doe" -> "johnDoe")
    const first = user.firstName.toLowerCase();
    const last = user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1).toLowerCase();
    return first + last;
  }

  get firstInitial(): string {
    const user = this.authService.user();
    return user ? user.firstName.charAt(0).toUpperCase() : '';
  }

  onProfileClick(): void {
    if (!this.authService.user()) {
      this.router.navigate(['/login']);
    } else {
      // Optional: simulate logout if clicking again
      this.authService.logout();
    }
  }
}
