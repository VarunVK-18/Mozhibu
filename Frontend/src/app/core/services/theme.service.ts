import { Injectable, signal, afterNextRender } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public isDarkMode = signal<boolean>(false);

  constructor() {
    afterNextRender(() => {
      this.initTheme();
    });
  }

  private initTheme() {
    if (typeof localStorage === 'undefined') return;
    const savedTheme = localStorage.getItem('globalDarkMode');
    if (savedTheme) {
      const isDark = savedTheme === 'true';
      this.isDarkMode.set(isDark);
      this.applyTheme(isDark);
    } else {
      // Default to light mode, or could check system preference
      this.applyTheme(false);
    }
  }

  public toggleTheme() {
    const newTheme = !this.isDarkMode();
    this.isDarkMode.set(newTheme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('globalDarkMode', String(newTheme));
    }
    this.applyTheme(newTheme);
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
