const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../../Frontend/src/app/features/write/chapter-editor.component.ts');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Replace Template
const newTemplate = `
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
          
          <button class="btn-icon" (click)="toggleSettings()" title="Chapter Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          
          <button class="btn-primary" [disabled]="isSaving" (click)="publishChapter(false)">
            {{ scheduledAt ? 'Schedule' : 'Publish' }}
          </button>
        </div>
      </header>

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
        
        <div class="editor-footer-stats">
          <span>{{ wordCount }} words</span>
          <span>{{ charCount }} characters</span>
        </div>
      </main>

      <!-- Chapter Settings Modal / Drawer -->
      @if (showSettings()) {
        <div class="settings-overlay" (click)="toggleSettings()">
          <div class="settings-drawer" (click)="$event.stopPropagation()">
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
                <select [(ngModel)]="accessType" class="input-field" (ngModelChange)="onContentChange()">
                  <option value="inherit">Follow Book Settings</option>
                  <option value="free">Free for Everyone</option>
                  <option value="premium" [disabled]="!isPremiumAllowed">Premium (Subscribers Only)</option>
                </select>
                <div *ngIf="!isPremiumAllowed" class="hint-text">Premium access available for Chapter 6 and beyond.</div>
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
          </div>
        </div>
      }
      
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
  `;

// 2. Replace Styles
const newStyles = `
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
      }
      
      /* Header */
      .editor-header {
        height: 64px;
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

      /* Settings Drawer */
      .settings-overlay {
        position: fixed;
        top: 0; right: 0; bottom: 0; left: 0;
        background: rgba(0,0,0,0.4);
        z-index: 200;
        display: flex;
        justify-content: flex-end;
      }
      .settings-drawer {
        width: 340px;
        height: 100%;
        background: var(--surface);
        box-shadow: -4px 0 24px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        animation: slideIn 0.3s ease forwards;
      }
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      .drawer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--border);
      }
      .drawer-header h3 { margin: 0; font-size: 16px; }
      .drawer-content {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        overflow-y: auto;
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
      }

      /* Modal (for cropper) */
      .cropper-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
      .cropper-modal { background: var(--surface); padding: 24px; border-radius: 12px; width: 90%; max-width: 500px; }
      .cropper-container { width: 100%; height: 400px; background: #f0f0f0; margin: 16px 0; }
      .cropper-actions { display: flex; justify-content: flex-end; gap: 12px; }
`;

// Find where template starts
const beforeTemplate = content.substring(0, content.indexOf('template: `'));

// Find where @Component ends (})
const afterStylesIndex = content.indexOf('})', content.indexOf('styles: ['));
const afterStyles = content.substring(afterStylesIndex);

content = beforeTemplate + "template: `" + newTemplate + "`,\n  styles: [\n    `" + newStyles + "`\n  ],\n" + afterStyles;

// Inject signals if they don't exist
if (!content.includes('showSettings = signal(false);')) {
  content = content.replace(/(export class ChapterEditorComponent implements OnInit \{)/, "$1\n  showSettings = signal(false);\n  bubbleToolbarVisible = signal(false);\n  bubbleToolbarTop = signal(0);\n  bubbleToolbarLeft = signal(0);\n\n  toggleSettings() {\n    this.showSettings.update(v => !v);\n  }\n");
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Successfully replaced template and styles without breaking typescript.");
