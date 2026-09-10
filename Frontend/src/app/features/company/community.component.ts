import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-layout">
      <!-- Header -->
      <div class="header wrap">
        <h1>Mozhibu <span class="accent">Knowledge Base &amp; Help</span></h1>
        <p>Complete User Guide, Documentation &amp; Support</p>
      </div>

      <div class="toc wrap">
        <button (click)="scrollTo('getting-started')" class="toc-link">1. Getting Started</button>
        <button (click)="scrollTo('reader-guide')" class="toc-link">2. Reader Guide</button>
        <button (click)="scrollTo('author-studio')" class="toc-link">3. Author Studio</button>
        <button (click)="scrollTo('account-settings')" class="toc-link">4. Account Settings</button>
      </div>

      <!-- Main Layout: Guide Content + Right Side Small Feedback -->
      <div class="content-container wrap">
        <!-- Guide Content (Left) -->
        <div class="guide-content">
          <!-- SECTION 1 -->
          <section id="getting-started" class="guide-section">
            <h2>1. Getting Started</h2>
            <p>Welcome to Mozhibu! To access all features, you'll need to create an account.</p>
            
            <div class="step">
              <h3>Signing Up</h3>
              <p>Click the "Sign Up" button on the top right corner. You can register using your email address.</p>
              <div class="screenshot-wrapper">
                <img src="assets/kt/Signuppage.png" alt="Sign Up Page" (error)="onImgError($event)" />
                <div class="placeholder-text">Save screenshot as: assets/kt/Signuppage.png</div>
              </div>
            </div>
            
            <div class="step">
              <h3>Logging In</h3>
              <p>Once registered, use the login page to access your account.</p>
              <div class="screenshot-wrapper">
                <img src="assets/kt/Loginpage.png" alt="Login Page" (error)="onImgError($event)" />
                <div class="placeholder-text">Save screenshot as: assets/kt/Loginpage.png</div>
              </div>
            </div>
          </section>

          <!-- SECTION 2 -->
          <section id="reader-guide" class="guide-section">
            <h2>2. Reader Guide</h2>
            <p>Discovering and reading books on Mozhibu is easy.</p>
            
            <div class="step">
              <h3>Discovering Books</h3>
              <p>Use the Search bar or browse the "Categories" page to find your next favorite story. The Home page also shows Trending and Recommended books.</p>
              <div class="screenshot-wrapper">
                <img src="assets/kt/Homepage.png" alt="Home Page Discovery" (error)="onImgError($event)" />
                <div class="placeholder-text">Save screenshot as: assets/kt/Homepage.png</div>
              </div>
            </div>
            
            <div class="step">
              <h3>Categories Page</h3>
              <p>Browse through different genres to find exactly what you are in the mood to read.</p>
              <div class="screenshot-wrapper">
                <img src="assets/kt/catogerypage.png" alt="Categories Page" (error)="onImgError($event)" />
                <div class="placeholder-text">Save screenshot as: assets/kt/catogerypage.png</div>
              </div>
            </div>

            <div class="step">
              <h3>The Reading Interface</h3>
              <p>Click on any book to open the reading interface. You can adjust the font size, theme (dark/light), and navigate between chapters.</p>
              <div class="screenshot-wrapper">
                <img src="assets/kt/Chapterpreviewpage.png" alt="Reading Interface" (error)="onImgError($event)" />
                <div class="placeholder-text">Save screenshot as: assets/kt/Chapterpreviewpage.png</div>
              </div>
            </div>

            <div class="step">
              <h3>Your Library</h3>
              <p>Save books to your library to easily find them later and track your reading progress.</p>
              <div class="screenshot-wrapper">
                <img src="assets/kt/Librarypage.png" alt="User Library" (error)="onImgError($event)" />
                <div class="placeholder-text">Save screenshot as: assets/kt/Librarypage.png</div>
              </div>
            </div>
          </section>

          <!-- SECTION 3 -->
          <section id="author-studio" class="guide-section">
            <h2>3. Author Studio</h2>
            <p>Ready to publish your own stories? Welcome to the Author Studio.</p>
            
            <div class="step">
              <h3>Becoming an Author</h3>
              <p>Go to your Settings -> Account Settings, and click "Become an Author" to gain access to the studio.</p>
              <div class="screenshot-wrapper">
                <img src="assets/kt/Authorsstudiopage.png" alt="Become an Author Settings" (error)="onImgError($event)" />
                <div class="placeholder-text">Save screenshot as: assets/kt/Authorsstudiopage.png</div>
              </div>
            </div>

            <div class="step">
              <h3>Creating a Book</h3>
              <p>In the Author Studio, click "Create New Story". Fill in the title, description, genre, and upload a book cover.</p>
              <div class="screenshot-wrapper">
                <img src="assets/kt/Creating a Book.png" alt="Create Book Screen" (error)="onImgError($event)" />
                <div class="placeholder-text">Save screenshot as: assets/kt/Creating a Book.png</div>
              </div>
            </div>

            <div class="step">
              <h3>Writing Chapters</h3>
              <p>Use the rich text editor to write your chapters. You can save drafts and publish them when they are ready.</p>
              <div class="screenshot-wrapper">
                <img src="assets/kt/Writing Chapters.png" alt="Chapter Editor" (error)="onImgError($event)" />
                <div class="placeholder-text">Save screenshot as: assets/kt/Writing Chapters.png</div>
              </div>
            </div>
          </section>

          <!-- SECTION 4 -->
          <section id="account-settings" class="guide-section">
            <h2>4. Account Settings</h2>
            
            <div class="step">
              <h3>Updating Your Profile</h3>
              <p>Change your profile picture, bio, and password from the Settings page.</p>
              <div class="screenshot-wrapper">
                <img src="assets/kt/Profilepage.png" alt="Settings Page" (error)="onImgError($event)" />
                <div class="placeholder-text">Save screenshot as: assets/kt/Profilepage.png</div>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Side: Small Feedback Card -->
        <aside class="sidebar-feedback">
          <div class="feedback-card">
            <div class="feedback-card-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <h3>Feedback &amp; Bug Report</h3>
            </div>
            <p class="feedback-desc">Have a question or found a bug? Let us know!</p>

            @if (successMessage) {
              <div class="success-alert">
                <i class="fa fa-check-circle"></i> {{ successMessage }}
              </div>
            }

            @if (auth.user()) {
              <form (submit)="submitFeedback($event)">
                <div class="form-group">
                  <textarea
                    name="content"
                    [(ngModel)]="feedbackContent"
                    rows="4"
                    placeholder="Describe your feedback or issue..."
                    required
                  ></textarea>
                </div>

                <div class="form-actions">
                  <button type="submit" class="submit-btn" [disabled]="submitting || !feedbackContent.trim()">
                    @if (submitting) {
                      <span class="spinner"></span> Submitting...
                    } @else {
                      Submit Feedback
                    }
                  </button>
                </div>

                @if (errorMessage) {
                  <div class="error-msg">{{ errorMessage }}</div>
                }
              </form>
            } @else {
              <div class="login-prompt">
                <p>Please <a routerLink="/login" class="login-link">log in</a> to report an issue or give feedback.</p>
              </div>
            }
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .page-layout {
        min-height: calc(100vh - 73px);
        background: var(--paper);
        padding: 60px 0 120px;
        scroll-behavior: smooth;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .header h1 {
        font-family: var(--display);
        font-size: 38px;
        margin-bottom: 12px;
        color: var(--ink);
      }
      .accent {
        color: var(--forest);
      }
      .header p {
        font-size: 16px;
        color: var(--ink-soft);
      }

      .toc {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 48px;
        padding-bottom: 24px;
        border-bottom: 1px solid var(--border-soft);
      }
      .toc-link {
        padding: 8px 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 100px;
        color: var(--ink);
        text-decoration: none;
        font-weight: 500;
        font-size: 13px;
        transition: all 0.2s;
        cursor: pointer;
        font-family: inherit;
      }
      .toc-link:hover {
        border-color: var(--forest);
        color: var(--forest);
      }

      .content-container {
        display: flex;
        gap: 40px;
        align-items: flex-start;
        position: relative;
      }

      .guide-content {
        flex: 1;
        min-width: 0;
        max-width: 760px;
      }

      .sidebar-feedback {
        width: 320px;
        position: sticky;
        top: 90px;
        flex-shrink: 0;
      }

      .feedback-card {
        background: var(--card, #ffffff);
        padding: 22px;
        border-radius: var(--radius-l, 16px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
        border: 1px solid var(--border-soft, rgba(0, 0, 0, 0.08));
      }

      .feedback-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;
        color: var(--forest, #10b981);
      }

      .feedback-card-header h3 {
        font-size: 16px;
        font-weight: 700;
        color: var(--ink, #1f2937);
        margin: 0;
      }

      .feedback-desc {
        font-size: 13px;
        color: var(--ink-soft, #6b7280);
        margin-bottom: 16px;
        line-height: 1.4;
      }

      .form-group {
        margin-bottom: 12px;
      }

      textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--border, #d1d5db);
        border-radius: 10px;
        background: var(--surface, #f9fafb);
        color: var(--text-primary, #111827);
        font-size: 13px;
        resize: vertical;
        font-family: inherit;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      textarea:focus {
        outline: none;
        border-color: var(--forest, #10b981);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        background: #fff;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
      }

      .submit-btn {
        width: 100%;
        background: var(--forest, #10b981);
        color: #fff;
        border: none;
        padding: 10px 16px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .submit-btn:hover:not(:disabled) {
        opacity: 0.92;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
      }

      .submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .success-alert {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        padding: 10px 12px;
        border-radius: 8px;
        margin-bottom: 14px;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.4;
      }

      .error-msg {
        color: #ef4444;
        font-size: 12px;
        margin-top: 8px;
      }

      .login-prompt {
        padding: 16px;
        background: var(--surface, #f9fafb);
        border-radius: 8px;
        font-size: 13px;
        color: var(--ink-soft, #6b7280);
        text-align: center;
      }

      .login-link {
        color: var(--forest, #10b981);
        font-weight: 600;
        text-decoration: underline;
      }

      .guide-section {
        margin-bottom: 60px;
        scroll-margin-top: 100px;
      }
      .guide-section h2 {
        font-family: var(--display);
        font-size: 28px;
        color: var(--forest-deep, #064e3b);
        margin-bottom: 14px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--forest-tint, #ecfdf5);
      }
      .guide-section > p {
        font-size: 15px;
        color: var(--ink-soft);
        margin-bottom: 28px;
        line-height: 1.6;
      }

      .step {
        margin-bottom: 36px;
        background: var(--surface);
        padding: 24px;
        border-radius: var(--radius-l);
        border: 1px solid var(--border-soft);
      }
      .step h3 {
        font-size: 18px;
        margin-bottom: 10px;
        color: var(--ink);
      }
      .step p {
        font-size: 14px;
        color: var(--ink-soft);
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .screenshot-wrapper {
        position: relative;
        width: 100%;
        background: var(--paper-warm);
        border: 2px dashed var(--border);
        border-radius: 12px;
        overflow: hidden;
        min-height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .screenshot-wrapper img {
        width: 100%;
        height: auto;
        display: block;
        position: relative;
        z-index: 2;
      }

      .placeholder-text {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: monospace;
        color: var(--ink-soft);
        background: var(--paper-warm);
        z-index: 1;
        padding: 20px;
        text-align: center;
        font-size: 12px;
      }
      
      @media (max-width: 992px) {
        .content-container {
          flex-direction: column-reverse;
          gap: 32px;
        }
        .sidebar-feedback {
          width: 100%;
          position: static;
        }
        .guide-content {
          max-width: 100%;
        }
      }
    `
  ],
})
export class CommunityComponent {
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
        this.feedbackContent = '';
        this.successMessage = 'Thanks for your feedback. Your feedback can make us improve.';
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

  onImgError(event: any) {
    event.target.style.opacity = '0';
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

