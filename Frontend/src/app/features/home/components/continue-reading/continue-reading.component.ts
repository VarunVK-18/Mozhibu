import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { SafeUrlPipe } from '../../../../shared/pipes/safe-url.pipe';
import { BookService } from '../../../../core/services/book.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';

interface ReadingItem {
  id?: string;
  initials: string;
  colorClass: string;
  title: string;
  meta: string;
  progress: number;
  cover?: string;
}

@Component({
  selector: 'app-continue-reading',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, SafeUrlPipe],
  templateUrl: './continue-reading.component.html',
  styleUrls: ['./continue-reading.component.css'],
})
export class ContinueReadingComponent implements OnInit {
  bookService = inject(BookService);
  authService = inject(AuthService);
  api = inject(ApiService);
  router = inject(Router);
  items: ReadingItem[] = [];

  onCoverError(event: any) {
    event.target.src = this.api.getFallbackCover();
  }

  ngOnInit() {
    if (this.authService.user()) {
      this.authService.getReadingProgress().subscribe({
        next: (progressList) => {
          if (progressList && progressList.length > 0) {
            this.items = progressList
              .slice(0, 3)
              .map((p: any, index: number) => ({
                id: p.book._id,
                initials: p.book.title.substring(0, 2).toUpperCase(),
                colorClass: `cv-${(index % 8) + 1}`,
                title: p.book.title,
                meta: `Chapter ${p.currentChapter?.order || 1} of ${p.book.chaptersCount || 1} · ${p.book.genre || 'Story'}`,
                progress: p.progressPercentage || 0,
                cover: p.book.cover,
              }));
          } else {
            this.items = [];
          }
        },
        error: () => {
          this.items = [];
        },
      });
    } else {
      this.items = [];
    }
  }
}
