import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-story-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageCropperComponent],
  template: `
    <div class="editor-layout">
      <!-- Left Sidebar: Story Meta -->
      <aside class="meta-sidebar">
        <div class="sidebar-header">
          <button class="back-btn" routerLink="/write">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back to Studio
          </button>
        </div>
        
        <div class="meta-content">
          @if (competitionTag) {
            <div style="background: #e0f2f1; padding: 12px; border-radius: 6px; border: 1px solid #b2dfdb; color: #00695c; font-size: 13px; margin-bottom: 8px;">
              <strong>Competition Entry:</strong> This story will automatically be submitted for <em>#{{ competitionTag }}</em>.
            </div>
          }

          <div class="cover-upload" (click)="fileInput.click()">
            <input type="file" #fileInput hidden accept="image/*" (change)="fileChangeEvent($event)">
            
            @if (coverPreviewUrl()) {
              <img [src]="coverPreviewUrl()" alt="Cover Preview" class="cover-preview-img">
            } @else {
              <div class="cover-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span>Upload Cover</span>
              </div>
            }
          </div>

          <!-- Cropper Modal -->
          @if (imageChangedEvent) {
            <div class="cropper-modal-overlay">
              <div class="cropper-modal">
                <h3>Crop Cover Image</h3>
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
            <label>Story Title</label>
            <input type="text" class="input-field" placeholder="e.g. The Neon Shadows" [(ngModel)]="story.title">
          </div>
          
          <div class="form-group">
            <label>Primary Genre</label>
            <select class="input-field select-field" [(ngModel)]="story.genre">
              <option value="" disabled selected>Select a genre...</option>
              <option value="Romance">Romance</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Thriller">Thriller</option>
              <option value="Horror">Horror</option>
              <option value="Mystery">Mystery</option>
              <option value="Historical">Historical</option>
              <option value="Drama">Drama</option>
              <option value="Comedy">Comedy</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Children">Children</option>
              <option value="Poetry">Poetry</option>
              <option value="Short Stories">Short Stories</option>
              <option value="Fan Fiction">Fan Fiction</option>
              <option value="Motivational">Motivational</option>
              <option value="Biography">Biography</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Tags (Comma separated)</label>
            <input type="text" class="input-field" placeholder="e.g. magic, dragons, war" [(ngModel)]="story.tags">
          </div>
          
          <div class="form-group">
            <label>Series Name (Optional)</label>
            <input type="text" class="input-field" placeholder="e.g. The Lord of the Rings" [(ngModel)]="story.series">
          </div>
          
          <div class="form-group">
            <label>Synopsis</label>
            <textarea class="input-field textarea-field" placeholder="Write a compelling summary to hook your readers..." rows="6" [(ngModel)]="story.description"></textarea>
          </div>
        </div>
      </aside>

      <!-- Main Area: Chapter Editor -->
      <main class="chapter-editor">
        <header class="editor-header">
          <div class="save-status">
            <span class="dot"></span>
            {{ isSaving ? 'Saving...' : 'Saved just now' }}
          </div>
          <div class="actions">
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
          <input type="text" class="chapter-title-input" placeholder="Chapter 1: Title..." [(ngModel)]="chapter.title">
          
          <textarea class="content-textarea" placeholder="Start writing your story here..." [(ngModel)]="chapter.content"></textarea>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .editor-layout {
      display: flex;
      height: calc(100vh - 73px);
      background: var(--paper);
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
    .btn-secondary { background: transparent; border: 1px solid var(--border); padding: 8px 16px; border-radius: 100px; font-size: 13px; cursor: pointer; }
    .btn-primary { background: var(--forest); color: white; border: none; padding: 8px 16px; border-radius: 100px; font-size: 13px; cursor: pointer; }
    .writing-workspace { flex: 1; padding: 32px 48px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; max-width: 800px; margin: 0 auto; width: 100%; }
    .chapter-title-input { width: 100%; background: transparent; border: none; font-size: 32px; font-weight: 700; color: var(--ink); }
    .content-textarea { flex: 1; width: 100%; background: transparent; border: none; resize: none; font-size: 16px; line-height: 1.6; }
    .error-message { color: #c62828; padding: 10px; background: #ffebee; border-radius: 4px; }
    .cropper-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .cropper-modal { background: var(--card); padding: 24px; border-radius: 12px; width: 90%; max-width: 500px; display: flex; flex-direction: column; gap: 16px; }
    .cropper-container { width: 100%; height: 400px; background: #f0f0f0; }
    .cropper-actions { display: flex; justify-content: flex-end; gap: 12px; }
    @media (max-width: 900px) { .editor-layout { flex-direction: column; } .meta-sidebar { width: 100%; height: auto; max-height: 300px; } }
  `]
})
export class StoryEditorComponent implements OnInit {
  private bookService = inject(BookService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  coverPreviewUrl = signal<string | null>(null);

  isSaving = false;
  errorMessage = '';
  competitionTag: string | null = null;

  story = {
    title: '',
    genre: '',
    description: '',
    tags: '',
    series: ''
  };

  chapter = {
    title: '',
    content: ''
  };

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['competition']) {
        this.competitionTag = params['competition'];
      }
    });
  }

  imageChangedEvent: any = '';
  croppedImage: string | null = null;
  croppedBlob: Blob | null = null;
  activeBlob: Blob | null = null;

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
      // In case we only get base64 (older version of ngx-image-cropper), we'd need to convert it, but event.blob should be available.
      if (event.blob) {
         this.activeBlob = event.blob;
      }
    }
  }

  applyCrop() {
    if (this.croppedImage) {
      this.coverPreviewUrl.set(this.croppedImage);
      this.croppedBlob = this.activeBlob;
    }
    this.imageChangedEvent = '';
  }

  cancelCrop() {
    this.imageChangedEvent = '';
    this.croppedImage = null;
    this.activeBlob = null;
  }

  publishChapter(isDraft: boolean) {
    if (!this.story.title || !this.story.genre || !this.chapter.title) {
      this.errorMessage = 'Please fill out the story title, genre, and chapter title.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    
    // Parse tags string to array
    const tagsArray = this.story.tags
      ? this.story.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    const bookData: any = {
      title: this.story.title,
      genre: this.story.genre,
      description: this.story.description,
      tags: tagsArray,
      series: this.story.series || undefined,
      status: isDraft ? 'pending' : 'published'
    };

    if (this.competitionTag) {
      bookData.competitionTag = this.competitionTag;
    }

    if (this.croppedBlob) {
      const file = new File([this.croppedBlob], 'cover.jpg', { type: 'image/jpeg' });
      this.bookService.uploadCover(file).subscribe({
        next: (res) => {
          bookData.cover = res.coverUrl;
          this.submitBook(bookData, isDraft);
        },
        error: (err) => {
          console.error('Failed to upload cover', err);
          this.errorMessage = 'Failed to upload cover image. Please try again.';
          this.isSaving = false;
        }
      });
    } else {
      bookData.cover = '';
      this.submitBook(bookData, isDraft);
    }
  }

  private submitBook(bookData: any, isDraft: boolean) {

    this.bookService.createBook(bookData).subscribe({
      next: (book) => {
        const chapterData = {
          title: this.chapter.title,
          content: this.chapter.content,
          status: isDraft ? 'draft' : 'published',
          order: 1
        };

        this.bookService.createChapter(book._id, chapterData).subscribe({
          next: () => {
            this.isSaving = false;
            this.router.navigate(['/write']);
          },
          error: (err) => {
            console.error('Failed to save chapter', err);
            this.errorMessage = 'Failed to save chapter. Please try again.';
            this.isSaving = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to create book', err);
        this.errorMessage = 'Failed to create story. Please try again.';
        this.isSaving = false;
      }
    });
  }
}
