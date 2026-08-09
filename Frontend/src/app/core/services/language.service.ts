import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export type Lang = 'en' | 'ta' | 'hi';

export interface LangOption {
  code: Lang;
  native: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly languages: LangOption[] = [
    { code: 'en', native: 'English', label: 'EN' },
    { code: 'ta', native: 'தமிழ்',  label: 'தமிழ்' },
    { code: 'hi', native: 'हिंदी',    label: 'हिंदी' },
  ];

  private _lang = signal<Lang>('en');
  readonly currentLang = this._lang.asReadonly();

  private _translations = new BehaviorSubject<Record<string, any>>({});
  readonly translations$ = this._translations.asObservable();

  constructor(private http: HttpClient) {
    this.loadTranslations('en');
  }

  setLanguage(lang: Lang): void {
    this._lang.set(lang);
    this.loadTranslations(lang);
  }

  getCurrentLangOption(): LangOption {
    return this.languages.find(l => l.code === this._lang())!;
  }

  translate(key: string): string {
    const keys = key.split('.');
    let val: any = this._translations.getValue();
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined) return key;
    }
    return typeof val === 'string' ? val : key;
  }

  translateRaw(key: string): any {
    const keys = key.split('.');
    let val: any = this._translations.getValue();
    for (const k of keys) { val = val?.[k]; }
    return val;
  }

  private loadTranslations(lang: Lang): void {
    this.http
      .get<Record<string, any>>(`assets/i18n/${lang}.json`)
      .subscribe(data => this._translations.next(data));
  }
}
