import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-chapter-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-page">
      <div class="editor-header">
        <div class="wrap">
          <div class="header-content">
            <button class="btn-icon" (click)="goBack()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="header-info">
              <span class="context">{{ chapterId && chapterId !== 'new' ? 'Editing chapter for' : 'Writing a new chapter for' }}</span>
              <h1>{{ bookTitle || 'Loading...' }}</h1>
            </div>
            <div class="header-actions">
              <button class="btn-primary" [disabled]="isPublishing || !chapterTitle || !editorContent" (click)="publishChapter()">
                {{ isPublishing ? 'Saving...' : (chapterId && chapterId !== 'new' ? 'Save Changes' : 'Publish Chapter') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="wrap editor-area">
        <div class="chapter-title-input">
          <input type="text" [(ngModel)]="chapterTitle" placeholder="Chapter Title">
        </div>
        
        <div class="chapter-settings">
          <label>Chapter Access:</label>
          <select [(ngModel)]="accessType" class="access-select">
            <option value="inherit">Inherit from Book</option>
            <option value="free">Free for Everyone</option>
            <option value="premium">Premium (Subscribers Only)</option>
          </select>
        </div>
        
        <div class="editor-container">
          <textarea class="content-textarea" placeholder="Write your chapter content here..." [(ngModel)]="editorContent"></textarea>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-page {
      min-height: calc(100vh - 72px);
      background: var(--paper);
      display: flex;
      flex-direction: column;
    }
    
    .editor-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border-soft);
      padding: 16px 0;
      position: sticky;
      top: 72px;
      z-index: 10;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    
    .btn-icon {
      background: transparent;
      border: none;
      color: var(--ink-soft);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s;
    }
    
    .btn-icon:hover {
      background: var(--paper-soft);
      color: var(--ink);
    }
    
    .header-info {
      flex: 1;
    }
    
    .context {
      font-size: 12px;
      color: var(--ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    
    .header-info h1 {
      font-family: var(--display);
      font-size: 20px;
      margin: 4px 0 0;
      color: var(--ink);
    }
    
    .btn-primary {
      background: var(--forest);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      cursor: pointer;
    }
    
    .btn-primary:disabled {
      background: var(--border-deep);
      cursor: not-allowed;
    }
    
    .editor-area {
      flex: 1;
      max-width: 800px;
      margin: 48px auto;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .chapter-title-input {
      margin-bottom: 24px;
    }
    
    .chapter-title-input input {
      width: 100%;
      font-family: var(--display);
      font-size: 32px;
      font-weight: 700;
      color: var(--ink);
      background: transparent;
      border: none;
      border-bottom: 1px solid transparent;
      padding: 8px 0;
    }
    
    .chapter-title-input input:focus {
      outline: none;
      border-bottom-color: var(--border-soft);
    }
    
    .chapter-title-input input::placeholder {
      color: var(--ink-faint);
    }
    
    .chapter-settings {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding: 12px 16px;
      background: var(--paper-soft);
      border-radius: 8px;
    }

    .chapter-settings label {
      font-size: 14px;
      font-weight: 600;
      color: var(--ink-soft);
    }

    .access-select {
      background: var(--surface);
      border: 1px solid var(--border-soft);
      color: var(--ink);
      padding: 6px 12px;
      border-radius: 6px;
      font-family: var(--body);
      font-size: 14px;
      cursor: pointer;
    }
    
    .editor-container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .content-textarea {
      flex: 1;
      width: 100%;
      min-height: 500px;
      background: transparent;
      border: none;
      resize: none;
      font-family: var(--body);
      font-size: 18px;
      line-height: 1.6;
      color: var(--ink);
      padding: 0;
    }
    
    .content-textarea:focus {
      outline: none;
    }
    
    .content-textarea::placeholder {
      color: var(--ink-faint);
    }
  `]
})
export class ChapterEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  
  bookId: string | null = null;
  bookTitle = '';
  chapterId: string | null = null;
  
  chapterTitle = '';
  editorContent = '';
  accessType = 'inherit';
  isPublishing = false;
  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.bookId = params.get('id');
      this.chapterId = params.get('chapterId');
      
      if (this.bookId) {
        this.fetchBookDetails(this.bookId);
      }
      
      if (this.bookId && this.chapterId && this.chapterId !== 'new') {
        this.fetchChapterDetails(this.bookId, this.chapterId);
      }
    });
  }
  
  fetchBookDetails(id: string) {
    this.bookService.getBookById(id).subscribe({
      next: (book) => this.bookTitle = book.title,
      error: () => this.bookTitle = 'Unknown Book'
    });
  }

  fetchChapterDetails(bookId: string, chapterId: string) {
    this.bookService.getChapter(bookId, chapterId).subscribe({
      next: (chapter) => {
        this.chapterTitle = chapter.title;
        this.editorContent = chapter.content;
        this.accessType = chapter.accessType || 'inherit';
      },
      error: (err) => console.error('Failed to fetch chapter', err)
    });
  }

  goBack() {
    if (this.bookId) {
      this.router.navigate(['/write/book', this.bookId]);
    } else {
      this.router.navigate(['/write']);
    }
  }

  publishChapter() {
    if (!this.bookId || !this.chapterTitle || !this.editorContent) return;
    
    this.isPublishing = true;
    
    const chapterData = {
      title: this.chapterTitle,
      content: this.editorContent,
      accessType: this.accessType,
      order: 1 // Ideally calculated by backend
    };
    
    if (this.chapterId && this.chapterId !== 'new') {
      this.bookService.updateChapter(this.bookId, this.chapterId, chapterData).subscribe({
        next: () => {
          this.router.navigate(['/write/book', this.bookId]);
        },
        error: (err) => {
          console.error('Failed to update chapter', err);
          alert('Failed to update chapter');
          this.isPublishing = false;
        }
      });
    } else {
      this.bookService.createChapter(this.bookId, chapterData).subscribe({
        next: () => {
          this.router.navigate(['/write/book', this.bookId]);
        },
        error: (err) => {
          console.error('Failed to publish chapter', err);
          alert('Failed to publish chapter');
          this.isPublishing = false;
        }
      });
    }
  }
}
