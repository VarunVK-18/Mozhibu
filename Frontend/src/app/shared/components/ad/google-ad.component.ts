import {
  Component,
  AfterViewInit,
  Input,
  Inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-google-ad',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ad-container" [style.minHeight.px]="minHeight">
      <!-- Fallback text (visible if ad fails to load on localhost/adblock) -->
      <div class="ad-fallback-text">
        <span>Google AdSpace</span>
        <small>(Ad will display when domain is verified in AdSense)</small>
      </div>

      <!-- Mozhibu -->
      <ins
        class="adsbygoogle"
        style="display:block; position: relative; z-index: 2;"
        [attr.data-ad-client]="adClient"
        [attr.data-ad-slot]="adSlot"
        [attr.data-ad-format]="adFormat"
        [attr.data-full-width-responsive]="fullWidthResponsive"
      ></ins>
    </div>
  `,
  styles: [
    `
      .ad-container {
        width: 100%;
        margin: 24px 0;
        text-align: center;
        background: var(--paper-warm);
        border-radius: var(--radius-s);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .ad-fallback-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--ink-faint);
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 1;
      }
      .ad-fallback-text span {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .ad-fallback-text small {
        font-size: 11px;
        margin-top: 4px;
      }
    `,
  ],
})
export class GoogleAdComponent implements AfterViewInit {
  @Input() adClient: string = 'ca-pub-7352988656804206';
  @Input() adSlot: string = '4858424012';
  @Input() adFormat: string = 'auto';
  @Input() fullWidthResponsive: boolean = true;
  @Input() minHeight: number = 250; // Prevents layout shift while loading

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Safe push to google ads array
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
          {},
        );
      } catch (e) {
        console.error('AdSense push failed:', e);
      }
    }
  }
}
