import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  constructor(public langService: LanguageService) {}

  private getArray(key: string): string[] {
    const val = this.langService.translateRaw(key);
    return Array.isArray(val) ? val : [];
  }

  get exploreLinks(): string[] { return this.getArray('footer.exploreLinks'); }
  get writeLinks(): string[]   { return this.getArray('footer.writeLinks'); }
  get companyLinks(): string[] { return this.getArray('footer.companyLinks'); }
}
