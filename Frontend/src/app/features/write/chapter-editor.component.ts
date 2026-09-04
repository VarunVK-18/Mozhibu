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


@Component({
  selector: 'app-chapter-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  template: `
    <div class="editor-layout" [class.dark-mode]="isDarkMode">
      
      <!-- Topbar Header -->
      <header class="editor-header">
        <div class="header-left">
          <button class="back-btn" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>
          <div class="save-status">
            <span class="dot" [style.background]="isSaving ? '#f59e0b' : '#10B981'"></span>
            {{ isSaving ? 'Saving...' : lastSaved ? 'Saved ' + (lastSaved | date: 'shortTime') : 'Not saved' }}
          </div>
        </div>
        
        <div class="header-right actions">
          <button class="theme-toggle" (click)="toggleTheme()" title="Toggle Dark Mode">
            <svg *ngIf="!isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
            <svg *ngIf="isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
          
          <select class="btn-secondary lang-select" [(ngModel)]="typingLanguage" (ngModelChange)="setTypingLanguage($event)" title="Typing Language">
            <option *ngFor="let lang of supportedLanguages" [value]="lang.code">{{ lang.char }} - {{ lang.label }}</option>
          </select>
          
          <button class="btn-secondary" (click)="togglePreview()" [class.active-btn]="isPreviewMode" title="Preview">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          
          <button class="btn-icon" (click)="toggleSettings()" title="Chapter Settings" [class.active-icon]="showSettings()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          
          <button class="btn-secondary" [disabled]="isSaving" (click)="publishChapter(true)" title="Save Draft">
            <div *ngIf="isSaving" class="btn-loader dark"></div>
            Save Draft
          </button>

          <button class="btn-primary" [disabled]="isSaving" (click)="publishChapter(false)">
            <div *ngIf="isSaving" class="btn-loader"></div>
            {{ scheduledAt ? 'Schedule' : 'Publish' }}
          </button>
        </div>
      </header>

      <div class="main-content-wrapper">
        <!-- Chapter Settings Modal / Drawer (Now on the Left) -->
        @if (showSettings()) {
          <aside class="settings-sidebar">
            <div class="drawer-header">
              <h3>Chapter Settings</h3>
              <button class="btn-icon" (click)="toggleSettings()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div class="drawer-content">
              <div class="cover-upload" (click)="fileInput.click()">
                <input type="file" #fileInput hidden accept="image/*" (change)="fileChangeEvent($event)" />
                @if (coverPreviewUrl()) {
                  <img [src]="coverPreviewUrl()" alt="Cover" class="cover-preview-img" />
                } @else {
                  <div class="cover-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    <span>Upload Cover</span>
                  </div>
                }
              </div>

              <div class="form-group">
                <label>Chapter Access</label>
                <select #accessSelect [ngModel]="accessType" class="input-field" (ngModelChange)="onAccessChange($event, accessSelect)">
                  <option value="inherit">Follow Book Settings</option>
                  <option value="free">Free for Everyone</option>
                  <option value="premium">Premium (Subscribers Only)</option>
                </select>
                <div *ngIf="!isPremiumAllowed" class="hint-text">Premium access available for Chapter 6 and beyond.</div>
                @if (accessErrorMessage) {
                  <div class="popup-message">{{ accessErrorMessage }}</div>
                }
              </div>

              <div class="form-group">
                <label>Season</label>
                <input type="number" min="1" [(ngModel)]="season" class="input-field" (ngModelChange)="onContentChange()" />
              </div>

              <div class="form-group">
                <label>Schedule Publish</label>
                <input type="datetime-local" [(ngModel)]="scheduledAt" class="input-field" (ngModelChange)="onContentChange()" />
              </div>
            </div>
          </aside>
        }

        <!-- Main Workspace -->
        <main class="chapter-editor">
          <div class="writing-workspace">
            @if (errorMessage) {
              <div class="error-message">{{ errorMessage }}</div>
            }

            <input
              type="text"
              #chapterTitleInput
              class="chapter-title-input"
              placeholder="Chapter Title"
              [(ngModel)]="chapterTitle"
              (ngModelChange)="onContentChange()"
              (keydown)="onChapterTitleKeydown($event, chapterTitleInput)"
            />

            <!-- Floating Bubble Toolbar -->
            <div 
              class="bubble-toolbar" 
              [class.visible]="bubbleToolbarVisible() && !isPreviewMode"
              [style.top.px]="bubbleToolbarTop()"
              [style.left.px]="bubbleToolbarLeft()"
            >
              <button (click)="execCommand('bold')" title="Bold"><b>B</b></button>
              <button (click)="execCommand('italic')" title="Italic"><i>I</i></button>
              <button (click)="execCommand('underline')" title="Underline"><u>U</u></button>
              <div class="divider"></div>
              <button (click)="execCommand('formatBlock', 'H1')" title="Heading 1">H1</button>
              <button (click)="execCommand('formatBlock', 'H2')" title="Heading 2">H2</button>
              <div class="divider"></div>
              <button (click)="execCommand('formatBlock', 'BLOCKQUOTE')" title="Quote">”</button>
            </div>

            <!-- Rich Text Editor Area -->
            <div
              class="content-editable-editor"
              [class.preview-mode]="isPreviewMode"
              [attr.contenteditable]="!isPreviewMode"
              #editor
              (input)="onEditorInput()"
              (keydown)="onEditorKeyDown($event)"
              placeholder="Write your story..."
            ></div>
          </div>
          
          <div class="editor-footer-stats" [class.shifted]="showSettings()">
            <span>{{ wordCount }} words</span>
            <span>{{ charCount }} characters</span>
          </div>
        </main>
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
              ></image-cropper>
            </div>
            <div class="cropper-actions">
              <button class="btn-secondary" (click)="cancelCrop()">Cancel</button>
              <button class="btn-primary" (click)="applyCrop()">Apply Crop</button>
            </div>
          </div>
        </div>
      }
    </div>
`,
  styles: [
    `
      .dark-mode {
        --bg-color: #121212;
        --surface: #1e1e1e;
        --border: #333333;
        --text-primary: #e0e0e0;
        --text-secondary: #9e9e9e;
        --accent: #10B981;
      }
      :host {
        display: block;
        --bg-color: #fdfdfc;
        --surface: #ffffff;
        --border: #eaeaea;
        --text-primary: #2d2d2d;
        --text-secondary: #757575;
        --accent: #10B981;
        --font-serif: 'Georgia', serif;
        --font-sans: 'Inter', sans-serif;
      }
      .editor-layout {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--bg-color);
        color: var(--text-primary);
        font-family: var(--font-sans);
        overflow: hidden;
      }
      
      /* Header */
      .editor-header {
        height: 64px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        border-bottom: 1px solid var(--border);
        background: var(--surface);
        z-index: 100;
      }
      .header-left, .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .back-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-weight: 500;
        cursor: pointer;
      }
      .save-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--text-secondary);
        margin-left: 16px;
      }
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      
      .btn-icon {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.2s;
      }
      .btn-icon:hover {
        background: rgba(128,128,128,0.1);
        color: var(--text-primary);
      }
      .btn-icon.active-icon {
        background: var(--border);
        color: var(--text-primary);
      }
      
      .theme-toggle {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
      }
      
      .btn-secondary {
        background: transparent;
        border: 1px solid var(--border);
        padding: 6px 14px;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        color: var(--text-primary);
        display: flex;
        align-items: center;
      }
      .btn-secondary.active-btn {
        background: var(--text-primary);
        color: var(--bg-color);
      }
      .btn-primary {
        background: var(--accent);
        color: white;
        border: none;
        padding: 8px 18px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* Workspace wrapper */
      .main-content-wrapper {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      /* Settings Sidebar (Left Side) */
      .settings-sidebar {
        width: 340px;
        flex-shrink: 0;
        background: var(--surface);
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }
      .drawer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--border);
      }
      .drawer-header h3 { margin: 0; font-size: 16px; color: var(--text-primary); }
      .drawer-content {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      
      .cover-upload {
        width: 100%;
        aspect-ratio: 2/3;
        background: var(--bg-color);
        border: 2px dashed var(--border);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        overflow: hidden;
      }
      .cover-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: var(--text-secondary);
        font-size: 14px;
        gap: 8px;
      }
      .cover-preview-img { width: 100%; height: 100%; object-fit: cover; }
      
      .form-group { display: flex; flex-direction: column; gap: 8px; }
      .form-group label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
      .input-field {
        width: 100%; padding: 10px 12px;
        background: var(--bg-color);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text-primary);
        font-family: var(--font-sans);
      }
      .hint-text { font-size: 12px; color: var(--text-secondary); }
      .popup-message {
        font-size: 12px;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid rgba(239, 68, 68, 0.2);
        margin-top: 4px;
        animation: fadeIn 0.2s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }


      /* Workspace */
      .chapter-editor {
        flex: 1;
        overflow-y: auto;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60px 24px 100px;
      }
      .writing-workspace {
        width: 100%;
        max-width: 740px;
        position: relative;
      }
      
      .chapter-title-input {
        width: 100%;
        font-family: var(--font-sans);
        font-size: 42px;
        font-weight: 800;
        color: var(--text-primary);
        border: none;
        background: transparent;
        outline: none;
        margin-bottom: 24px;
        line-height: 1.2;
        text-transform: capitalize;
      }
      .chapter-title-input::placeholder {
        color: var(--border);
      }

      .content-editable-editor {
        width: 100%;
        outline: none;
        font-family: var(--font-serif);
        font-size: 20px;
        line-height: 1.8;
        color: var(--text-primary);
        min-height: 50vh;
      }
      .content-editable-editor[empty]:empty::before {
        content: attr(placeholder);
        color: var(--text-secondary);
        opacity: 0.5;
        pointer-events: none;
      }
      
      .content-editable-editor h1 { font-family: var(--font-sans); font-size: 32px; font-weight: 700; margin: 32px 0 16px; }
      .content-editable-editor h2 { font-family: var(--font-sans); font-size: 24px; font-weight: 600; margin: 28px 0 14px; }
      .content-editable-editor blockquote {
        border-left: 3px solid var(--text-primary);
        margin: 24px 0;
        padding-left: 20px;
        font-style: italic;
        color: var(--text-secondary);
      }

      /* Bubble Toolbar */
      .bubble-toolbar {
        position: fixed;
        background: var(--text-primary);
        color: var(--bg-color);
        padding: 6px 8px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        z-index: 1000;
        transform: translateX(-50%) translateY(10px) scale(0.95);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
        pointer-events: none;
      }
      .bubble-toolbar.visible {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(0) scale(1);
        pointer-events: auto;
      }
      .bubble-toolbar::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 6px 6px 0;
        border-style: solid;
        border-color: var(--text-primary) transparent transparent transparent;
      }
      .bubble-toolbar button {
        background: transparent;
        border: none;
        color: var(--bg-color);
        width: 32px;
        height: 32px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-sans);
        font-size: 15px;
        font-weight: 600;
      }
      .bubble-toolbar button:hover {
        background: rgba(255,255,255,0.2);
      }
      .bubble-toolbar .divider {
        width: 1px;
        height: 18px;
        background: rgba(255,255,255,0.2);
        margin: 0 4px;
      }

      /* Footer Stats */
      .editor-footer-stats {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--surface);
        border: 1px solid var(--border);
        padding: 8px 16px;
        border-radius: 100px;
        font-size: 12px;
        color: var(--text-secondary);
        display: flex;
        gap: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        pointer-events: none;
        transition: transform 0.3s;
      }
      .editor-footer-stats.shifted {
        transform: translateX(calc(-50% + 170px));
      }

      /* Modal (for cropper) */
      .cropper-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
      .cropper-modal { background: var(--surface); padding: 24px; border-radius: 12px; width: 90%; max-width: 500px; }
      .cropper-container { width: 100%; height: 400px; background: #f0f0f0; margin: 16px 0; }
      .cropper-actions { display: flex; justify-content: flex-end; gap: 12px; }
`
  ],
})
export class ChapterEditorComponent implements OnInit {
  accessErrorMessage = '';
  
  onAccessChange(newVal: string, selectElement: HTMLSelectElement) {
    if (newVal === 'premium' && !this.isPremiumAllowed) {
      this.accessErrorMessage = 'Premium content can only be activated for Chapter 6 and beyond to ensure readers get enough free content first!';
      // Revert the dropdown visually
      selectElement.value = this.accessType;
      
      // Auto-hide the message after 4 seconds
      setTimeout(() => {
        this.accessErrorMessage = '';
      }, 4000);
      return;
    }
    
    this.accessErrorMessage = '';
    this.accessType = newVal;
    this.onContentChange();
  }

  showSettings = signal(true);
  bubbleToolbarVisible = signal(false);
  bubbleToolbarTop = signal(0);
  bubbleToolbarLeft = signal(0);

  toggleSettings() {
    this.showSettings.update(v => !v);
  }

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
  chapterOrder = 0;

  get isPremiumAllowed(): boolean {
    return this.chapterOrder > 5;
  }
  season = 1;
  scheduledAt: string = '';

  isSaving = false;
  lastSaved: Date | null = null;
  errorMessage = '';
  saveTimeout: any;

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

  // ─── Tamil Transliteration (Tanglish → Tamil) ─────────────────────────────
  // Single-pass context-aware syllable parser. No pre-processing markers.
  // 'n' is resolved at parse time based on surrounding characters.

  transliterateToTamil(rawInput: string): string {
    // ── Pre-process: doubled-consonant + word-final 'a' → long 'aa' ──────
    // e.g.  amma → ammaa → அம்மா   appa → appaa → அப்பா
    //       kanna → kannaa → கன்னா  anna → annaa → அன்னா
    // Only fires when word ends in CC+a (same consonant twice then 'a').
    const raw = rawInput.replace(/([a-zA-Z])\1a$/g, '$1$1aa');

    const VIRAMA    = '\u0BCD'; // ் (pulli)
    const N_DENTAL  = '\u0BA8'; // ந  (default n)
    const N_RETRO   = '\u0BA3'; // ண  (before k/g/d/t)
    const N_ALVEOL  = '\u0BA9'; // ன  (geminate nn, word-final)
    const VOWELS    = new Set(['a','e','i','o','u','A','E','I','O','U']);

    // [romanized, Tamil-base]. 2-char entries MUST come before 1-char.
    const CONS: [string, string][] = [
      ['ng', '\u0B99'], ['nj', '\u0B9E'], ['ny', '\u0B9E'],
      ['sh', '\u0BB7'], ['Sh', '\u0BB7'], ['zh', '\u0BB4'],
      ['ch', '\u0B9A'],
      ['th', '\u0BA4'], ['dh', '\u0BA4'],
      ['ph', '\u0BAA'], ['gh', '\u0B95'], ['kh', '\u0B95'],
      ['dr', '\u0BB1'], ['tr', '\u0BB1'],   // dr/tr → ற (hard retroflex r)
      ['k', '\u0B95'], ['g', '\u0B95'],
      ['c', '\u0B9A'], ['j', '\u0B9C'],
      ['T', '\u0B9F'], ['D', '\u0B9F'],
      ['t', '\u0B9F'], ['d', '\u0B9F'],
      ['N', '\u0BA3'],                      // explicit retroflex ண (capital N)
      // 'n' handled separately via resolveN()
      ['p', '\u0BAA'], ['b', '\u0BAA'], ['m', '\u0BAE'],
      ['y', '\u0BAF'],
      ['R', '\u0BB1'], ['r', '\u0BB0'],     // R=ற, r=ர
      ['L', '\u0BB3'], ['l', '\u0BB2'],     // L=ள, l=ல
      ['v', '\u0BB5'], ['w', '\u0BB5'],
      ['h', '\u0BB9'], ['s', '\u0BB8'],
      ['z', '\u0BB4'], ['f', '\u0BAA'],
      ['x', '\u0B95\u0BCD\u0BB8'],
    ];

    // [romanized, standalone-form, matra]. 2-char FIRST.
    const VOWS: [string, string, string][] = [
      ['aa', '\u0B86', '\u0BBE'], ['ii', '\u0B88', '\u0BC0'],
      ['ee', '\u0B88', '\u0BC0'], ['uu', '\u0B8A', '\u0BC2'],
      ['oo', '\u0B8A', '\u0BC2'], ['ai', '\u0B90', '\u0BC8'],
      ['au', '\u0B94', '\u0BCC'], ['ae', '\u0B8F', '\u0BC7'],
      ['a', '\u0B85', ''],  ['i', '\u0B87', '\u0BBF'],
      ['u', '\u0B89', '\u0BC1'], ['e', '\u0B8E', '\u0BC6'],
      ['o', '\u0B92', '\u0BCA'],
    ];

    const matchCons = (pos: number): [string, string] | null => {
      for (const [r, b] of CONS) {
        if (raw.substring(pos, pos + r.length) === r) return [r, b];
      }
      return null;
    };

    const matchVow = (pos: number): [string, string, string] | null => {
      for (const e of VOWS) {
        if (raw.substring(pos, pos + e[0].length) === e[0]) return e;
      }
      return null;
    };

    // Decide which Tamil 'n' character to use based on context:
    //  · nn geminate (both occurrences)  → ன  (alveolar)
    //  · word-final n                    → ன  (alveolar)
    //  · before k/g (through vowels)     → ண  (retroflex)
    //  · before d/t (not dh/th)          → ண  (retroflex)
    //  · otherwise                       → ந  (dental, default)
    const resolveN = (pos: number): string => {
      // geminate: this is first 'n' of 'nn'
      if (raw[pos + 1] === 'n') return N_ALVEOL;
      // geminate: this is second 'n' of 'nn'
      if (pos > 0 && raw[pos - 1] === 'n') return N_ALVEOL;

      // scan ahead past vowels to find next consonant
      let j = pos + 1;
      while (j < raw.length && VOWELS.has(raw[j])) j++;

      const nc  = raw[j] ?? '';
      const nc2 = raw[j + 1] ?? '';

      if ('kg'.includes(nc))                                    return N_RETRO;
      if ((nc === 'd' && nc2 !== 'h') || (nc === 't' && nc2 !== 'h')) return N_RETRO;

      // word-final
      if (j >= raw.length) return N_ALVEOL;

      return N_DENTAL;
    };

    // ── Single-pass syllable parser ────────────────────────────────────────
    let result = '';
    let i = 0;

    while (i < raw.length) {

      // ── special: 'n' (context-sensitive) ──────────────────────────────
      if (raw[i] === 'n') {
        const base = resolveN(i);
        i++;
        const vow = matchVow(i);
        if (vow) { i += vow[0].length; result += base + vow[2]; }
        else      { result += base + VIRAMA; }
        continue;
      }

      // ── consonant ─────────────────────────────────────────────────────
      const cons = matchCons(i);
      if (cons) {
        const [cRom, cBase] = cons;
        i += cRom.length;
        const vow = matchVow(i);
        if (vow) { i += vow[0].length; result += cBase + vow[2]; }
        else      { result += cBase + VIRAMA; }
        continue;
      }

      // ── vowel (standalone) ────────────────────────────────────────────
      const vow = matchVow(i);
      if (vow) { i += vow[0].length; result += vow[1]; continue; }

      // ── unknown: pass through ─────────────────────────────────────────
      result += raw[i++];
    }

    return result;
  }


  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.bookId = params.get('id') || '';
      this.chapterId = params.get('chapterId');
      
      const savedLang = localStorage.getItem('typingLanguage');
      if (savedLang) {
        this.typingLanguage = savedLang;
      }

      if (this.chapterId && this.chapterId !== 'new') {
        this.fetchChapterDetails(this.bookId, this.chapterId);
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
        // Use setTimeout to ensure the DOM is ready before setting content
        setTimeout(() => this.setEditorContent(this.editorContent), 0);
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
    
    if (!this.chapterId) {
      this.bookService.getChapters(id).subscribe({
        next: (chapters) => {
          this.chapterOrder = (chapters?.length || 0) + 1;
          if (!this.isPremiumAllowed && this.accessType === 'premium') {
            this.accessType = 'inherit';
          }
        },
        error: () => {}
      });
    }
  }

  fetchChapterDetails(bookId: string, chapterId: string) {
    this.bookService.getChapter(bookId, chapterId).subscribe({
      next: (chapter) => {
        this.chapterTitle = chapter.title;
        this.editorContent = chapter.content;
        this.accessType = chapter.accessType || 'inherit';
        this.season = chapter.season || 1;
        this.scheduledAt = chapter.scheduledAt || '';
        this.chapterOrder = chapter.order || 0;
        
        if (!this.isPremiumAllowed && this.accessType === 'premium') {
          this.accessType = 'inherit';
        }

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
        // Safely set editor DOM content after fetch
        setTimeout(() => this.setEditorContent(this.editorContent), 0);
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
    // Only update internal state — do NOT set innerHTML back (causes cursor jump)
    this.editorContent = html;
    this.updateMetrics(this.editorRef.nativeElement.innerText);
    this.onContentChange();
  }

  // Set editor content safely without losing cursor position
  private setEditorContent(html: string) {
    if (!this.editorRef) return;
    const el = this.editorRef.nativeElement;
    const isFocused = document.activeElement === el;

    if (isFocused) {
      // Save cursor position as character offset
      const savedPos = this.saveCursorPosition(el);
      el.innerHTML = html;
      this.restoreCursorPosition(el, savedPos);
    } else {
      el.innerHTML = html;
    }
  }

  private saveCursorPosition(container: HTMLElement): number {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    const preRange = document.createRange();
    preRange.selectNodeContents(container);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length;
  }

  private restoreCursorPosition(container: HTMLElement, charOffset: number) {
    const selection = window.getSelection();
    if (!selection) return;
    let remaining = charOffset;
    let found = false;

    const walk = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const len = node.textContent?.length || 0;
        if (remaining <= len) {
          const range = document.createRange();
          range.setStart(node, remaining);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          return true;
        }
        remaining -= len;
      } else {
        for (const child of Array.from(node.childNodes)) {
          if (walk(child)) return true;
        }
      }
      return false;
    };

    if (!walk(container)) {
      // Fallback: move cursor to end
      const range = document.createRange();
      range.selectNodeContents(container);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  updateMetrics(text: string) {
    const cleanText = text.trim();
    this.charCount = cleanText.length;
    this.wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  }

  setTypingLanguage(langCode: string) {
    this.typingLanguage = langCode;
    localStorage.setItem('typingLanguage', langCode);
  }

  async onChapterTitleKeydown(event: KeyboardEvent, input: HTMLInputElement) {
    if (this.typingLanguage === 'en') return;

    if (event.key === ' ' || event.key === 'Enter') {
      const cursorPosition = input.selectionStart || 0;
      const textBeforeCursor = this.chapterTitle.substring(0, cursorPosition);
      
      const match = textBeforeCursor.match(/([a-zA-Z]+)$/);
      
      if (match) {
        const word = match[1];
        const wordStart = cursorPosition - word.length;
        
        event.preventDefault();
        
        try {
          let translatedWord = '';
          try {
            translatedWord = await this.transliterateWord(word);
          } catch (e) {
            console.error('Google Input API failed, falling back to local transliteration', e);
            translatedWord = this.transliterateToTamil(word);
          }
          
          const title = this.chapterTitle;
          const newTitle = title.substring(0, wordStart) + translatedWord + ' ' + title.substring(cursorPosition);
          
          this.chapterTitle = newTitle;
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

  async onEditorKeyDown(event: KeyboardEvent) {
    if (this.typingLanguage === 'en') return;

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
          event.preventDefault(); // prevent the space/enter from being added before we replace

          const englishWord = match[0];
          let tamilWord = '';
          
          try {
            tamilWord = await this.transliterateWord(englishWord);
          } catch (e) {
            console.error('Google Input API failed, falling back to local transliteration', e);
            tamilWord = this.transliterateToTamil(englishWord);
          }

          const fullText = textNode.textContent || '';
          const beforeWord = fullText.substring(
            0,
            range.startOffset - englishWord.length,
          );
          const afterCursor = fullText.substring(range.startOffset);

          // Add a space after the Tamil word (or newline char placeholder)
          const separator = event.key === 'Enter' ? '' : ' ';
          textNode.textContent = beforeWord + tamilWord + separator + afterCursor;

          // Move cursor to right after the replaced word + separator
          const newCursorPos =
            beforeWord.length + tamilWord.length + separator.length;
          range.setStart(textNode, newCursorPos);
          range.setEnd(textNode, newCursorPos);
          selection.removeAllRanges();
          selection.addRange(range);

          // If Enter was pressed, insert a paragraph break
          if (event.key === 'Enter') {
            document.execCommand('insertParagraph', false);
          }

          this.onEditorInput();
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
      return data[1][0][1][0]; // Return the first suggestion
    }
    throw new Error('No transliteration found');
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
