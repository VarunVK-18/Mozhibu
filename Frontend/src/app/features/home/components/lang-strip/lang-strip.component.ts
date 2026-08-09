import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

interface LangChip {
  native: string;
  en: string;
}

@Component({
  selector: 'app-lang-strip',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './lang-strip.component.html',
  styleUrls: ['./lang-strip.component.css'],
})
export class LangStripComponent {
  activeIndex = signal(0);

  readonly chips: LangChip[] = [
    { native: 'தமிழ்',   en: 'Tamil' },
    { native: 'తెలుగు',   en: 'Telugu' },
    { native: 'മലയാളം', en: 'Malayalam' },
    { native: 'ಕನ್ನಡ',   en: 'Kannada' },
    { native: 'বাংলা',    en: 'Bengali' },
    { native: 'हिंदी',     en: 'Hindi' },
    { native: 'ਪੰਜਾਬੀ',  en: 'Punjabi' },
    { native: 'मराठी',    en: 'Marathi' },
    { native: 'اردو',      en: 'Urdu' },
    { native: 'ગુજરાતી', en: 'Gujarati' },
    { native: 'ଓଡ଼ିଆ',   en: 'Odia' },
    { native: 'English',  en: 'English' },
  ];

  selectChip(index: number): void {
    this.activeIndex.set(index);
  }
}
