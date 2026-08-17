import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '../../../environments/environment';
import * as Sanscript from '@indic-transliteration/sanscript';

@Component({
  selector: 'app-chapter-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  template: `
    <div class="editor-layout" [class.dark-mode]="isDarkMode">
      <!-- Left Sidebar: Chapter Meta -->
      <aside class="meta-sidebar">
        <div class="sidebar-header">
          <button class="back-btn" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back to Book
          </button>
        </div>
        
        <div class="meta-content">
          <div class="context-label">
            <span>{{ chapterId && chapterId !== 'new' ? 'Editing chapter for' : 'Writing a new chapter for' }}</span>
            <h4>{{ bookTitle || 'Loading...' }}</h4>
          </div>

          <div class="cover-upload" (click)="fileInput.click()">
            <input type="file" #fileInput hidden accept="image/*" (change)="fileChangeEvent($event)">
            
            @if (coverPreviewUrl()) {
              <img [src]="coverPreviewUrl()" alt="Chapter Cover Preview" class="cover-preview-img">
            } @else {
              <div class="cover-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span>Upload Chapter Cover</span>
                <span style="font-size: 11px; opacity: 0.7;">(Optional)</span>
              </div>
            }
          </div>

          <!-- Cropper Modal -->
          @if (imageChangedEvent) {
            <div class="cropper-modal-overlay">
              <div class="cropper-modal">
                <h3>Crop Chapter Cover</h3>
                <div class="cropper-container">
                  <image-cropper
                    [imageChangedEvent]="imageChangedEvent"
                    [maintainAspectRatio]="true"
                    [aspectRatio]="2 / 3"
                    format="jpeg"
                    (imageCropped)="imageCropped($event)">
                  </image-cropper>
                </div>
                <div class="cropper-actions">
                  <button class="btn-secondary" (click)="cancelCrop()">Cancel</button>
                  <button class="btn-primary" (click)="applyCrop()">Apply Crop</button>
                </div>
              </div>
            </div>
          }
          
          <div class="form-group">
            <label>Chapter Access</label>
            <select [(ngModel)]="accessType" class="input-field select-field" (ngModelChange)="onContentChange()">
              <option value="inherit">Follow Book Settings</option>
              <option value="free">Free for Everyone</option>
              <option value="premium">Premium (Subscribers Only)</option>
            </select>
          </div>
        </div>
      </aside>

      <!-- Main Area: Chapter Editor -->
      <main class="chapter-editor">
        <header class="editor-header">
          <div class="save-status">
            <span class="dot" [style.background]="isSaving ? '#f59e0b' : '#10B981'"></span>
            {{ isSaving ? 'Saving...' : (lastSaved ? 'Saved at ' + (lastSaved | date:'shortTime') : 'Not saved yet') }}
          </div>
          <div class="actions" style="display: flex; gap: 12px; align-items: center;">
            <button class="theme-toggle" (click)="toggleTheme()">
              <svg *ngIf="!isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
              <svg *ngIf="isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </button>
            <button class="btn-secondary" (click)="toggleTamilTyping()" [class.active-btn]="isTamilTypingEnabled" style="display: flex; gap: 6px; align-items: center;">
              <span style="font-weight: bold;">{{ isTamilTypingEnabled ? 'அ' : 'A' }}</span> 
              {{ isTamilTypingEnabled ? 'Tamil On' : 'Tamil Off' }}
            </button>
            <button class="btn-secondary" [disabled]="isSaving" (click)="publishChapter(true)">Save Draft</button>
            <button class="btn-primary" [disabled]="isSaving" (click)="publishChapter(false)">Publish Chapter</button>
          </div>
        </header>
        
        <div class="writing-workspace">
          @if (errorMessage) {
            <div class="error-message">
              {{ errorMessage }}
            </div>
          }
          <input type="text" class="chapter-title-input" placeholder="Chapter Title..." [(ngModel)]="chapterTitle" (ngModelChange)="onContentChange()">
          
          <textarea class="content-textarea" placeholder="Start writing your chapter here..." [(ngModel)]="editorContent" (ngModelChange)="onContentChange()" (keydown)="onKeyDown($event)"></textarea>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dark-mode {
      --paper: #121212;
      --paper-warm: #181818;
      --surface: #1e1e1e;
      --card: #242424;
      --ink: #e0e0e0;
      --ink-soft: #a0a0a0;
      --border: #333333;
      --border-soft: #2a2a2a;
    }
    .editor-layout {
      display: flex;
      height: calc(100vh - 73px);
      background: var(--paper);
      color: var(--ink);
    }
    .meta-sidebar {
      width: 280px;
      flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
    }
    .sidebar-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-soft);
    }
    .back-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: var(--ink-soft);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .meta-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .context-label {
      background: var(--paper-soft);
      padding: 12px;
      border-radius: 6px;
    }
    .context-label span {
      font-size: 11px;
      color: var(--ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .context-label h4 {
      margin: 4px 0 0 0;
      font-family: var(--display);
      font-size: 16px;
      color: var(--ink);
    }
    .cover-upload {
      width: 100%;
      aspect-ratio: 2 / 3;
      background: var(--paper-soft);
      border: 2px dashed var(--border);
      border-radius: var(--radius-m);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
    }
    .cover-preview-img { width: 100%; height: 100%; object-fit: cover; }
    .cover-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--ink-soft); font-size: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 12px; font-weight: 700; color: var(--ink); text-transform: uppercase; }
    .input-field { width: 100%; padding: 10px 14px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; }
    .chapter-editor { flex: 1; display: flex; flex-direction: column; background: var(--paper-warm); }
    .editor-header { height: 60px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-soft); background: var(--card); }
    .save-status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-faint); }
    .dot { width: 5px; height: 5px; border-radius: 50%; background: #10B981; }
    .actions { display: flex; gap: 12px; }
    .theme-toggle { background: transparent; border: 1px solid var(--border); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink-soft); transition: 0.2s; }
    .theme-toggle:hover { background: var(--paper-soft); color: var(--ink); }
    .btn-secondary { background: transparent; border: 1px solid var(--border); padding: 8px 16px; border-radius: 100px; font-size: 13px; cursor: pointer; color: var(--ink); }
    .btn-secondary.active-btn { background: var(--forest-tint); border-color: var(--forest); color: var(--forest-deep); }
    .btn-primary { background: var(--forest); color: white; border: none; padding: 8px 16px; border-radius: 100px; font-size: 13px; cursor: pointer; }
    .writing-workspace { flex: 1; padding: 32px 48px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; max-width: 800px; margin: 0 auto; width: 100%; }
    .chapter-title-input { font-family: var(--display); font-size: 32px; font-weight: 700; color: var(--ink); border: none; background: transparent; outline: none; text-transform: capitalize; }
    .chapter-title-input::placeholder { color: var(--ink-faint); }
    .content-textarea { flex: 1; border: none; background: transparent; outline: none; font-size: 16px; line-height: 1.8; color: var(--ink); resize: none; text-transform: capitalize; }
    .content-textarea::placeholder { color: var(--ink-faint); }
    .error-message { color: #c62828; padding: 10px; background: #ffebee; border-radius: 4px; }
    .cropper-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .cropper-modal { background: var(--card); padding: 24px; border-radius: 12px; width: 90%; max-width: 500px; display: flex; flex-direction: column; gap: 16px; }
    .cropper-container { width: 100%; height: 400px; background: #f0f0f0; }
    .cropper-actions { display: flex; justify-content: flex-end; gap: 12px; }
    @media (max-width: 900px) { .editor-layout { flex-direction: column; } .meta-sidebar { width: 100%; height: auto; max-height: 300px; } }
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
  
  isSaving = false;
  lastSaved: Date | null = null;
  errorMessage = '';
  saveTimeout: any;
  
  isTamilTypingEnabled = false;

  isDarkMode = localStorage.getItem('writerDarkMode') === 'true';

  coverPreviewUrl = signal<string | null>(null);
  isCoverUploaded = false;
  imageChangedEvent: any = '';
  croppedImage: string | null = null;
  croppedBlob: Blob | null = null;
  activeBlob: Blob | null = null;
  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.bookId = params.get('id');
      const paramChapterId = params.get('chapterId');
      
      if (paramChapterId && paramChapterId !== 'new') {
        this.chapterId = paramChapterId;
      }
      
      if (this.bookId) {
        this.fetchBookDetails(this.bookId);
      }
      
      this.restoreDraft();
    });
  }

  restoreDraft() {
    const cacheKey = `chapterDraft_${this.bookId}_${this.chapterId || 'new'}`;
    const draft = localStorage.getItem(cacheKey);
    
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        this.chapterTitle = parsedDraft.title || this.chapterTitle;
        this.editorContent = parsedDraft.content || this.editorContent;
        this.accessType = parsedDraft.accessType || this.accessType;
        this.chapterId = parsedDraft.chapterId || this.chapterId;
        this.isCoverUploaded = parsedDraft.isCoverUploaded || false;
        
        if (parsedDraft.coverPreviewUrl) {
          this.coverPreviewUrl.set(parsedDraft.coverPreviewUrl);
          if (!this.isCoverUploaded && parsedDraft.coverPreviewUrl.startsWith('data:image')) {
            this.croppedBlob = this.base64ToBlob(parsedDraft.coverPreviewUrl);
          }
        }
      } catch (err) {
        console.error('Failed to parse chapter draft from local storage', err);
      }
    } else if (this.bookId && this.chapterId) {
      this.fetchChapterDetails(this.bookId, this.chapterId);
    }
  }

  private base64ToBlob(base64: string): Blob {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
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
        if (chapter.cover) {
          this.coverPreviewUrl.set(chapter.cover);
          this.isCoverUploaded = true;
        }
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

  toggleTamilTyping() {
    this.isTamilTypingEnabled = !this.isTamilTypingEnabled;
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.isTamilTypingEnabled) return;

    if (event.key === ' ' || event.key === 'Enter') {
      const textarea = event.target as HTMLTextAreaElement;
      const value = textarea.value;
      const cursor = textarea.selectionStart;

      // Find the English word right before the cursor
      const textBeforeCursor = value.substring(0, cursor);
      const match = textBeforeCursor.match(/([a-zA-Z]+)$/);

      if (match) {
        const englishWord = match[0];
        // Use 'itrans' scheme for standard Tanglish phonetic mapping
        const tamilWord = (Sanscript as any).t(englishWord, 'itrans', 'tamil');

        const newValue = value.substring(0, cursor - englishWord.length) + tamilWord + value.substring(cursor);
        this.editorContent = newValue;

        const newCursor = cursor - englishWord.length + tamilWord.length;
        setTimeout(() => {
          textarea.setSelectionRange(newCursor, newCursor);
          this.onContentChange();
        }, 0);
      }
    }
  }

  fileChangeEvent(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.imageChangedEvent = event;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      if (event.blob) {
        this.activeBlob = event.blob;
        const reader = new FileReader();
        reader.readAsDataURL(event.blob);
        reader.onloadend = () => {
          this.croppedImage = reader.result as string;
        };
      }
    } else if ((event as any).base64) {
      this.croppedImage = (event as any).base64;
      if (event.blob) {
         this.activeBlob = event.blob;
      }
    }
  }

  applyCrop() {
    if (this.croppedImage) {
      this.coverPreviewUrl.set(this.croppedImage);
      this.croppedBlob = this.activeBlob;
      this.isCoverUploaded = false;
      this.onContentChange();
    }
    this.imageChangedEvent = '';
  }

  cancelCrop() {
    this.imageChangedEvent = '';
    this.croppedImage = null;
    this.activeBlob = null;
  }

  onContentChange() {
    this.saveToLocal();

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.autoSave();
    }, 2000);
  }

  saveToLocal() {
    const cacheKey = `chapterDraft_${this.bookId}_${this.chapterId || 'new'}`;
    const draft = {
      title: this.chapterTitle,
      content: this.editorContent,
      accessType: this.accessType,
      chapterId: this.chapterId,
      isCoverUploaded: this.isCoverUploaded,
      coverPreviewUrl: this.coverPreviewUrl()
    };
    try {
      localStorage.setItem(cacheKey, JSON.stringify(draft));
    } catch (err) {
      console.warn('Failed to save draft to local storage. Might be out of quota.', err);
    }
  }

  autoSave() {
    if (this.isSaving) return;
    if (this.chapterTitle && this.editorContent) {
      this.publishChapter(true, true);
    }
  }

  publishChapter(isDraft: boolean, isAutoSave = false) {
    if (!this.bookId || !this.chapterTitle || !this.editorContent) {
      if (!isAutoSave) {
        this.errorMessage = 'Please fill out the chapter title and content.';
      }
      return;
    }
    
    this.isSaving = true;
    this.errorMessage = '';

    if (this.croppedBlob && !this.isCoverUploaded) {
      const file = new File([this.croppedBlob], 'chapter-cover.jpg', { type: 'image/jpeg' });
      this.bookService.uploadCover(file).subscribe({
        next: (res) => {
          this.isCoverUploaded = true;
          const baseUrl = environment.apiUrl.replace('/api', '');
          this.coverPreviewUrl.set(`${baseUrl}${res.coverUrl}`);
          this.saveToLocal(); // Save immediately so we don't store base64 anymore
          this.submitChapterData(res.coverUrl, isDraft, isAutoSave);
        },
        error: (err) => {
          console.error('Failed to upload chapter cover', err);
          if (!isAutoSave) this.errorMessage = 'Failed to upload cover image. Please try again.';
          this.isSaving = false;
        }
      });
    } else {
      let currentCover = this.coverPreviewUrl();
      if (currentCover && currentCover.startsWith('data:image')) {
         currentCover = null; // Don't send base64 string to backend as cover URL
      }
      this.submitChapterData(currentCover, isDraft, isAutoSave);
    }
  }

  private submitChapterData(coverUrl: string | null | undefined, isDraft: boolean, isAutoSave: boolean) {
    const chapterData: any = {
      title: this.chapterTitle,
      content: this.editorContent,
      accessType: this.accessType,
      status: isDraft ? 'draft' : 'published'
    };

    if (coverUrl) {
      chapterData.cover = coverUrl;
    }
    
    if (this.chapterId && this.chapterId !== 'new') {
      this.bookService.updateChapter(this.bookId!, this.chapterId, chapterData).subscribe({
        next: () => {
          this.isSaving = false;
          this.lastSaved = new Date();
          if (!isAutoSave) {
            this.clearLocal();
            this.router.navigate(['/write/book', this.bookId]);
          }
        },
        error: (err) => {
          console.error('Failed to update chapter', err);
          if (!isAutoSave) this.errorMessage = 'Failed to update chapter. Please try again.';
          this.isSaving = false;
        }
      });
    } else {
      this.bookService.createChapter(this.bookId!, chapterData).subscribe({
        next: (chapter) => {
          this.chapterId = chapter._id;
          this.isSaving = false;
          this.lastSaved = new Date();
          
          // Re-save local immediately with new chapterId so further autosaves update instead of create
          this.saveToLocal(); 
          
          if (!isAutoSave) {
            this.clearLocal();
            this.router.navigate(['/write/book', this.bookId]);
          }
        },
        error: (err) => {
          console.error('Failed to publish chapter', err);
          if (!isAutoSave) this.errorMessage = 'Failed to save chapter. Please try again.';
          this.isSaving = false;
        }
      });
    }
  }

  clearLocal() {
    // Clear both the 'new' cache key and the assigned ID cache key to be safe
    localStorage.removeItem(`chapterDraft_${this.bookId}_new`);
    if (this.chapterId) {
      localStorage.removeItem(`chapterDraft_${this.bookId}_${this.chapterId}`);
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('writerDarkMode', this.isDarkMode ? 'true' : 'false');
  }
}
