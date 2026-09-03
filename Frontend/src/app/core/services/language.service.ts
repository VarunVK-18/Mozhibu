import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export type Lang =
  | 'en'
  | 'ta'
  | 'hi'
  | 'te'
  | 'ml'
  | 'kn'
  | 'bn'
  | 'pa'
  | 'mr'
  | 'ur'
  | 'gu'
  | 'or';

export interface LangOption {
  code: Lang;
  native: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly languages: LangOption[] = [
    { code: 'en', native: 'English', label: 'EN' },
    { code: 'ta', native: 'தமிழ்', label: 'தமிழ்' },
    { code: 'hi', native: 'हिंदी', label: 'हिंदी' },
    { code: 'te', native: 'తెలుగు', label: 'తెలుగు' },
    { code: 'ml', native: 'മലയാളം', label: 'മലയാളം' },
    { code: 'kn', native: 'ಕನ್ನಡ', label: 'ಕನ್ನಡ' },
    { code: 'bn', native: 'বাংলা', label: 'বাংলা' },
    { code: 'pa', native: 'ਪੰਜਾਬੀ', label: 'ਪੰਜਾਬੀ' },
    { code: 'mr', native: 'मराठी', label: 'मराठी' },
    { code: 'ur', native: 'اردو', label: 'اردو' },
    { code: 'gu', native: 'ગુજરાતી', label: 'ગુજરાતી' },
    { code: 'or', native: 'ଓଡ଼ିଆ', label: 'ଓଡ଼ିଆ' },
  ];

  private _lang = signal<Lang>('en');
  readonly currentLang = this._lang.asReadonly();

  private _translations = new BehaviorSubject<Record<string, any>>({});
  readonly translations$ = this._translations.asObservable();

  constructor(private http: HttpClient) {
    let initialLang: Lang = 'en';
    
    if (typeof localStorage !== 'undefined') {
      const savedLang = localStorage.getItem('preferredLang') as Lang;
      if (savedLang) {
        initialLang = savedLang;
      } else if (typeof navigator !== 'undefined') {
        // Detect device/browser language (e.g., 'ta-IN' becomes 'ta')
        const browserLang = navigator.language.split('-')[0] as Lang;
        const isSupported = this.languages.some(l => l.code === browserLang);
        if (isSupported) {
          initialLang = browserLang;
        }
      }
    }
    
    this._lang.set(initialLang);
    this.loadTranslations(initialLang);
  }

  setLanguage(lang: Lang): void {
    this._lang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferredLang', lang);
    }
    this.loadTranslations(lang);
  }

  getCurrentLangOption(): LangOption {
    return this.languages.find((l) => l.code === this._lang())!;
  }

  translate(key: string): string {
    let val: any = this._translations.getValue();
    if (!val) return key;

    // Fast path for exact match (supports sentences with dots)
    if (val[key] !== undefined) {
      return typeof val[key] === 'string' ? val[key] : key;
    }

    const keys = key.split('.');
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined) return key;
    }
    return typeof val === 'string' ? val : key;
  }

  translateRaw(key: string): any {
    const keys = key.split('.');
    let val: any = this._translations.getValue();
    for (const k of keys) {
      val = val?.[k];
    }
    return val;
  }

  private loadTranslations(lang: Lang): void {
    this.http
      .get<Record<string, any>>(`assets/i18n/${lang}.json`)
      .subscribe((data) => this._translations.next(data));
  }
}
