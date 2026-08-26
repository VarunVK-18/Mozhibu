import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true,
})
export class SafeUrlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(url: string | undefined | null): SafeUrl | string {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
