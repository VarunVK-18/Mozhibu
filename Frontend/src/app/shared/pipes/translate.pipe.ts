import {
  Pipe,
  PipeTransform,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey = '';
  private lastValue = '';
  private sub: Subscription;

  constructor(
    private lang: LanguageService,
    private cdr: ChangeDetectorRef,
  ) {
    this.sub = this.lang.translations$.subscribe(() => {
      this.lastKey = '';
      this.cdr.markForCheck();
    });
  }

  transform(key: string): string {
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastValue = this.lang.translate(key);
    }
    return this.lastValue;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
