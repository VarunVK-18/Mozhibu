import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-story-editor',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
          <div class="cover-upload" (click)="fileInput.click()">
            <input type="file" #fileInput accept="image/*" style="display: none" (change)="onFileSelected($event)">
            
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
          
          <div class="form-group">
            <label>Story Title</label>
            <input type="text" class="input-field" placeholder="e.g. The Neon Shadows">
          </div>
          
          <div class="form-group">
            <label>Primary Genre</label>
            <select class="input-field select-field">
              <option value="" disabled selected>Select a genre...</option>
              <option value="romance">Romance</option>
              <option value="fantasy">Fantasy</option>
              <option value="scifi">Sci-Fi</option>
              <option value="mystery">Mystery</option>
              <option value="thriller">Thriller</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Synopsis</label>
            <textarea class="input-field textarea-field" placeholder="Write a compelling summary to hook your readers..." rows="6"></textarea>
          </div>
        </div>
      </aside>

      <!-- Main Area: Chapter Editor -->
      <main class="chapter-editor">
        <header class="editor-header">
          <div class="save-status">
            <span class="dot"></span>
            Saved just now
          </div>
          <div class="actions">
            <button class="btn-secondary">Save Draft</button>
            <button class="btn-primary">Publish Chapter</button>
          </div>
        </header>
        
        <div class="writing-workspace">
          <input type="text" class="chapter-title-input" placeholder="Chapter 1: Title...">
          
          <textarea class="content-textarea" placeholder="Start writing your story here..."></textarea>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .editor-layout {
      display: flex;
      height: calc(100vh - 73px); /* Minus topbar */
      background: var(--paper);
    }
    
    /* Meta Sidebar */
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
      padding: 0;
      transition: color 0.2s;
    }
    
    .back-btn:hover {
      color: var(--ink);
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
      transition: all 0.2s;
      overflow: hidden;
      position: relative;
    }
    
    .cover-upload:hover {
      border-color: var(--forest);
      background: rgba(63, 98, 89, 0.05);
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
      font-weight: 500;
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
      letter-spacing: 0.05em;
    }
    
    .input-field {
      width: 100%;
      padding: 10px 14px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-family: inherit;
      font-size: 14px;
      color: var(--ink);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .input-field:focus {
      outline: none;
      border-color: var(--forest);
      box-shadow: 0 0 0 3px rgba(63, 98, 89, 0.1);
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
    
    /* Chapter Editor */
    .chapter-editor {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
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
      background: #10B981;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .btn-secondary {
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
    
    .btn-secondary:hover {
      background: var(--paper-soft);
      border-color: var(--ink-soft);
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
    
    .btn-primary:hover {
      background: var(--forest-deep);
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
      width: 100%;
      background: transparent;
      border: none;
      font-family: var(--display);
      font-size: 32px;
      font-weight: 700;
      color: var(--ink);
      padding: 0;
    }
    
    .chapter-title-input:focus {
      outline: none;
    }
    
    .chapter-title-input::placeholder {
      color: var(--ink-faint);
    }
    
    .content-textarea {
      flex: 1;
      width: 100%;
      background: transparent;
      border: none;
      resize: none;
      font-family: var(--body);
      font-size: 16px;
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
    
    @media (max-width: 900px) {
      .editor-layout { flex-direction: column; }
      .meta-sidebar { width: 100%; height: auto; max-height: 300px; border-right: none; border-bottom: 1px solid var(--border); }
      .writing-workspace { padding: 32px 24px; }
      .chapter-title-input { font-size: 32px; }
      .content-textarea { font-size: 18px; }
    }
  `]
})
export class StoryEditorComponent {
  coverPreviewUrl = signal<string | null>(null);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.coverPreviewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }
}
