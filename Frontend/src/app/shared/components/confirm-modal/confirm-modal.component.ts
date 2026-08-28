import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (confirmService.state().isOpen) {
      <div class="modal-overlay" (click)="cancel()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ confirmService.state().title }}</h3>
            <button class="close-btn" (click)="cancel()">
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
            <p>{{ confirmService.state().message }}</p>
          </div>

          <div class="modal-actions">
            @if (confirmService.state().cancelText) {
              <button class="btn-cancel" (click)="cancel()">
                {{ confirmService.state().cancelText }}
              </button>
            }
            <button
              class="btn-confirm"
              [class.destructive]="confirmService.state().isDestructive"
              (click)="confirm()"
            >
              {{ confirmService.state().confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
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
        max-width: 400px;
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

      .modal-body p {
        margin: 0;
        font-size: 15px;
        line-height: 1.5;
        color: var(--ink-soft, #4a4a4a);
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
        font-family: var(--sans, 'Inter', sans-serif);
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

      .btn-confirm.destructive {
        background: #ef4444;
        border-color: #ef4444;
      }

      .btn-confirm.destructive:hover {
        background: #dc2626;
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
export class ConfirmModalComponent {
  public confirmService = inject(ConfirmService);

  confirm() {
    this.confirmService.resolve(true);
  }

  cancel() {
    this.confirmService.resolve(false);
  }
}
