import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_EN_TRANSLATIONS } from '../i18n/default-translations';

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
    { code: 'ta', native: 'தமிழ்', label: 'Tamil' },
    { code: 'hi', native: 'हिंदी', label: 'Hindi' },
    { code: 'te', native: 'తెలుగు', label: 'Telugu' },
    { code: 'ml', native: 'മലയാളം', label: 'Malayalam' },
    { code: 'kn', native: 'ಕನ್ನಡ', label: 'Kannada' },
    { code: 'bn', native: 'বাংলা', label: 'Bengali' },
    { code: 'pa', native: 'ਪੰਜਾਬੀ', label: 'Punjabi' },
    { code: 'mr', native: 'मराठी', label: 'Marathi' },
    { code: 'ur', native: 'اردو', label: 'Urdu' },
    { code: 'gu', native: 'ગુજરાતી', label: 'Gujarati' },
    { code: 'or', native: 'ଓଡ଼ିଆ', label: 'Odia' },
  ];

  private _lang = signal<Lang>('en');
  readonly currentLang = this._lang.asReadonly();

  // Initialize with synchronous English defaults so UI never flashes raw translation keys
  private _translations = new BehaviorSubject<Record<string, any>>(DEFAULT_EN_TRANSLATIONS);
  readonly translations$ = this._translations.asObservable();

  constructor(private http: HttpClient) {
    let initialLang: Lang = 'en';

    if (typeof localStorage !== 'undefined') {
      const savedLang = localStorage.getItem('preferredLang') as Lang;
      if (savedLang && this.languages.some((l) => l.code === savedLang)) {
        initialLang = savedLang;
      } else if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.split('-')[0] as Lang;
        const isSupported = this.languages.some((l) => l.code === browserLang);
        if (isSupported) {
          initialLang = browserLang;
        }
      }
    }

    this._lang.set(initialLang);
    this.loadTranslations(initialLang);
  }

  private translationCache = new Map<Lang, Record<string, any>>();

  setLanguage(lang: Lang) {
    this._lang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferredLang', lang);
    }
    return this.loadTranslations(lang);
  }

  getCurrentLangOption(): LangOption {
    return this.languages.find((l) => l.code === this._lang())!;
  }

  private lookup(obj: any, key: string): string | null {
    if (!obj || typeof obj !== 'object') return null;

    // Fast path for exact key match
    if (obj[key] !== undefined && typeof obj[key] === 'string') {
      return obj[key];
    }

    // Dot-notation traversal
    const keys = key.split('.');
    let cur = obj;
    for (const k of keys) {
      cur = cur?.[k];
      if (cur === undefined) return null;
    }
    return typeof cur === 'string' ? cur : null;
  }

  translate(key: string): string {
    if (!key) return '';

    // 1. Try active translations dictionary
    const current = this.lookup(this._translations.getValue(), key);
    if (current !== null) return current;

    // 2. Fall back to bundled English defaults
    const fallback = this.lookup(DEFAULT_EN_TRANSLATIONS, key);
    if (fallback !== null) return fallback;

    // 3. Return key as last resort
    return key;
  }

  translateRaw(key: string): any {
    const keys = key.split('.');
    let val: any = this._translations.getValue();
    for (const k of keys) {
      val = val?.[k];
    }
    if (val === undefined) {
      val = DEFAULT_EN_TRANSLATIONS;
      for (const k of keys) {
        val = val?.[k];
      }
    }
    return val;
  }

  loadTranslations(lang: Lang) {
    const subject = new BehaviorSubject<Record<string, any> | null>(null);

    if (this.translationCache.has(lang)) {
      const cached = this.translationCache.get(lang)!;
      this._translations.next(cached);
      subject.next(cached);
      subject.complete();
      return subject.asObservable();
    }

    const url = `/assets/i18n/${lang}.json`;
    this.http.get<Record<string, any>>(url).subscribe({
      next: (data) => {
        if (data && typeof data === 'object') {
          const merged = lang === 'en' ? { ...DEFAULT_EN_TRANSLATIONS, ...data } : data;
          this.translationCache.set(lang, merged);
          this._translations.next(merged);
          subject.next(merged);
        } else {
          this._translations.next(DEFAULT_EN_TRANSLATIONS);
          subject.next(DEFAULT_EN_TRANSLATIONS);
        }
        subject.complete();
      },
      error: (err) => {
        console.warn(`[LanguageService] Failed to load ${url}, falling back to defaults`, err);
        this._translations.next(DEFAULT_EN_TRANSLATIONS);
        subject.next(DEFAULT_EN_TRANSLATIONS);
        subject.complete();
      },
    });

    return subject.asObservable();
  }
}
