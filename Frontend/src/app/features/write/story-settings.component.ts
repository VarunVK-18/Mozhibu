import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-story-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImageCropperComponent],
  template: `
    <div class="editor-page wrap">
      <div class="editor-header">
        <button class="btn-back" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to Dashboard
        </button>
        <div class="header-actions">
          <button class="btn-primary" (click)="saveSettings()" [disabled]="isSaving || isLoading">
            {{ isSaving ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </div>

      <div class="editor-content">
        @if (isLoading) {
          <div class="loading-state">Loading story details...</div>
        } @else {
          <!-- Story Settings Panel -->
          <div class="settings-panel">
            <h2 class="panel-title">Story Settings</h2>
            
            <div class="settings-layout">
              <div class="settings-sidebar">
                <div class="form-group">
                  <label>Cover Image</label>
                  <div class="cover-upload-container">
                    <div class="cover-upload" (click)="fileInput.click()">
                      <input type="file" #fileInput hidden accept="image/*" (change)="fileChangeEvent($event)">
                      @if (coverPreviewUrl()) {
                        <img [src]="coverPreviewUrl()" class="cover-preview-img">
                      } @else {
                        <div class="cover-placeholder">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span>Upload Cover</span>
                        </div>
                      }
                    </div>
                    @if (coverPreviewUrl() || story.cover) {
                      <button (click)="removeCover()" class="btn-text-error">Remove Cover</button>
                    }
                  </div>
                </div>
              </div>

              <div class="settings-main">
                <div class="form-group">
                  <label>Story Title <span class="required">*</span></label>
                  <input type="text" [(ngModel)]="story.title" class="input-field" placeholder="e.g. The Neon Shadows">
                </div>

                <div class="form-group">
                  <label>Genre <span class="required">*</span></label>
                  <select [(ngModel)]="story.genre" class="input-field select-field">
                    <option value="" disabled selected>Select a genre...</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Science Fiction">Science Fiction</option>
                    <option value="Romance">Romance</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Horror">Horror</option>
                    <option value="Historical Fiction">Historical Fiction</option>
                    <option value="Contemporary">Contemporary</option>
                    <option value="Action/Adventure">Action/Adventure</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Synopsis / Description</label>
                  <textarea [(ngModel)]="story.description" class="input-field textarea-field" rows="5" placeholder="What is your story about?"></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Tags (comma separated)</label>
                    <input type="text" [(ngModel)]="story.tags" class="input-field" placeholder="e.g. cyberpunk, action">
                  </div>
                  
                  <div class="form-group">
                    <label>Series Name <span class="optional">(Optional)</span></label>
                    <input type="text" [(ngModel)]="story.series" class="input-field" placeholder="Is this part of a series?">
                  </div>
                </div>
                
                @if (errorMessage) {
                  <div class="error-message">{{ errorMessage }}</div>
                }
              </div>
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
                    <button class="btn-outline" (click)="cancelCrop()">Cancel</button>
                    <button class="btn-primary" (click)="applyCrop()">Apply Crop</button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .editor-page {
      padding-top: 40px;
      padding-bottom: 80px;
      min-height: calc(100vh - 72px);
      display: flex;
      flex-direction: column;
    }
    
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    
    .btn-back {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 600;
      color: var(--ink-soft);
      cursor: pointer;
      padding: 8px 12px;
      margin-left: -12px;
      border-radius: 6px;
      transition: background-color 0.2s, color 0.2s;
    }
    
    .btn-back:hover {
      background: rgba(0,0,0,0.05);
      color: var(--ink);
    }
    
    .editor-content {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    
    .settings-panel {
      width: 100%;
      max-width: 800px;
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    
    .panel-title {
      font-family: var(--display);
      font-size: 28px;
      font-weight: 700;
      color: var(--ink);
      margin: 0;
      border-bottom: 1px solid var(--border-soft);
      padding-bottom: 16px;
    }

    .settings-layout {
      display: flex;
      gap: 40px;
    }
    
    .settings-sidebar {
      flex: 0 0 180px;
    }
    
    .settings-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-row {
      display: flex;
      gap: 24px;
    }

    .form-row .form-group {
      flex: 1;
    }

    @media (max-width: 768px) {
      .settings-layout {
        flex-direction: column;
      }
      .settings-sidebar {
        flex: none;
        width: 160px;
        margin: 0 auto;
      }
      .form-row {
        flex-direction: column;
        gap: 24px;
      }
      .settings-panel {
        padding: 24px;
      }
    }
    
    .cover-upload {
      width: 100%;
      aspect-ratio: 2 / 3;
      height: auto;
      background: var(--surface);
      border: 2px dashed var(--border-soft);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      background: var(--surface-alt);
      transition: all 0.2s;
    }

    .cover-upload-container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .btn-text-error {
      background: none;
      border: none;
      color: var(--error);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
    }
    
    .cover-upload:hover {
      border-color: var(--forest);
      background: rgba(63, 98, 89, 0.05);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(63, 98, 89, 0.1);
    }
    
    .cover-preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .cover-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--ink-soft);
      font-weight: 500;
      font-size: 14px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .form-group label {
      font-size: 14px;
      font-weight: 600;
      color: var(--ink-soft);
    }
    
    .form-group label .required {
      color: #E63946;
      margin-left: 2px;
    }
    
    .form-group label .optional {
      font-weight: 400;
      color: var(--ink-faint);
      font-size: 12px;
    }

    .input-field {
      width: 100%;
      padding: 12px 16px;
      background: var(--surface);
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      font-family: inherit;
      font-size: 15px;
      color: var(--ink);
      transition: all 0.2s;
    }
    
    .input-field:hover {
      border-color: var(--border);
    }

    .input-field:focus {
      outline: none;
      border-color: var(--forest);
      background: var(--card);
      box-shadow: 0 0 0 4px rgba(63, 98, 89, 0.1);
    }
    
    .select-field {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
    }
    
    .textarea-field {
      resize: vertical;
      line-height: 1.5;
    }

    .error-message {
      color: #D32F2F;
      font-size: 14px;
      padding: 12px;
      background: #FFEBEE;
      border-radius: 6px;
    }

    .loading-state {
      padding: 48px;
      text-align: center;
      color: var(--ink-soft);
    }

    .btn-primary {
      background: var(--forest);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--forest-deep);
    }

    .btn-primary:disabled {
      background: var(--ink-faint);
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid var(--border);
      padding: 8px 16px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      font-size: 13px;
      color: var(--ink);
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-outline:hover {
      background: var(--paper-soft);
      border-color: var(--ink-soft);
    }

    .cropper-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .cropper-modal {
      background: var(--card);
      padding: 24px;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
    }

    .cropper-modal h3 {
      font-family: var(--display);
      font-size: 20px;
      margin: 0;
    }

    .cropper-container {
      width: 100%;
      height: 400px;
      background: #f0f0f0;
      border-radius: 8px;
      overflow: hidden;
    }

    .cropper-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }
  `]
})
export class StorySettingsComponent implements OnInit {
  private bookService = inject(BookService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  bookId: string | null = null;
  coverPreviewUrl = signal<string | null>(null);
  hasRemovedCover = false;

  isLoading = true;
  isSaving = false;
  errorMessage = '';

  story = {
    title: '',
    genre: '',
    description: '',
    tags: '',
    series: '',
    cover: null as string | null
  };

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.bookId = params.get('id');
      if (this.bookId) {
        this.fetchBookDetails(this.bookId);
      } else {
        this.router.navigate(['/write']);
      }
    });
  }

  fetchBookDetails(id: string) {
    this.isLoading = true;
    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        this.story.title = book.title || '';
        this.story.genre = book.genre || '';
        this.story.description = book.description || '';
        this.story.tags = (book.tags || []).join(', ');
        this.story.series = book.series || '';
        
        if (book.cover) {
          const serverUrl = environment.apiUrl.replace('/api', '');
          const coverUrl = book.cover.startsWith('http') ? book.cover : `${serverUrl}${book.cover}`;
          this.coverPreviewUrl.set(coverUrl);
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch book', err);
        this.router.navigate(['/write']);
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

  removeCover() {
    this.croppedBlob = null;
    this.coverPreviewUrl.set(null);
    this.hasRemovedCover = true;
    this.story.cover = null;
  }

  saveSettings() {
    if (!this.bookId || !this.story.title || !this.story.genre) {
      this.errorMessage = 'Please fill out the story title and genre.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    
    const tagsArray = this.story.tags
      ? this.story.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    const bookData: any = {
      title: this.story.title,
      genre: this.story.genre,
      description: this.story.description,
      tags: tagsArray,
      series: this.story.series || undefined,
    };
    
    if (this.hasRemovedCover) {
      bookData.cover = null;
    }

    // Only upload if a new cover was cropped
    if (this.croppedBlob) {
      const file = new File([this.croppedBlob], 'cover.jpg', { type: 'image/jpeg' });
      this.bookService.uploadCover(file).subscribe({
        next: (res) => {
          bookData.cover = res.coverUrl;
          this.submitUpdate(bookData);
        },
        error: (err) => {
          console.error('Failed to upload cover', err);
          this.errorMessage = 'Failed to upload cover image. Please try again.';
          this.isSaving = false;
        }
      });
    } else {
      this.submitUpdate(bookData);
    }
  }

  private submitUpdate(bookData: any) {
    this.bookService.updateBook(this.bookId!, bookData).subscribe({
      next: () => {
        this.isSaving = false;
        this.goBack();
      },
      error: (err) => {
        console.error('Failed to update book', err);
        this.errorMessage = 'Failed to update story settings. Please try again.';
        this.isSaving = false;
      }
    });
  }

  goBack() {
    if (this.bookId) {
      this.router.navigate(['/write/book', this.bookId]);
    } else {
      this.router.navigate(['/write']);
    }
  }
}
