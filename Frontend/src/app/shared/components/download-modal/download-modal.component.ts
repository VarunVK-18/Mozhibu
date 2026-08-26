import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-download-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Download Chapters</h3>
          <button class="close-btn" (click)="close.emit()">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="subtitle">
            Select how many chapters you want to download for offline reading.
          </p>

          <div class="options-grid">
            <label
              class="download-option"
              [class.selected]="selectedOption === '5'"
            >
              <input
                type="radio"
                name="downloadOption"
                value="5"
                [(ngModel)]="selectedOption"
              />
              <span class="option-title">Next 5 Chapters</span>
            </label>

            <label
              class="download-option"
              [class.selected]="selectedOption === '10'"
            >
              <input
                type="radio"
                name="downloadOption"
                value="10"
                [(ngModel)]="selectedOption"
              />
              <span class="option-title">Next 10 Chapters</span>
            </label>

            <label
              class="download-option"
              [class.selected]="selectedOption === '50'"
            >
              <input
                type="radio"
                name="downloadOption"
                value="50"
                [(ngModel)]="selectedOption"
              />
              <span class="option-title">Next 50 Chapters</span>
            </label>

            <label
              class="download-option"
              [class.selected]="selectedOption === 'all'"
            >
              <input
                type="radio"
                name="downloadOption"
                value="all"
                [(ngModel)]="selectedOption"
              />
              <span class="option-title">All Chapters</span>
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" (click)="close.emit()">Cancel</button>
          <button class="btn-confirm" (click)="confirmSelection()">
            Download
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.2s ease-out;
      }

      .modal-container {
        background: var(--card, #fff);
        width: 90%;
        max-width: 450px;
        border-radius: var(--radius-l, 16px);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        animation: slideUp 0.2s ease-out;
      }

      .modal-header {
        padding: 20px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border-soft, #f0f0f0);
      }

      .modal-header h3 {
        margin: 0;
        font-family: var(--display, 'Inter', sans-serif);
        font-size: 18px;
        font-weight: 600;
        color: var(--ink, #1a1a1a);
      }

      .close-btn {
        background: none;
        border: none;
        color: var(--ink-faint, #a09a90);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 50%;
        transition:
          background 0.2s,
          color 0.2s;
      }

      .close-btn:hover {
        background: var(--paper-warm, #f8f6f3);
        color: var(--ink, #1a1a1a);
      }

      .modal-body {
        padding: 24px;
      }

      .subtitle {
        margin: 0 0 20px 0;
        font-size: 14px;
        color: var(--ink-soft);
      }

      .options-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .download-option {
        border: 1px solid var(--border-soft);
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        transition: all 0.2s;
        background: var(--paper);
      }

      .download-option input {
        display: none;
      }

      .option-title {
        font-weight: 500;
        font-size: 14px;
        color: var(--ink);
      }

      .download-option:hover {
        border-color: var(--border);
      }

      .download-option.selected {
        border-color: var(--forest);
        background: var(--forest-tint);
      }

      .download-option.selected .option-title {
        color: var(--forest-deep);
        font-weight: 600;
      }

      .modal-actions {
        padding: 16px 24px;
        background: var(--paper-warm, #f8f6f3);
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        border-top: 1px solid var(--border-soft, #f0f0f0);
      }

      .btn-cancel,
      .btn-confirm {
        padding: 10px 20px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-cancel {
        background: transparent;
        border: 1px solid var(--border, #e5e7eb);
        color: var(--ink, #1a1a1a);
      }

      .btn-cancel:hover {
        background: var(--border-soft, #f0f0f0);
      }

      .btn-confirm {
        background: var(--forest, #2d5a27);
        border: 1px solid var(--forest, #2d5a27);
        color: white;
      }

      .btn-confirm:hover {
        background: var(--forest-deep, #1a3a18);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class DownloadModalComponent {
  selectedOption = '10';

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<number | 'all'>();

  confirmSelection() {
    this.confirm.emit(
      this.selectedOption === 'all' ? 'all' : parseInt(this.selectedOption, 10),
    );
  }
}
