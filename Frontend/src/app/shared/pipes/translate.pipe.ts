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
  private sub?: Subscription;

  constructor(
    private lang: LanguageService,
    private cdr: ChangeDetectorRef,
  ) {
    this.sub = this.lang.translations$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  transform(key: string): string {
    if (!key) return '';
    return this.lang.translate(key);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
