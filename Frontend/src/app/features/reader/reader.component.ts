import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

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
          <!-- Placeholder for options -->
        </div>
      </header>

      <!-- Reading Area -->
      <main class="reading-area" (click)="toggleControls()" [style.fontSize.px]="fontSize()">
        <div class="content-wrapper">
          <p>
            The neon lights of Neo-Kyoto flickered, casting long, vibrant shadows across the rain-slicked pavement. Akira pulled up the collar of his trench coat, the synthetic fabric repelling the acidic drizzle. He checked his neural interface; the target's signal was weak, but definitely close. 
          </p>
          <p>
            "You sure about this, kid?" barked the gruff voice of Captain Sato through the comms link. "This sector is crawling with Chrome Syndicate thugs."
          </p>
          <p>
            "I'm sure," Akira muttered, his eyes scanning the alleyway. "The data drive is here. I can feel it." 
          </p>
          <p>
            He stepped over a pile of discarded tech-junk, the remnants of a failed cybernetic augmentation clinic. The hum of a rogue generator vibrated in the soles of his boots. He reached for the heavy blaster holstered at his side, the cold metal a comforting weight.
          </p>
          <p>
            Suddenly, a shadow detached itself from the gloom. A figure, clad head-to-toe in matte-black armor, stepped into the meager light of a flickering streetlamp. The figure held a sleek, humming vibro-blade.
          </p>
          <p>
            "You're late, Akira," the figure hissed, its voice synthesized and devoid of emotion. 
          </p>
          <p>
            Akira drew his blaster in a fluid motion, aiming it dead center at the figure's chest. "I didn't think you'd actually show up, Kael."
          </p>
          <p>
            "I never miss a reunion," Kael replied, raising the vibro-blade. "Especially not when there's a score to settle."
          </p>
          <p>
            The air crackled with tension, the rain seeming to freeze in the tense silence. Akira knew this was it. The culmination of months of tracking, of betrayals, and of close calls. He tightened his grip on the blaster.
          </p>
          <p>
            "Give me the drive, Kael. It's over."
          </p>
          <p>
            Kael chuckled, a harsh, metallic sound. "It's never over, Akira. Not in this city." And with that, he lunged.
          </p>
        </div>
      </main>

      <!-- Bottom Toolbar -->
      <footer class="reader-footer" [class.hidden]="!showControls()">
        <div class="toolbar-content">
          <button class="nav-btn">
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

          <button class="nav-btn">
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
    
    .header-actions {
      width: 70px; /* Balance the back button */
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
    }

    .content-wrapper p {
      margin-bottom: 1.5em;
    }

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
export class ReaderComponent implements OnInit {
  storyTitle = 'The Neon Shadows';
  chapterTitle = 'Chapter 1: The Drop';
  
  showControls = signal(true);
  isDarkMode = signal(false);
  fontSize = signal(18); // Default font size in px
  
  storyId: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.storyId = params.get('storyId') || '';
    });
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
}
