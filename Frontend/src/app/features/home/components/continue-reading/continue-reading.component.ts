import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

interface ReadingItem {
  initials: string;
  colorClass: string;
  title: string;
  meta: string;
  progress: number;
}

@Component({
  selector: 'app-continue-reading',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './continue-reading.component.html',
  styleUrls: ['./continue-reading.component.css'],
})
export class ContinueReadingComponent {
  readonly items: ReadingItem[] = [
    { initials: 'ML', colorClass: 'cv-1', title: 'Monsoon Letters',            meta: 'Chapter 14 of 26 · Tamil',     progress: 54 },
    { initials: 'SP', colorClass: 'cv-4', title: 'The Silence at Platform 9',  meta: 'Chapter 3 of 18 · Hindi',      progress: 17 },
    { initials: 'LF', colorClass: 'cv-7', title: 'The Last Ferry to Vaikuntam',meta: 'Chapter 8 of 12 · Malayalam',  progress: 78 },
  ];
}
