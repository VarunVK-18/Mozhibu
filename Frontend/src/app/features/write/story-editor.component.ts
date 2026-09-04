import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-story-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageCropperComponent],
  template: `
    <div class="editor-layout" [class.dark-mode]="isDarkMode">
      <!-- Left Sidebar: Story Meta -->
      <aside class="meta-sidebar">
        <div class="sidebar-header">
          <button class="back-btn" routerLink="/write">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Back to Studio
          </button>
        </div>

        <div class="meta-content">
          @if (competitionTag) {
            <div
              style="background: #e0f2f1; padding: 12px; border-radius: 6px; border: 1px solid #b2dfdb; color: #00695c; font-size: 13px; margin-bottom: 8px;"
            >
              <strong>Competition Entry:</strong> This story will automatically
              be submitted for <em>#{{ competitionTag }}</em
              >.
            </div>
          }

          <div class="cover-upload" (click)="fileInput.click()">
            <input
              type="file"
              #fileInput
              hidden
              accept="image/*"
              (change)="fileChangeEvent($event)"
            />

            @if (coverPreviewUrl()) {
              <img
                [src]="coverPreviewUrl()"
                alt="Cover Preview"
                class="cover-preview-img"
              />
            } @else {
              <div class="cover-placeholder">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                  />
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
                    (imageCropped)="imageCropped($event)"
                  >
                  </image-cropper>
                </div>
                <div class="cropper-actions">
                  <button class="btn-secondary" (click)="cancelCrop()">
                    Cancel
                  </button>
                  <button class="btn-primary" (click)="applyCrop()">
                    Apply Crop
                  </button>
                </div>
              </div>
            </div>
          }

          <div class="form-group">
            <label>Story Title <span class="required-asterisk">*</span></label>
            <input
              type="text"
              class="input-field"
              placeholder="e.g. The Neon Shadows"
              [(ngModel)]="story.title"
              (ngModelChange)="onContentChange()"
            />
          </div>

          <div class="form-group">
            <label>Primary Genre <span class="required-asterisk">*</span></label>
            <select
              class="input-field select-field"
              [(ngModel)]="story.genre"
              (ngModelChange)="onContentChange()"
            >
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

          <div class="form-group" style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--surface); border: 1px solid var(--border-soft); border-radius: 6px;">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <label style="margin: 0; color: var(--ink); font-size: 13px; font-weight: 600; text-transform: none; display: flex; align-items: center; gap: 6px;">
                  <span style="display: inline-flex; align-items: center; justify-content: center; background: #fee2e2; color: #DC2626; border-radius: 4px; padding: 1px 4px; font-size: 10px; font-weight: 700;">18+</span>
                  Mature Content
                </label>
              </div>
              <label class="switch" style="position: relative; display: inline-block; width: 40px; height: 22px; margin: 0; flex-shrink: 0;">
                <input type="checkbox" [(ngModel)]="story.isMature" (ngModelChange)="onContentChange()" style="opacity: 0; width: 0; height: 0;">
                <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-soft); transition: .4s; border-radius: 34px;" [style.backgroundColor]="story.isMature ? '#DC2626' : 'var(--border-soft)'">
                  <span style="position: absolute; content: ''; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3);" [style.transform]="story.isMature ? 'translateX(18px)' : 'translateX(0)'"></span>
                </span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Tags (Comma separated)</label>
            <input
              type="text"
              class="input-field"
              placeholder="e.g. magic, dragons, war"
              [(ngModel)]="story.tags"
              (ngModelChange)="onContentChange()"
            />
          </div>

          <div class="form-group">
            <label>Series Name (Optional)</label>
            <input
              type="text"
              class="input-field"
              placeholder="e.g. The Lord of the Rings"
              [(ngModel)]="story.series"
              (ngModelChange)="onContentChange()"
            />
          </div>

          <div class="form-group">
            <label>Synopsis</label>
            <textarea
              class="input-field textarea-field"
              placeholder="Write a compelling summary to hook your readers..."
              rows="6"
              [(ngModel)]="story.description"
              (ngModelChange)="onContentChange()"
            ></textarea>
          </div>
        </div>
      </aside>

      <!-- Main Area: Chapter Editor -->
      <main class="chapter-editor">
        <header class="editor-header">
          <div class="save-status">
            <span
              class="dot"
              [style.background]="isSaving ? '#f59e0b' : '#10B981'"
            ></span>
            {{
              isSaving
                ? 'Saving...'
                : lastSaved
                  ? 'Saved at ' + (lastSaved | date: 'shortTime')
                  : 'Not saved yet'
            }}
          </div>
          <div
            class="actions"
            style="display: flex; gap: 12px; align-items: center;"
          >
            <button class="theme-toggle" (click)="toggleTheme()">
              <svg
                *ngIf="!isDarkMode"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
              <svg
                *ngIf="isDarkMode"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="5" />
                <path
                  d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                />
              </svg>
            </button>
            <button
              class="btn-secondary"
              [disabled]="isSaving"
              (click)="publishChapter(true)"
            >
              <div *ngIf="isSaving" class="btn-loader dark"></div>
              Save Draft
            </button>
            <button
              class="btn-primary"
              [disabled]="isSaving"
              (click)="publishChapter(false)"
            >
              <div *ngIf="isSaving" class="btn-loader"></div>
              Publish Chapter
            </button>
          </div>
        </header>

        <div class="writing-workspace">
          @if (errorMessage) {
            <div class="error-message">
              {{ errorMessage }}
            </div>
          }

          <div
            class="editor-toolbar"
            style="display: flex; gap: 8px; margin-bottom: 12px; align-items: center; background: var(--surface); padding: 8px 12px; border-radius: var(--radius-m); border: 1px solid var(--border-soft);"
          >
            <button
              class="btn-icon"
              (click)="undo(contentInput)"
              title="Undo (Ctrl+Z)"
              style="color: var(--ink-soft); padding: 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 500;"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 7v6h6"></path>
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
              </svg>
              Undo
            </button>
            <button
              class="btn-icon"
              (click)="redo(contentInput)"
              title="Redo (Ctrl+Y)"
              style="color: var(--ink-soft); padding: 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 500;"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 7v6h-6"></path>
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
              </svg>
              Redo
            </button>
            <div style="width: 1px; height: 24px; background: var(--border); margin: 0 8px;"></div>
            <select
              class="lang-select"
              [(ngModel)]="typingLanguage"
              (ngModelChange)="setTypingLanguage($event)"
              title="Select Typing Language"
              style="margin-left: auto; font-weight: bold; cursor: pointer; outline: none; padding: 4px 8px; border-radius: 6px; background: var(--paper); color: var(--ink); border: 1px solid var(--border-soft);"
            >
              <option *ngFor="let lang of supportedLanguages" [value]="lang.code">
                {{ lang.char }} - {{ lang.label }}
              </option>
            </select>
          </div>

          <input
            type="text"
            #chapterTitleInput
            class="chapter-title-input"
            placeholder="Chapter 1: Title..."
            [(ngModel)]="chapter.title"
            (ngModelChange)="onContentChange()"
            (keydown)="onChapterTitleKeydown($event, chapterTitleInput)"
          />

          <textarea
            #contentInput
            class="content-textarea"
            placeholder="Start writing your story here..."
            [(ngModel)]="chapter.content"
            (ngModelChange)="onContentChange()"
            (keydown)="onTextareaKeydown($event, contentInput)"
          ></textarea>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
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
      .cover-preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cover-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: var(--ink-soft);
        font-size: 14px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .form-group label {
        font-size: 12px;
        font-weight: 700;
        color: var(--ink);
        text-transform: uppercase;
      }
      .required-asterisk {
        color: #c62828;
      }
      .input-field {
        width: 100%;
        padding: 10px 14px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--ink);
      }
      .chapter-editor {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: var(--paper-warm);
      }
      .editor-header {
        height: 60px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border-soft);
        background: var(--card);
      }
      .save-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--ink-faint);
      }
      .dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #10b981;
      }
      .theme-toggle {
        background: transparent;
        border: 1px solid var(--border);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--ink-soft);
        transition: 0.2s;
      }
      .theme-toggle:hover {
        background: var(--paper-soft);
        color: var(--ink);
      }
      .btn-secondary {
        background: transparent;
        border: 1px solid var(--border);
        padding: 8px 16px;
        border-radius: 100px;
        font-size: 13px;
        cursor: pointer;
        color: var(--ink);
      }
      .btn-primary {
        background: var(--forest);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 100px;
        font-size: 13px;
        cursor: pointer;
      }
      .writing-workspace {
        flex: 1;
        padding: 32px 48px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        overflow-y: auto;
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
      }
      .chapter-title-input {
        font-family: var(--display);
        font-size: 32px;
        font-weight: 700;
        color: var(--ink);
        border: none;
        background: transparent;
        outline: none;
        text-transform: capitalize;
      }
      .chapter-title-input::placeholder {
        color: var(--ink-faint);
      }
      .content-textarea {
        flex: 1;
        border: none;
        background: transparent;
        outline: none;
        font-size: 16px;
        line-height: 1.8;
        color: var(--ink);
        resize: none;
      }
      .content-textarea::placeholder {
        color: var(--ink-faint);
      }
      .input-field {
        width: 100%;
        padding: 10px 14px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--ink);
      }
      .input-field::placeholder {
        color: var(--ink-soft);
        opacity: 0.7;
      }
      .input-field:focus {
        outline: none;
        border-color: var(--forest);
      }
      .error-message {
        color: #c62828;
        padding: 10px;
        background: #ffebee;
        border-radius: 4px;
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
      }
      .cropper-container {
        width: 100%;
        height: 400px;
        background: #f0f0f0;
      }
      .cropper-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      @media (max-width: 900px) {
        .editor-layout {
          flex-direction: column;
        }
        .meta-sidebar {
          width: 100%;
          height: auto;
          max-height: 300px;
        }
      }
    `,
  ],
})
export class StoryEditorComponent implements OnInit {
  private bookService = inject(BookService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isDarkMode = localStorage.getItem('writerDarkMode') === 'true';
  coverPreviewUrl = signal<string | null>(null);
  
  supportedLanguages = [
    { code: 'en', label: 'English', char: 'A' },
    { code: 'ta-t-i0-und', label: 'Tamil', char: 'அ' },
    { code: 'hi-t-i0-und', label: 'Hindi', char: 'अ' },
    { code: 'te-t-i0-und', label: 'Telugu', char: 'అ' },
    { code: 'ml-t-i0-und', label: 'Malayalam', char: 'അ' },
    { code: 'kn-t-i0-und', label: 'Kannada', char: 'ಅ' },
    { code: 'mr-t-i0-und', label: 'Marathi', char: 'अ' },
    { code: 'bn-t-i0-und', label: 'Bengali', char: 'অ' },
    { code: 'gu-t-i0-und', label: 'Gujarati', char: 'અ' },
  ];
  typingLanguage = 'en';

  isSaving = false;
  lastSaved: Date | null = null;
  errorMessage = '';
  competitionTag: string | null = null;

  bookId: string | null = null;
  chapterId: string | null = null;
  isCoverUploaded = false;
  saveTimeout: any;

  story = {
    title: '',
    genre: '',
    description: '',
    tags: '',
    series: '',
    isMature: false,
  };

  chapter = {
    title: '',
    content: '',
  };

  ngOnInit() {
    const savedLang = localStorage.getItem('typingLanguage');
    if (savedLang) {
      this.typingLanguage = savedLang;
    }

    this.route.paramMap.subscribe((params) => {
      if (params.get('competition')) {
        this.competitionTag = params.get('competition');
      }

      if (params.get('clear') === 'true') {
        localStorage.removeItem('storyDraft');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { clear: null },
          queryParamsHandling: 'merge',
        });
        return;
      }
    });

    this.route.queryParams.subscribe((params) => {
      const draft = localStorage.getItem('storyDraft');
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          this.story = parsedDraft.story || this.story;
          this.chapter = parsedDraft.chapter || this.chapter;
          this.bookId = parsedDraft.bookId || null;
          this.chapterId = parsedDraft.chapterId || null;
          this.isCoverUploaded = parsedDraft.isCoverUploaded || false;
          if (parsedDraft.coverPreviewUrl) {
            this.coverPreviewUrl.set(parsedDraft.coverPreviewUrl);
            if (
              !this.isCoverUploaded &&
              parsedDraft.coverPreviewUrl.startsWith('data:image')
            ) {
              this.croppedBlob = this.base64ToBlob(parsedDraft.coverPreviewUrl);
            }
          }
        } catch (err) {
          console.error('Failed to parse draft from local storage', err);
        }
      }
    });
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
    if (event.base64) {
      this.croppedImage = event.base64;
      if (event.blob) {
        this.activeBlob = event.blob;
      } else {
        this.activeBlob = this.base64ToBlob(event.base64);
      }
    } else if (event.objectUrl) {
      if (event.blob) {
        this.activeBlob = event.blob;
        const reader = new FileReader();
        reader.readAsDataURL(event.blob);
        reader.onloadend = () => {
          this.croppedImage = reader.result as string;
        };
      } else {
        this.croppedImage = event.objectUrl;
      }
    }
  }

  applyCrop() {
    if (this.croppedImage) {
      this.coverPreviewUrl.set(this.croppedImage);
      this.croppedBlob = this.activeBlob;
      this.isCoverUploaded = false;

      if (this.croppedBlob) {
        const file = new File([this.croppedBlob], 'cover.jpg', {
          type: 'image/jpeg',
        });
        this.bookService.uploadCover(file).subscribe({
          next: (res) => {
            this.isCoverUploaded = true;
            const baseUrl = environment.apiUrl.replace('/api', '');
            const finalUrl =
              res.coverUrl.startsWith('data:') ||
              res.coverUrl.startsWith('http')
                ? res.coverUrl
                : `${baseUrl}${res.coverUrl.startsWith('/') ? '' : '/'}${res.coverUrl}`;
            this.coverPreviewUrl.set(finalUrl);
            this.onContentChange();
          },
          error: (err) => {
            console.error('Failed to upload cover', err);
            this.onContentChange();
          },
        });
      } else {
        this.onContentChange();
      }
    }
    this.imageChangedEvent = '';
  }

  cancelCrop() {
    this.imageChangedEvent = '';
    this.croppedImage = null;
    this.activeBlob = null;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('writerDarkMode', this.isDarkMode ? 'true' : 'false');
  }

  setTypingLanguage(langCode: string) {
    this.typingLanguage = langCode;
    localStorage.setItem('typingLanguage', langCode);
  }

  async onSynopsisKeydown(event: KeyboardEvent, textarea: HTMLTextAreaElement) {
    if (this.typingLanguage === 'en') return;

    if (event.key === ' ' || event.key === 'Enter') {
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = this.story.description.substring(0, cursorPosition);
      
      const match = textBeforeCursor.match(/([a-zA-Z]+)$/);
      
      if (match) {
        const word = match[1];
        const wordStart = cursorPosition - word.length;
        
        event.preventDefault();
        
        try {
          const translatedWord = await this.transliterateWord(word);
          
          const description = this.story.description;
          const newDescription = description.substring(0, wordStart) + translatedWord + (event.key === 'Enter' ? '\n' : ' ') + description.substring(cursorPosition);
          
          this.story.description = newDescription;
          this.onContentChange();
          
          setTimeout(() => {
            const newCursorPosition = wordStart + translatedWord.length + 1;
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
          }, 0);
        } catch (error) {
          console.error("Transliteration failed", error);
        }

      }
    }
  }
  
  async onChapterTitleKeydown(event: KeyboardEvent, input: HTMLInputElement) {
    if (this.typingLanguage === 'en') return;

    if (event.key === ' ' || event.key === 'Enter') {
      const cursorPosition = input.selectionStart || 0;
      const textBeforeCursor = this.chapter.title.substring(0, cursorPosition);
      
      const match = textBeforeCursor.match(/([a-zA-Z]+)$/);
      
      if (match) {
        const word = match[1];
        const wordStart = cursorPosition - word.length;
        
        event.preventDefault();
        
        try {
          const translatedWord = await this.transliterateWord(word);
          
          const title = this.chapter.title;
          const newTitle = title.substring(0, wordStart) + translatedWord + ' ' + title.substring(cursorPosition);
          
          this.chapter.title = newTitle;
          this.onContentChange();
          
          setTimeout(() => {
            const newCursorPosition = wordStart + translatedWord.length + 1;
            input.setSelectionRange(newCursorPosition, newCursorPosition);
          }, 0);
        } catch (error) {
          console.error("Transliteration failed", error);
        }
      }
    }
  }

  async onTextareaKeydown(event: KeyboardEvent, textarea: HTMLTextAreaElement) {
    if (this.typingLanguage === 'en') return;

    if (event.key === ' ' || event.key === 'Enter') {
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = this.chapter.content.substring(0, cursorPosition);
      
      const match = textBeforeCursor.match(/([a-zA-Z]+)$/);
      
      if (match) {
        const word = match[1];
        const wordStart = cursorPosition - word.length;
        
        event.preventDefault();
        
        try {
          const tamilWord = await this.transliterateWord(word);
          
          const content = this.chapter.content;
          const newContent = content.substring(0, wordStart) + tamilWord + (event.key === 'Enter' ? '\n' : ' ') + content.substring(cursorPosition);
          
          this.chapter.content = newContent;
          this.onContentChange();
          
          setTimeout(() => {
            const newCursorPosition = wordStart + tamilWord.length + 1;
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
          }, 0);
        } catch (error) {
          console.error("Transliteration failed", error);
        }
      }
    }
  }

  async transliterateWord(word: string): Promise<string> {
    const baseUrl = environment.apiUrl.replace('/api', '');
    const url = `${baseUrl}/api/tools/transliterate?text=${encodeURIComponent(word)}&itc=${this.typingLanguage}&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1] && data[1][0][1].length > 0) {
      return data[1][0][1][0];
    }
    throw new Error('No transliteration found');
  }

  undo(textarea: HTMLTextAreaElement) {
    textarea.focus();
    document.execCommand('undo');
  }

  redo(textarea: HTMLTextAreaElement) {
    textarea.focus();
    document.execCommand('redo');
  }

  publishChapter(isDraft: boolean, isAutoSave = false) {
    if (!this.story.title || !this.story.genre || !this.chapter.title) {
      if (!isAutoSave) {
        this.errorMessage =
          'Please fill out the story title, genre, and chapter title.';
      }
      return;
    }

    if (!isDraft && !this.coverPreviewUrl()) {
      if (!isAutoSave) {
        this.errorMessage = 'Please upload a cover image before publishing.';
      }
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const tagsArray = this.story.tags
      ? this.story.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];

    const bookData: any = {
      title: this.story.title,
      genre: this.story.genre,
      description: this.story.description,
      tags: tagsArray,
      isMature: this.story.isMature,
    };
    
    if (!isAutoSave) {
      if (isDraft) {
        bookData.status = 'draft';
      } else if (this.story.isMature) {
        // 18+ books require admin approval
        bookData.status = 'pending';
      } else {
        bookData.status = 'published';
      }
    } else if (!this.bookId) {
      bookData.status = 'draft';
    }
    if (this.story.series) {
      bookData.series = this.story.series;
    }
    if (this.competitionTag) {
      bookData.competitionTag = this.competitionTag;
    }

    if (this.croppedBlob && !this.isCoverUploaded) {
      const file = new File([this.croppedBlob], 'cover.jpg', {
        type: 'image/jpeg',
      });
      this.bookService.uploadCover(file).subscribe({
        next: (res) => {
          bookData.cover = res.coverUrl;
          this.isCoverUploaded = true;
          const baseUrl = environment.apiUrl.replace('/api', '');
          const finalUrl =
            res.coverUrl.startsWith('data:') || res.coverUrl.startsWith('http')
              ? res.coverUrl
              : `${baseUrl}${res.coverUrl.startsWith('/') ? '' : '/'}${res.coverUrl}`;
          this.coverPreviewUrl.set(finalUrl);
          this.saveToLocal();
          this.submitBook(bookData, isDraft, isAutoSave);
        },
        error: (err) => {
          console.error('Failed to upload cover', err);
          if (!isAutoSave)
            this.errorMessage =
              'Failed to upload cover image. Please try again.';
          this.isSaving = false;
        },
      });
    } else {
      let currentCover = this.coverPreviewUrl();
      if (currentCover) {
        if (!currentCover.startsWith('data:image')) {
          const baseUrl = environment.apiUrl.replace('/api', '');
          if (currentCover.startsWith(baseUrl)) {
            currentCover = currentCover.substring(baseUrl.length);
            if (!currentCover.startsWith('/'))
              currentCover = '/' + currentCover;
          }
        }
        bookData.cover = currentCover;
      }
      this.submitBook(bookData, isDraft, isAutoSave);
    }
  }

  private submitBook(bookData: any, isDraft: boolean, isAutoSave: boolean) {
    if (this.bookId) {
      this.bookService.updateBook(this.bookId, bookData).subscribe({
        next: () => {
          this.submitChapter(isDraft, isAutoSave);
        },
        error: (err) => {
          console.error('Failed to update book', err);
          if (!isAutoSave) {
            this.errorMessage =
              err.error?.msg || 'Failed to update story. Please try again.';
          }
          this.isSaving = false;
        },
      });
    } else {
      this.bookService.createBook(bookData).subscribe({
        next: (book) => {
          this.bookId = book._id;
          this.saveToLocal();
          this.submitChapter(isDraft, isAutoSave);
        },
        error: (err) => {
          console.error('Failed to create book', err);
          if (!isAutoSave) {
            this.errorMessage =
              err.error?.msg || 'Failed to create story. Please try again.';
          }
          this.isSaving = false;
        },
      });
    }
  }

  private submitChapter(isDraft: boolean, isAutoSave: boolean) {
    const chapterData: any = {
      title: this.chapter.title,
      content: this.chapter.content,
      season: 1,
    };
    
    if (!isAutoSave) {
      chapterData.status = isDraft ? 'draft' : 'published';
    } else if (!this.chapterId) {
      chapterData.status = 'draft';
    }

    if (this.chapterId) {
      this.bookService
        .updateChapter(this.bookId!, this.chapterId, chapterData)
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.lastSaved = new Date();
            if (!isAutoSave) {
              localStorage.removeItem('storyDraft');
              this.router.navigate(['/write']);
            }
          },
          error: (err) => {
            console.error('Failed to update chapter', err);
            if (!isAutoSave)
              this.errorMessage = 'Failed to update chapter. Please try again.';
            this.isSaving = false;
          },
        });
    } else {
      this.bookService.createChapter(this.bookId!, chapterData).subscribe({
        next: (chapter) => {
          this.chapterId = chapter._id;
          this.isSaving = false;
          this.lastSaved = new Date();
          this.saveToLocal();
          if (!isAutoSave) {
            localStorage.removeItem('storyDraft');
            this.router.navigate(['/write']);
          }
        },
        error: (err) => {
          console.error('Failed to save chapter', err);
          if (!isAutoSave)
            this.errorMessage = 'Failed to save chapter. Please try again.';
          this.isSaving = false;
        },
      });
    }
  }

  onContentChange() {
    // Save to local storage on every keystroke
    this.saveToLocal();

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.autoSave();
    }, 2000); // Trigger auto-save 2 seconds after typing stops
  }

  saveToLocal() {
    const draft = {
      story: this.story,
      chapter: this.chapter,
      bookId: this.bookId,
      chapterId: this.chapterId,
      isCoverUploaded: this.isCoverUploaded,
      coverPreviewUrl: this.coverPreviewUrl(),
    };
    try {
      localStorage.setItem('storyDraft', JSON.stringify(draft));
    } catch (err) {
      console.warn('Failed to save story draft. Might be out of quota.', err);
    }
  }

  autoSave() {
    if (this.isSaving) return;
    // Only auto-save if required fields are present
    if (this.story.title && this.story.genre && this.chapter.title) {
      this.publishChapter(true, true);
    }
  }
}
