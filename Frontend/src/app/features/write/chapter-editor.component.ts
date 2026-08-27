import {
  Component,
  OnInit,
  signal,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
            Back to Book
          </button>
        </div>

        <div class="meta-content">
          <div class="context-label">
            <span>{{
              chapterId && chapterId !== 'new'
                ? 'Editing chapter for'
                : 'Writing a new chapter for'
            }}</span>
            <h4>{{ bookTitle || 'Loading...' }}</h4>
          </div>

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
                alt="Chapter Cover Preview"
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
            <label>Chapter Access</label>
            <select
              [(ngModel)]="accessType"
              class="input-field select-field"
              (ngModelChange)="onContentChange()"
            >
              <option value="inherit">Follow Book Settings</option>
              <option value="free">Free for Everyone</option>
              <option value="premium">Premium (Subscribers Only)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Season</label>
            <input
              type="number"
              min="1"
              [(ngModel)]="season"
              class="input-field"
              (ngModelChange)="onContentChange()"
            />
          </div>

          <div class="form-group">
            <label>Schedule Publish (Optional)</label>
            <input
              type="datetime-local"
              [(ngModel)]="scheduledAt"
              class="input-field"
              (ngModelChange)="onContentChange()"
            />
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
            <button
              class="theme-toggle"
              (click)="toggleTheme()"
              title="Toggle Dark Mode"
            >
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
              (click)="toggleTamilTyping()"
              [class.active-btn]="isTamilTypingEnabled"
              title="Toggle Tamil Keyboard"
              style="display: flex; gap: 6px; align-items: center;"
            >
              <span style="font-weight: bold;">{{
                isTamilTypingEnabled ? 'அ' : 'A'
              }}</span>
            </button>
            <button
              class="btn-secondary"
              (click)="togglePreview()"
              [class.active-btn]="isPreviewMode"
              title="Preview Chapter"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button
              class="btn-secondary"
              [disabled]="isSaving"
              (click)="publishChapter(true)"
            >
              Save Draft
            </button>
            <button
              class="btn-primary"
              [disabled]="isSaving"
              (click)="publishChapter(false)"
            >
              {{ scheduledAt ? 'Schedule Publish' : 'Publish Chapter' }}
            </button>
          </div>
        </header>

        <div class="writing-workspace">
          @if (errorMessage) {
            <div class="error-message">
              {{ errorMessage }}
            </div>
          }

          <input
            type="text"
            class="chapter-title-input"
            placeholder="Chapter Title..."
            [(ngModel)]="chapterTitle"
            (ngModelChange)="onContentChange()"
          />

          <!-- Formatting Toolbar -->
          <div class="editor-toolbar" [class.hidden]="isPreviewMode">
            <button (click)="execCommand('bold')" title="Bold (Ctrl+B)">
              <b>B</b>
            </button>
            <button (click)="execCommand('italic')" title="Italic (Ctrl+I)">
              <i>I</i>
            </button>
            <button
              (click)="execCommand('underline')"
              title="Underline (Ctrl+U)"
            >
              <u>U</u>
            </button>
            <div class="divider"></div>
            <button
              (click)="execCommand('formatBlock', 'H1')"
              title="Heading 1"
            >
              H1
            </button>
            <button
              (click)="execCommand('formatBlock', 'H2')"
              title="Heading 2"
            >
              H2
            </button>
            <div class="divider"></div>
            <button
              (click)="execCommand('formatBlock', 'BLOCKQUOTE')"
              title="Quote"
            >
              ”
            </button>
            <button
              (click)="execCommand('insertHorizontalRule')"
              title="Divider"
            >
              —
            </button>
            <button (click)="inlineImageInput.click()" title="Insert Image">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
            <input
              type="file"
              #inlineImageInput
              hidden
              accept="image/*"
              (change)="uploadInlineImage($event)"
            />
          </div>

          <!-- Rich Text Editor Area -->
          <div
            class="content-editable-editor"
            [class.preview-mode]="isPreviewMode"
            [attr.contenteditable]="!isPreviewMode"
            #editor
            (input)="onEditorInput()"
            (keydown)="onEditorKeyDown($event)"
            [innerHTML]="editorContent"
            placeholder="Start writing your chapter here..."
          ></div>
        </div>

        <div class="editor-footer">
          <span
            >Words: <strong>{{ wordCount }}</strong></span
          >
          <span
            >Chars: <strong>{{ charCount }}</strong></span
          >
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
        position: relative;
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
      .actions {
        display: flex;
        gap: 12px;
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
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .btn-secondary.active-btn {
        background: var(--forest-tint);
        border-color: var(--forest);
        color: var(--forest-deep);
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
        padding: 32px 48px 80px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow-y: auto;
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
        position: relative;
      }

      .chapter-title-input {
        font-family: var(--display);
        font-size: 32px;
        font-weight: 700;
        color: var(--ink);
        border: none;
        background: transparent;
        outline: none;
        margin-bottom: 8px;
      }
      .chapter-title-input::placeholder {
        color: var(--ink-faint);
      }

      .editor-toolbar {
        display: flex;
        gap: 8px;
        padding: 8px 12px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 8px;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 10;
        transition: opacity 0.3s;
      }
      .editor-toolbar.hidden {
        display: none;
      }
      .editor-toolbar button {
        background: transparent;
        border: none;
        padding: 6px 10px;
        border-radius: 4px;
        color: var(--ink);
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .editor-toolbar button:hover {
        background: var(--paper-soft);
      }
      .editor-toolbar .divider {
        width: 1px;
        height: 20px;
        background: var(--border-soft);
        margin: 0 4px;
      }

      .content-editable-editor {
        flex: 1;
        outline: none;
        font-size: 16px;
        line-height: 1.8;
        color: var(--ink);
        min-height: 300px;
        padding-top: 12px;
      }
      .content-editable-editor[empty]:empty::before {
        content: attr(placeholder);
        color: var(--ink-faint);
        pointer-events: none;
      }

      /* Rich Text Styles inside editor */
      .content-editable-editor h1,
      .content-editable-editor h2 {
        margin-top: 24px;
        margin-bottom: 12px;
        font-family: var(--display);
      }
      .content-editable-editor blockquote {
        border-left: 4px solid var(--forest);
        margin: 16px 0;
        padding-left: 16px;
        color: var(--ink-soft);
        font-style: italic;
      }
      .content-editable-editor hr {
        border: none;
        border-top: 1px solid var(--border);
        margin: 24px 0;
      }
      .content-editable-editor img {
        max-width: 100%;
        border-radius: 8px;
        margin: 16px 0;
        display: block;
      }

      .content-editable-editor.preview-mode {
        cursor: default;
      }

      .editor-footer {
        position: absolute;
        bottom: 24px;
        right: 48px;
        display: flex;
        gap: 16px;
        background: var(--card);
        padding: 8px 16px;
        border: 1px solid var(--border);
        border-radius: 100px;
        font-size: 12px;
        color: var(--ink-soft);
        pointer-events: none;
      }
      .editor-footer strong {
        color: var(--ink);
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
        .writing-workspace {
          padding: 24px;
        }
        .editor-footer {
          right: 24px;
          bottom: 12px;
        }
      }
    `,
  ],
})
export class ChapterEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);

  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;

  bookId: string | null = null;
  bookTitle = '';
  chapterId: string | null = null;

  chapterTitle = '';
  editorContent = '';
  accessType = 'inherit';
  season = 1;
  scheduledAt: string = '';

  isSaving = false;
  lastSaved: Date | null = null;
  errorMessage = '';
  saveTimeout: any;

  isTamilTypingEnabled = false;
  isPreviewMode = false;

  wordCount = 0;
  charCount = 0;

  isDarkMode = localStorage.getItem('writerDarkMode') === 'true';

  coverPreviewUrl = signal<string | null>(null);
  isCoverUploaded = false;
  imageChangedEvent: any = '';
  croppedImage: string | null = null;
  croppedBlob: Blob | null = null;
  activeBlob: Blob | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.bookId = params.get('id');
      const paramChapterId = params.get('chapterId');

      if (paramChapterId && paramChapterId !== 'new') {
        this.chapterId = paramChapterId;
      }

      if (this.bookId) {
        this.fetchBookDetails(this.bookId);
      }

      this.route.queryParams.subscribe((queryParams) => {
        if (queryParams['clear'] === 'true') {
          const cacheKey = `chapterDraft_${this.bookId}_${this.chapterId || 'new'}`;
          localStorage.removeItem(cacheKey);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { clear: null },
            queryParamsHandling: 'merge',
          });
          return;
        }

        this.restoreDraft();
      });
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
        this.season = parsedDraft.season || this.season;
        this.scheduledAt = parsedDraft.scheduledAt || this.scheduledAt;
        this.chapterId = parsedDraft.chapterId || this.chapterId;
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

        this.updateMetrics(this.editorContent);
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
      next: (book) => (this.bookTitle = book.title),
      error: () => (this.bookTitle = 'Unknown Book'),
    });
  }

  fetchChapterDetails(bookId: string, chapterId: string) {
    this.bookService.getChapter(bookId, chapterId).subscribe({
      next: (chapter) => {
        this.chapterTitle = chapter.title;
        this.editorContent = chapter.content;
        this.accessType = chapter.accessType || 'inherit';
        this.season = chapter.season || 1;
        this.scheduledAt = chapter.scheduledAt || '';

        if (chapter.cover) {
          const baseUrl = environment.apiUrl.replace('/api', '');
          this.coverPreviewUrl.set(
            chapter.cover.startsWith('data:') ||
              chapter.cover.startsWith('http')
              ? chapter.cover
              : `${baseUrl}${chapter.cover.startsWith('/') ? '' : '/'}${chapter.cover}`,
          );
          this.isCoverUploaded = true;
        }

        this.updateMetrics(this.editorContent);
      },
      error: (err) => console.error('Failed to fetch chapter', err),
    });
  }

  goBack() {
    if (this.bookId) {
      this.router.navigate(['/write/book', this.bookId]);
    } else {
      this.router.navigate(['/write']);
    }
  }

  togglePreview() {
    this.isPreviewMode = !this.isPreviewMode;
  }

  execCommand(command: string, value: string = '') {
    document.execCommand(command, false, value);
    this.onEditorInput(); // trigger sync
  }

  onEditorInput() {
    if (!this.editorRef) return;
    const html = this.editorRef.nativeElement.innerHTML;
    if (this.editorContent !== html) {
      this.editorContent = html;
      this.updateMetrics(this.editorRef.nativeElement.innerText);
      this.onContentChange();
    }
  }

  updateMetrics(text: string) {
    const cleanText = text.trim();
    this.charCount = cleanText.length;
    this.wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  }

  toggleTamilTyping() {
    this.isTamilTypingEnabled = !this.isTamilTypingEnabled;
  }

  onEditorKeyDown(event: KeyboardEvent) {
    if (!this.isTamilTypingEnabled) return;

    if (event.key === ' ' || event.key === 'Enter') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;

      if (textNode.nodeType === Node.TEXT_NODE) {
        const textBeforeCursor =
          textNode.textContent?.substring(0, range.startOffset) || '';
        const match = textBeforeCursor.match(/([a-zA-Z]+)$/);

        if (match) {
          const englishWord = match[0];
          const tamilWord = (Sanscript as any).t(
            englishWord,
            'itrans',
            'tamil',
          );

          const newText =
            textNode.textContent?.substring(
              0,
              range.startOffset - englishWord.length,
            ) +
            tamilWord +
            textNode.textContent?.substring(range.startOffset);

          textNode.textContent = newText || '';

          // Move cursor to right after the replaced word
          const newCursorPos =
            range.startOffset - englishWord.length + tamilWord.length;
          range.setStart(textNode, newCursorPos);
          range.setEnd(textNode, newCursorPos);
          selection.removeAllRanges();
          selection.addRange(range);

          this.onEditorInput();
        }
      }
    }
  }

  // --- Inline Image Compression & Upload ---
  uploadInlineImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Compress using canvas before uploading
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e: any) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              // Upload to backend using existing uploadCover endpoint
              this.bookService.uploadCover(compressedFile).subscribe({
                next: (res) => {
                  const baseUrl = environment.apiUrl.replace('/api', '');
                  const imageUrl =
                    res.coverUrl.startsWith('data:') ||
                    res.coverUrl.startsWith('http')
                      ? res.coverUrl
                      : `${baseUrl}${res.coverUrl.startsWith('/') ? '' : '/'}${res.coverUrl}`;
                  // Insert the returned image URL into the rich text editor
                  this.editorRef.nativeElement.focus();
                  document.execCommand('insertImage', false, imageUrl);
                  this.onEditorInput();
                },
                error: (err) => {
                  console.error('Failed to upload inline image', err);
                  alert('Failed to upload image. Please try again.');
                },
              });
            }
          },
          'image/jpeg',
          0.8,
        );
      };
    };
    event.target.value = ''; // Reset input
  }

  // --- Existing Meta Image Logic ---
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
        const file = new File([this.croppedBlob], 'chapter-cover.jpg', {
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
            console.error('Failed to upload chapter cover', err);
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
      season: this.season,
      scheduledAt: this.scheduledAt,
      chapterId: this.chapterId,
      isCoverUploaded: this.isCoverUploaded,
      coverPreviewUrl: this.coverPreviewUrl(),
    };
    try {
      localStorage.setItem(cacheKey, JSON.stringify(draft));
    } catch (err) {
      console.warn(
        'Failed to save draft to local storage. Might be out of quota.',
        err,
      );
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

    if (!isDraft && !this.coverPreviewUrl()) {
      if (!isAutoSave) {
        this.errorMessage = 'Please upload a chapter cover image before publishing.';
      }
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    if (this.croppedBlob && !this.isCoverUploaded) {
      const file = new File([this.croppedBlob], 'chapter-cover.jpg', {
        type: 'image/jpeg',
      });
      this.bookService.uploadCover(file).subscribe({
        next: (res) => {
          this.isCoverUploaded = true;
          const baseUrl = environment.apiUrl.replace('/api', '');
          const finalUrl =
            res.coverUrl.startsWith('data:') || res.coverUrl.startsWith('http')
              ? res.coverUrl
              : `${baseUrl}${res.coverUrl.startsWith('/') ? '' : '/'}${res.coverUrl}`;
          this.coverPreviewUrl.set(finalUrl);
          this.saveToLocal();
          this.submitChapterData(res.coverUrl, isDraft, isAutoSave);
        },
        error: (err) => {
          console.error('Failed to upload chapter cover', err);
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
      }
      this.submitChapterData(currentCover, isDraft, isAutoSave);
    }
  }

  private submitChapterData(
    coverUrl: string | null | undefined,
    isDraft: boolean,
    isAutoSave: boolean,
  ) {
    const chapterData: any = {
      title: this.chapterTitle,
      content: this.editorContent,
      accessType: this.accessType,
      season: this.season,
    };
    
    if (!isAutoSave) {
      chapterData.status = isDraft ? 'draft' : this.scheduledAt ? 'scheduled' : 'published';
    } else if (!this.chapterId || this.chapterId === 'new') {
      chapterData.status = 'draft';
    }

    if (this.scheduledAt) {
      chapterData.scheduledAt = this.scheduledAt;
    }

    if (coverUrl) {
      chapterData.cover = coverUrl;
    }

    if (this.chapterId && this.chapterId !== 'new') {
      this.bookService
        .updateChapter(this.bookId!, this.chapterId, chapterData)
        .subscribe({
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

          localStorage.removeItem(`chapterDraft_${this.bookId}_new`);
          this.saveToLocal();

          if (!isAutoSave) {
            this.clearLocal();
            this.router.navigate(['/write/book', this.bookId]);
          }
        },
        error: (err) => {
          console.error('Failed to publish chapter', err);
          if (!isAutoSave)
            this.errorMessage = 'Failed to save chapter. Please try again.';
          this.isSaving = false;
        },
      });
    }
  }

  clearLocal() {
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
