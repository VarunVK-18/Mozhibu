import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

export interface Story {
  title: string;
  author: string;
  lang: string;
  colorClass: string;
  rating: number;
  chapters: number;
  reads: string;
  genre: string;
}

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.css'],
})
export class TrendingComponent {
  activeTab = signal('all');

  readonly tabKeys = [
    'all',
    'romance',
    'mythology',
    'thriller',
    'fantasy',
    'drama',
    'poetry',
  ];

  readonly allStories: Story[] = [
    {
      title: 'Monsoon Letters',
      author: 'Devika Rao',
      lang: 'Tamil',
      colorClass: 'cv-1',
      rating: 4.8,
      chapters: 26,
      reads: '112K',
      genre: 'romance',
    },
    {
      title: 'The Silence at Platform 9',
      author: 'Arjun Mehta',
      lang: 'Hindi',
      colorClass: 'cv-2',
      rating: 4.9,
      chapters: 18,
      reads: '98K',
      genre: 'thriller',
    },
    {
      title: 'The Last Ferry to Vaikuntam',
      author: 'Anitha Suresh',
      lang: 'Malayalam',
      colorClass: 'cv-3',
      rating: 4.7,
      chapters: 12,
      reads: '76K',
      genre: 'mythology',
    },
    {
      title: "Nilanjan's Diary",
      author: 'Sohini Basu',
      lang: 'Bengali',
      colorClass: 'cv-4',
      rating: 4.6,
      chapters: 34,
      reads: '64K',
      genre: 'drama',
    },
    {
      title: 'Ashes of Amaravati',
      author: 'Ravi Teja N.',
      lang: 'Telugu',
      colorClass: 'cv-5',
      rating: 4.8,
      chapters: 41,
      reads: '153K',
      genre: 'mythology',
    },
    {
      title: 'Paus Ani Kavita',
      author: 'Mrunal Deshpande',
      lang: 'Marathi',
      colorClass: 'cv-6',
      rating: 4.5,
      chapters: 9,
      reads: '21K',
      genre: 'poetry',
    },
    {
      title: 'Belaku Mattu Kattale',
      author: 'Kavya Hegde',
      lang: 'Kannada',
      colorClass: 'cv-7',
      rating: 4.9,
      chapters: 22,
      reads: '87K',
      genre: 'fantasy',
    },
    {
      title: 'Shehr-e-Tanhai',
      author: 'Zoya Ahmed',
      lang: 'Urdu',
      colorClass: 'cv-8',
      rating: 4.7,
      chapters: 16,
      reads: '59K',
      genre: 'romance',
    },
  ];

  get stories(): Story[] {
    const tab = this.activeTab();
    return tab === 'all'
      ? this.allStories
      : this.allStories.filter((s) => s.genre === tab);
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }
}
