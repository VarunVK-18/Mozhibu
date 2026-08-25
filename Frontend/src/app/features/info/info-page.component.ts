import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="info-layout">
      <div class="info-header">
        <h1>{{ title }}</h1>
        <p class="subtitle">Last updated: August 25, 2026</p>
      </div>
      
      <div class="info-content">
        @if (content) {
          <div [innerHTML]="content"></div>
        } @else {
          <p class="placeholder-text">This is a placeholder page for <strong>{{ title }}</strong>. The actual content will be added here by the legal or content team.</p>
          
          <div class="placeholder-sections">
            <section>
              <h2>1. Introduction</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.</p>
            </section>
            
            <section>
              <h2>2. Information Collection</h2>
              <p>Ut tristique lectus ac ligula congue, vel auctor libero venenatis. Phasellus nisl mi, hendrerit quis viverra ut, venenatis in nisl.</p>
            </section>
            
            <section>
              <h2>3. Data Usage</h2>
              <p>Praesent egestas neque eu enim fringilla, vel tincidunt quam vulputate. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue.</p>
            </section>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .info-layout {
      min-height: calc(100vh - 73px);
      background: var(--paper);
      padding: 64px 24px;
    }

    .info-header {
      max-width: 800px;
      margin: 0 auto 48px;
      text-align: center;
    }

    .info-header h1 {
      font-family: var(--display);
      font-size: 42px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 16px;
    }

    .subtitle {
      font-size: 15px;
      color: var(--ink-faint);
    }

    .info-content {
      max-width: 800px;
      margin: 0 auto;
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-m);
      padding: 48px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.02);
    }

    .placeholder-text {
      font-size: 18px;
      color: var(--forest-deep);
      background: var(--forest-tint);
      padding: 16px 24px;
      border-radius: 8px;
      margin-bottom: 32px;
      border-left: 4px solid var(--forest);
    }

    .placeholder-sections section {
      margin-bottom: 32px;
    }

    .placeholder-sections h2 {
      font-family: var(--display);
      font-size: 22px;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 16px;
    }

    .placeholder-sections p {
      font-size: 16px;
      line-height: 1.8;
      color: var(--ink-soft);
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .info-layout {
        padding: 32px 16px;
      }
      .info-header h1 {
        font-size: 32px;
      }
      .info-content {
        padding: 24px;
      }
    }
  `]
})
export class InfoPageComponent implements OnInit {
  title = 'Information';
  content = '';

  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data['title']) {
        this.title = data['title'];
      }
      if (data['content']) {
        this.content = data['content'];
      }
    });
  }
}
