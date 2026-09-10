import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-help-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-layout">
      <div class="support-container">
        <h1>Help & Support</h1>
        <p class="subtitle">Have a question or found a bug? Let us know!</p>

        <!-- Only show form if logged in -->
        @if (auth.user()) {
          <div class="feedback-card">
            <h2>Report a Bug / Feedback</h2>

            @if (successMessage) {
              <div class="success-alert">
                <i class="fa fa-check-circle"></i> {{ successMessage }}
              </div>
            }

            <form (submit)="submitFeedback($event)">
              <div class="form-group">
                <label>Feedback Details</label>
                <textarea
                  name="content"
                  [(ngModel)]="feedbackContent"
                  rows="5"
                  placeholder="Describe the bug or share your feedback here..."
                  required
                ></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="submitting || !feedbackContent.trim()">
                  @if (submitting) {
                    <span class="spinner"></span> Submitting...
                  } @else {
                    Submit Feedback
                  }
                </button>
              </div>

              @if (errorMessage) {
                <div class="error-msg mt-3">{{ errorMessage }}</div>
              }
            </form>
          </div>
        } @else {
          <div class="login-prompt card">
            <p>Please log in to submit a bug report or feedback.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .page-layout {
        min-height: calc(100vh - 73px);
        background: var(--paper-warm);
        padding: 60px 20px;
      }
      .support-container {
        max-width: 600px;
        margin: 0 auto;
      }
      h1 {
        font-size: 2.5rem;
        color: var(--ink);
        text-align: center;
        margin-bottom: 0.5rem;
      }
      .subtitle {
        text-align: center;
        color: var(--ink-soft);
        margin-bottom: 2rem;
      }
      .feedback-card {
        background: var(--card);
        padding: 30px;
        border-radius: var(--radius-l);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        border: 1px solid var(--border-soft);
      }
      .feedback-card h2 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: var(--ink);
      }
      .form-group {
        margin-bottom: 1.5rem;
      }
      label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
      }
      textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border);
        border-radius: var(--radius-m);
        background: var(--surface);
        color: var(--text-primary);
        font-size: 1rem;
        resize: vertical;
        transition: all 0.2s ease;
      }
      textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
      }
      .success-alert {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        padding: 12px 16px;
        border-radius: var(--radius-m);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }
      .error-msg {
        color: #ef4444;
        font-size: 0.9rem;
      }
      .login-prompt {
        text-align: center;
        padding: 40px;
        background: var(--card);
        border-radius: var(--radius-l);
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
      }
      .mt-3 {
        margin-top: 1rem;
      }
    `,
  ],
})
export class HelpSupportComponent {
  public auth = inject(AuthService);
  private api = inject(ApiService);

  feedbackContent = '';
  submitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  submitFeedback(e: Event) {
    e.preventDefault();
    if (!this.feedbackContent.trim()) return;

    this.submitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.api.post('/feedback', { content: this.feedbackContent }).subscribe({
      next: () => {
        this.submitting = false;
        this.feedbackContent = ''; // clear form
        this.successMessage = 'Thanks for your feedback. Your feedback can make us improve.';
        // clear message after 5 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMessage = err.error?.msg || 'Failed to submit feedback. Please try again.';
      },
    });
  }
}
