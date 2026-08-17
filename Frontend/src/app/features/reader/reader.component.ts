import { Component, signal, OnInit, HostListener, OnDestroy, inject, computed, effect } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';
import { StoryService } from '../../core/services/story.service';

@Component({
  selector: 'app-reader',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="reader-container" [class.dark-mode]="isDarkMode()">
      
      <!-- Topbar -->
      <header class="reader-header" [class.hidden]="!showControls()">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back
        </button>
        <div class="chapter-info">
          <span class="story-title">{{ storyTitle }}</span>
          <span class="chapter-title">{{ chapterTitle }}</span>
        </div>
        <div class="header-actions">
          <select (change)="onLangChange($event)" class="lang-select-reader" [value]="langService.currentLang()">
            @for (lang of langService.languages; track lang.code) {
              <option [value]="lang.code">{{ lang.native }}</option>
            }
          </select>
        </div>
      </header>

      <!-- Reading Area -->
      <main class="reading-area" (click)="toggleControls()" [style.fontSize.px]="fontSize()">
        @if (requiresSubscription()) {
          <div class="paywall-overlay">
            <div class="paywall-content">
              <div class="paywall-icon">👑</div>
              <h2>Premium Chapter</h2>
              <p>This chapter is exclusive to Mozhibu Premium subscribers.</p>
              <a routerLink="/subscription/plans" class="btn-subscribe">View Premium Plans</a>
            </div>
          </div>
        } @else {
          <div class="content-wrapper" [innerHTML]="chapterContent()" [style.display]="isTranslating() ? 'none' : 'block'"></div>
        }
        
        <div class="skeleton-buffer" *ngIf="isTranslating()">
          <div class="skeleton-line" style="width: 80%"></div>
          <div class="skeleton-line" style="width: 100%"></div>
          <div class="skeleton-line" style="width: 90%"></div>
          <div class="skeleton-line" style="width: 95%"></div>
          <div class="skeleton-line" style="width: 60%"></div>
          <br>
          <div class="skeleton-line" style="width: 100%"></div>
          <div class="skeleton-line" style="width: 85%"></div>
          <div class="skeleton-line" style="width: 95%"></div>
          <br>
          <div class="skeleton-line" style="width: 90%"></div>
          <div class="skeleton-line" style="width: 100%"></div>
        </div>
      </main>

      <!-- Bottom Toolbar -->
      <footer class="reader-footer" [class.hidden]="!showControls() || requiresSubscription()">
        <div class="toolbar-content">
          <button class="nav-btn" (click)="prevChapter()" [disabled]="currentChapterNum() === 1" [style.opacity]="currentChapterNum() === 1 ? '0.3' : '1'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Prev
          </button>
          
          <div class="settings-group">
            <button class="icon-btn" (click)="decreaseFont()" [disabled]="fontSize() <= 14">
              <span class="text-icon small">A</span>
            </button>
            <span class="font-size-display">{{ fontSize() }}px</span>
            <button class="icon-btn" (click)="increaseFont()" [disabled]="fontSize() >= 28">
              <span class="text-icon large">A</span>
            </button>
            
            <div class="divider"></div>
            
            <button class="icon-btn theme-btn" (click)="toggleTheme()">
              @if (isDarkMode()) {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              } @else {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              }
            </button>
          </div>

          <button class="nav-btn" (click)="nextChapter()">
            Next
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* Base Reader Variables */
    :host {
      display: block;
      --reader-bg: #FFFFFF;
      --reader-text: #2B2620;
      --reader-surface: #F7F7F7;
      --reader-border: #E6DDCB;
      --reader-accent: #3F6259;
    }
    
    .dark-mode {
      --reader-bg: #121212;
      --reader-text: #E0E0E0;
      --reader-surface: #1E1E1E;
      --reader-border: #333333;
      --reader-accent: #5C8F82;
    }

    .reader-container {
      min-height: 100vh;
      background-color: var(--reader-bg);
      color: var(--reader-text);
      font-family: var(--body);
      transition: background-color 0.3s, color 0.3s;
      position: relative;
    }

    /* Topbar */
    .reader-header {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 64px;
      background-color: var(--reader-surface);
      border-bottom: 1px solid var(--reader-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 50;
      transition: transform 0.3s ease;
    }
    
    .reader-header.hidden {
      transform: translateY(-100%);
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      color: var(--reader-text);
      font-family: var(--display);
      font-weight: 500;
      font-size: 15px;
      cursor: pointer;
      padding: 8px;
    }

    .chapter-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .story-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--reader-text);
      opacity: 0.6;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .chapter-title {
      font-family: var(--display);
      font-size: 16px;
      font-weight: 600;
    }
    
    .chapter-title {
      font-family: var(--display);
      font-size: 16px;
      font-weight: 600;
    }
    
    .header-actions {
      display: flex;
      align-items: center;
    }
    
    .lang-select-reader {
      background: var(--reader-bg);
      color: var(--reader-text);
      border: 1px solid var(--reader-border);
      padding: 6px 12px;
      border-radius: 100px;
      font-family: var(--body);
      font-size: 13px;
      cursor: pointer;
      outline: none;
    }

    .skeleton-buffer {
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px 0;
    }
    .skeleton-line { height: 1em; background: var(--reader-border); margin-bottom: 0.8em; border-radius: 4px; animation: pulse 1.5s infinite; }
    
    @keyframes pulse {
      0% { opacity: 0.4; }
      50% { opacity: 0.8; }
      100% { opacity: 0.4; }
    }

    /* Reading Area */
    .reading-area {
      min-height: 100vh;
      padding: 100px 24px;
      cursor: pointer;
    }

    .content-wrapper {
      max-width: 680px;
      margin: 0 auto;
      line-height: 1.8;
      white-space: pre-wrap;
    }

    .content-wrapper p {
      margin-bottom: 1.5em;
    }

    /* Paywall */
    .paywall-overlay {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      text-align: center;
    }
    .paywall-content {
      background: var(--reader-surface);
      border: 1px solid var(--reader-border);
      border-radius: 16px;
      padding: 48px;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .paywall-icon { font-size: 48px; margin-bottom: 16px; }
    .paywall-content h2 { font-family: var(--display); font-size: 24px; margin: 0 0 12px; }
    .paywall-content p { font-size: 15px; opacity: 0.8; margin: 0 0 24px; line-height: 1.5; }
    .btn-subscribe {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 100px;
      font-weight: 700;
      font-size: 15px;
      transition: transform 0.2s;
    }
    .btn-subscribe:hover { transform: translateY(-2px); }

    /* Bottom Toolbar */
    .reader-footer {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      height: 72px;
      background-color: var(--reader-surface);
      border-top: 1px solid var(--reader-border);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      transition: transform 0.3s ease;
    }

    .reader-footer.hidden {
      transform: translateY(100%);
    }

    .toolbar-content {
      width: 100%;
      max-width: 680px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
    }

    .nav-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: var(--reader-text);
      font-family: var(--display);
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: color 0.2s;
    }
    
    .nav-btn:hover {
      color: var(--reader-accent);
    }

    .settings-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .icon-btn {
      background: none;
      border: none;
      color: var(--reader-text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    
    .icon-btn:hover:not(:disabled) {
      background-color: rgba(128, 128, 128, 0.1);
    }
    
    .icon-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    .text-icon {
      font-family: serif;
      font-weight: bold;
    }
    .text-icon.small { font-size: 14px; }
    .text-icon.large { font-size: 20px; }
    
    .font-size-display {
      font-size: 14px;
      font-variant-numeric: tabular-nums;
      width: 40px;
      text-align: center;
      opacity: 0.7;
    }
    
    .divider {
      width: 1px;
      height: 24px;
      background-color: var(--reader-border);
    }
    
    @media (max-width: 600px) {
      .reading-area { padding: 80px 20px; }
      .chapter-title { font-size: 14px; }
      .story-title { font-size: 10px; }
      .toolbar-content { padding: 0 16px; }
    }
  `]
})
export class ReaderComponent implements OnInit, OnDestroy {
  storyTitle = 'Reading...';
  chapterTitle = '';
  currentChapterNum = signal(1);
  
  showControls = signal(true);
  isDarkMode = signal(false);
  fontSize = signal(18); // Default font size in px
  
  storyId: string = '';
  chapterContent = signal<SafeHtml>('');
  isTranslating = signal(false);
  requiresSubscription = signal(false);
  currentHtml = '';

  private authService = inject(AuthService);
  private storyService = inject(StoryService);
  private document = inject(DOCUMENT);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  public langService = inject(LanguageService);
  
  private scrollSubject = new Subject<number>();
  private scrollSub?: Subscription;

  storyEpisodes = this.storyService.getEpisodes();
  storyDetail = this.storyService.getActiveStory();

  constructor(private route: ActivatedRoute, private router: Router) {
    effect(() => {
      const episodes = this.storyEpisodes();
      const detail = this.storyDetail();
      
      if (detail) {
        this.storyTitle = detail.title;
      }

      if (episodes && episodes.length > 0) {
        const currentEp = episodes.find(e => e.episode === this.currentChapterNum()) || episodes[0];
        if (currentEp) {
          this.chapterTitle = currentEp.title || `Chapter ${currentEp.episode}`;
          this.requiresSubscription.set(!currentEp.isUnlocked);
          
          if (currentEp.isUnlocked && currentEp.content) {
            this.currentHtml = currentEp.content;
            this.processContent(currentEp.content);
          } else {
            this.currentHtml = '';
            this.chapterContent.set('');
          }
        }
      }
    }, { allowSignalWrites: true });
  }

  processContent(html: string) {
    const currentLang = this.langService.currentLang();
    
    if (currentLang === 'en') {
      this.chapterContent.set(this.sanitizer.bypassSecurityTrustHtml(html));
    } else {
      this.isTranslating.set(true);
      this.http.post<{content: string}>('http://localhost:5000/api/books/translate-html', {
        html: html,
        targetLang: currentLang
      }).subscribe({
        next: (res) => {
          this.chapterContent.set(this.sanitizer.bypassSecurityTrustHtml(res.content));
          this.isTranslating.set(false);
        },
        error: (err) => {
          console.error('Translation failed', err);
          this.chapterContent.set(this.sanitizer.bypassSecurityTrustHtml(html));
          this.isTranslating.set(false);
        }
      });
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.storyId = params.get('storyId') || '';
      if (this.storyId) {
        // This will fetch chapters and update the storyEpisodes signal
        this.storyService.loadStory(this.storyId, false);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const chapterStr = params.get('chapter');
      if (chapterStr) {
        const parsed = parseInt(chapterStr, 10);
        if (!isNaN(parsed) && parsed > 0) {
          this.currentChapterNum.set(parsed);
        }
      }
    });

    this.scrollSub = this.scrollSubject.pipe(
      debounceTime(2000)
    ).subscribe(percentage => {
      this.saveProgress(percentage);
    });
  }

  ngOnDestroy(): void {
    if (this.scrollSub) {
      this.scrollSub.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollOffset = window.scrollY || this.document.documentElement.scrollTop || this.document.body.scrollTop || 0;
    const scrollHeight = this.document.documentElement.scrollHeight || this.document.body.scrollHeight || 0;
    const clientHeight = this.document.documentElement.clientHeight || window.innerHeight || 0;
    
    let percent = 0;
    if (scrollHeight > clientHeight) {
      percent = (scrollOffset / (scrollHeight - clientHeight)) * 100;
    }
    
    percent = Math.max(0, Math.min(100, Math.round(percent)));
    this.scrollSubject.next(percent);
  }

  saveProgress(percentage: number) {
    if (this.storyId && this.authService.user()) {
      this.authService.updateReadingProgress(this.storyId, undefined, percentage).subscribe({
        error: (err) => console.error('Failed to save reading progress', err)
      });
    }
  }

  toggleControls(): void {
    this.showControls.update(v => !v);
  }

  toggleTheme(): void {
    this.isDarkMode.update(v => !v);
  }

  increaseFont(): void {
    if (this.fontSize() < 28) {
      this.fontSize.update(v => v + 2);
    }
  }

  decreaseFont(): void {
    if (this.fontSize() > 14) {
      this.fontSize.update(v => v - 2);
    }
  }

  goBack(): void {
    if (this.storyId) {
      this.router.navigate(['/story', this.storyId]);
    } else {
      this.router.navigate(['/']);
    }
  }

  nextChapter() {
    this.currentChapterNum.update(n => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { chapter: this.currentChapterNum() },
      queryParamsHandling: 'merge',
    });
  }

  prevChapter() {
    if (this.currentChapterNum() > 1) {
      this.currentChapterNum.update(n => n - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { chapter: this.currentChapterNum() },
        queryParamsHandling: 'merge',
      });
    }
  }

  onLangChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const targetLang = select.value as any;
    
    // Update global language service so header syncs
    this.langService.setLanguage(targetLang);
    
    if (targetLang === 'en') {
      this.chapterContent.set(this.sanitizer.bypassSecurityTrustHtml(this.currentHtml));
      return;
    }
    
    this.isTranslating.set(true);
    this.http.post<{content: string}>('http://localhost:5000/api/books/translate-html', {
      html: this.currentHtml,
      targetLang: targetLang
    }).subscribe({
      next: (res) => {
        this.chapterContent.set(this.sanitizer.bypassSecurityTrustHtml(res.content));
        this.isTranslating.set(false);
      },
      error: (err) => {
        console.error('Translation failed', err);
        this.isTranslating.set(false);
        const fallbackHtml = `<div style="padding: 16px; margin-bottom: 24px; background: #FFF4E5; border-left: 4px solid #FFA000; color: #b27300; border-radius: 4px;">
          <strong>API Rate Limit Reached:</strong> The Gemini API is currently receiving too many requests. Showing original English text. Please try again in about a minute.
        </div>` + this.currentHtml;
        this.chapterContent.set(this.sanitizer.bypassSecurityTrustHtml(fallbackHtml));
      }
    });
  }
}
