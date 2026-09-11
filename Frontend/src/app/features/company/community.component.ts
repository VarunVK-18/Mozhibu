import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

interface Article {
  id: string;
  category: string;
  title: string;
  desc: string;
  image?: string;
  tag: string;
  time: string;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="hc-layout">
      <!-- Left Sidebar -->
      <aside class="hc-sidebar">
        <div class="hc-header">
          <div class="hc-logo-placeholder">
            <span class="logo-box">M</span> Mozhibu
          </div>
          <h1>Search for a question</h1>
          <p>Type your question or search keyword</p>
          <div class="hc-search-box">
            <input 
              type="text" 
              placeholder="Start typing..." 
              [(ngModel)]="searchQuery" 
              (input)="filterContent()" 
            />
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        
        <nav class="hc-nav">
          <button class="hc-nav-link" [class.active]="activeTab === 'getting-started'" (click)="setTab('getting-started')">
            Getting started
            <span class="chevron" *ngIf="activeTab === 'getting-started'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </button>
          <button class="hc-nav-link" [class.active]="activeTab === 'reader-guide'" (click)="setTab('reader-guide')">
            Reader Guide
            <span class="chevron" *ngIf="activeTab === 'reader-guide'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </button>
          <button class="hc-nav-link" [class.active]="activeTab === 'author-studio'" (click)="setTab('author-studio')">
            Author Studio
            <span class="chevron" *ngIf="activeTab === 'author-studio'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </button>
          <button class="hc-nav-link" [class.active]="activeTab === 'account-settings'" (click)="setTab('account-settings')">
            Account Settings
            <span class="chevron" *ngIf="activeTab === 'account-settings'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </button>
        </nav>
        
        <div class="hc-feedback-box">
          <div class="feedback-bg-pattern">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,100 C20,80 50,20 100,50 L100,100 Z" fill="rgba(255,255,255,0.05)"/>
              <path d="M0,100 C30,90 60,40 100,70 L100,100 Z" fill="rgba(255,255,255,0.05)"/>
            </svg>
          </div>
          <h3>Do you still need our help?</h3>
          <p>Send your feedback</p>
          <button class="hc-feedback-btn" (click)="toggleFeedbackForm()">
            {{ showFeedbackForm ? 'Close Feedback' : 'Feedback' }}
          </button>
          
          <!-- Feedback Form -->
          <div class="hc-feedback-form-wrapper" [class.show]="showFeedbackForm">
            @if (successMessage) {
              <div class="success-alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                {{ successMessage }}
              </div>
            }

            @if (auth.user()) {
              <form (submit)="submitFeedback($event)">
                <textarea
                  name="content"
                  [(ngModel)]="feedbackContent"
                  rows="3"
                  placeholder="Describe your feedback or issue..."
                  required
                ></textarea>

                <div class="form-actions">
                  <button type="submit" class="submit-btn" [disabled]="submitting || !feedbackContent.trim()">
                    @if (submitting) {
                      Submitting...
                    } @else {
                      Submit
                    }
                  </button>
                </div>
                @if (errorMessage) {
                  <div class="error-msg">{{ errorMessage }}</div>
                }
              </form>
            } @else {
              <div class="login-prompt">
                Please <a routerLink="/login" class="login-link">log in</a> to give feedback.
              </div>
            }
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="hc-main">
        <div class="hc-article-list">
          @if (filteredArticles.length === 0) {
            <div class="no-results">
              <p>No articles found matching "{{ searchQuery }}"</p>
            </div>
          }
          
          @for (article of filteredArticles; track article.id) {
            <div class="hc-ticket-card">
              <div class="hc-ticket-header">
                <div class="hc-ticket-id">
                  <span class="icon-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </span>
                </div>
                <div class="hc-ticket-time">
                  {{ article.time }}
                  <span class="more-dots">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="19" cy="12" r="1"></circle>
                      <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                  </span>
                </div>
              </div>
              <h2 class="hc-ticket-title">{{ article.title }}</h2>
              <p class="hc-ticket-desc">{{ article.desc }}</p>
              
              <div class="hc-ticket-media" *ngIf="article.image">
                <img [src]="article.image" alt="{{ article.title }}" (error)="onImgError($event)" />
              </div>

              <div class="hc-ticket-footer">
                <div class="hc-ticket-author">
                  <div class="hc-avatar">
                    <img src="assets/images/logo.png" alt="Mozhibu Team" (error)="onAvatarError($event)" />
                  </div>
                  <span>Mozhibu Team</span>
                </div>
                <div class="hc-ticket-meta">
                  <div class="hc-ticket-tags">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    <span>{{ article.tag }}</span>
                  </div>
                  <div class="hc-ticket-stats">
                    <span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      {{ (article.id.charCodeAt(0) * 11) % 100 + 10 }}
                    </span>
                    <span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                      </svg>
                      {{ (article.id.charCodeAt(3) * 7) % 50 + 2 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .hc-layout {
        display: flex;
        min-height: calc(100vh - 73px);
        background: var(--paper-warm);
        font-family: var(--body);
      }
      
      /* Sidebar */
      .hc-sidebar {
        width: 320px;
        background: #ffffff;
        border-right: 1px solid var(--border-soft);
        padding: 40px 24px 32px;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        position: sticky;
        top: 73px;
        height: calc(100vh - 73px);
        overflow-y: auto;
        overflow-x: hidden;
      }
      
      .hc-header {
        margin-bottom: 32px;
      }
      
      .hc-logo-placeholder {
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: var(--display);
        font-weight: 700;
        font-size: 16px;
        color: var(--ink);
        margin-bottom: 40px;
      }
      
      .logo-box {
        background: var(--forest);
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }
      
      .hc-header h1 {
        font-family: var(--display);
        font-size: 24px;
        color: var(--ink);
        margin-bottom: 6px;
      }
      
      .hc-header p {
        font-size: 13px;
        color: var(--ink-soft);
        margin-bottom: 20px;
      }
      
      .hc-search-box {
        position: relative;
        width: 100%;
      }
      
      .hc-search-box input {
        width: 100%;
        padding: 12px 16px 12px 40px;
        border: 1px solid var(--border);
        border-radius: var(--radius-m);
        background: var(--surface);
        font-size: 13px;
        color: var(--ink);
        transition: all 0.2s;
        font-family: var(--body);
        box-shadow: 0 2px 5px rgba(0,0,0,0.02) inset;
      }
      
      .hc-search-box input:focus {
        outline: none;
        border-color: var(--forest);
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
      
      .search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        color: var(--ink-faint);
      }
      
      /* Navigation */
      .hc-nav {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 16px;
      }
      
      .hc-nav-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border: none;
        background: transparent;
        color: var(--ink-soft);
        font-size: 14px;
        font-weight: 500;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        font-family: var(--body);
      }
      
      .hc-nav-link:hover {
        background: var(--paper-warm);
        color: var(--ink);
      }
      
      .hc-nav-link.active {
        background: var(--forest-tint);
        color: var(--forest-deep);
        font-weight: 600;
      }
      
      .chevron {
        color: var(--forest);
        display: flex;
      }
      
      /* Feedback Box */
      .hc-feedback-box {
        margin-top: 24px;
        flex-shrink: 0;
        background: linear-gradient(135deg, var(--forest), var(--forest-deep));
        border-radius: 16px;
        padding: 24px;
        color: white;
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.25);
      }
      
      .feedback-bg-pattern {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
      }
      
      .hc-feedback-box h3, .hc-feedback-box p, .hc-feedback-box button, .hc-feedback-form-wrapper {
        position: relative;
        z-index: 1;
      }
      
      .hc-feedback-box h3 {
        font-family: var(--display);
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 6px;
      }
      
      .hc-feedback-box p {
        font-size: 13px;
        opacity: 1;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 20px;
      }
      
      .hc-feedback-btn {
        width: 100%;
        background: white;
        color: #065f46;
        border: none;
        padding: 12px 16px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        font-family: var(--display);
      }
      
      .hc-feedback-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .hc-feedback-form-wrapper {
        display: none;
        margin-top: 16px;
        animation: fadeIn 0.3s ease forwards;
      }
      
      .hc-feedback-form-wrapper.show {
        display: block;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .hc-feedback-form-wrapper textarea {
        width: 100%;
        padding: 10px;
        border-radius: 8px;
        border: none;
        background: rgba(255, 255, 255, 0.95);
        color: var(--ink);
        font-size: 12px;
        font-family: var(--body);
        resize: vertical;
        min-height: 80px;
        margin-bottom: 10px;
      }
      
      .hc-feedback-form-wrapper textarea:focus {
        outline: none;
        background: white;
        box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
      }
      
      .hc-feedback-form-wrapper .submit-btn {
        width: 100%;
        background: rgba(0,0,0,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 8px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .hc-feedback-form-wrapper .submit-btn:hover:not(:disabled) {
        background: rgba(0,0,0,0.3);
      }
      
      .hc-feedback-form-wrapper .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .success-alert {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,255,255,0.2);
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 12px;
        margin-bottom: 10px;
      }
      
      .error-msg {
        color: #ffcccc;
        font-size: 11px;
        margin-top: 6px;
      }
      
      .login-prompt {
        font-size: 12px;
        background: rgba(0,0,0,0.15);
        padding: 10px;
        border-radius: 8px;
      }
      
      .login-link {
        color: white;
        font-weight: 600;
        text-decoration: underline;
      }
      
      /* Main Content */
      .hc-main {
        flex: 1;
        padding: 40px;
        overflow-y: auto;
        background: var(--paper-warm);
      }
      
      .hc-main-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
        border-bottom: 1px solid var(--border);
        padding-bottom: 16px;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .hc-tabs {
        display: flex;
        gap: 20px;
      }
      
      .hc-tab {
        background: none;
        border: none;
        color: var(--ink-soft);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        padding-bottom: 6px;
        position: relative;
        font-family: var(--body);
      }
      
      .hc-tab.active {
        color: var(--forest);
        font-weight: 600;
      }
      
      .hc-tab.active::after {
        content: '';
        position: absolute;
        bottom: -17px;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--forest);
        border-radius: 2px 2px 0 0;
      }
      
      .hc-actions {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      
      .hc-sort {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 600;
        color: var(--ink-soft);
        background: white;
        padding: 6px 12px;
        border-radius: 100px;
        border: 1px solid var(--border-soft);
        cursor: pointer;
      }
      
      .hc-view-options {
        display: flex;
        gap: 6px;
      }
      
      .view-btn {
        background: white;
        border: 1px solid var(--border-soft);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ink-soft);
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .view-btn.active {
        background: var(--forest);
        color: white;
        border-color: var(--forest);
      }
      
      /* Tickets / Articles */
      .hc-article-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 800px;
      }
      
      .hc-ticket-card {
        background: white;
        border-radius: var(--radius-m);
        padding: 24px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        border: 1px solid rgba(0,0,0,0.02);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .hc-ticket-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.06);
      }
      
      .hc-ticket-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      
      .hc-ticket-id {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--ink);
      }
      
      .icon-box {
        background: var(--forest-tint);
        color: var(--forest);
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .hc-ticket-time {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;
        color: var(--ink-faint);
        font-weight: 500;
      }
      
      .more-dots {
        color: var(--ink-soft);
        cursor: pointer;
      }
      
      .hc-ticket-title {
        font-family: var(--display);
        font-size: 20px;
        color: var(--ink);
        margin-bottom: 12px;
        line-height: 1.3;
      }
      
      .hc-ticket-desc {
        font-size: 14px;
        color: var(--ink-soft);
        line-height: 1.6;
        margin-bottom: 24px;
      }
      
      .hc-ticket-media {
        margin-bottom: 24px;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--border-soft);
        background: var(--paper-warm);
        display: flex;
        justify-content: center;
      }
      
      .hc-ticket-media img {
        max-width: 100%;
        height: auto;
        max-height: 300px;
        object-fit: contain;
      }
      
      .hc-ticket-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px dashed var(--border-soft);
      }
      
      .hc-ticket-author {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        font-weight: 600;
        color: var(--ink);
      }
      
      .hc-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--forest-tint);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        color: var(--forest);
        font-weight: bold;
      }
      
      .hc-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .hc-ticket-meta {
        display: flex;
        align-items: center;
        gap: 24px;
      }
      
      .hc-ticket-tags {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--ink-soft);
        background: var(--paper-warm);
        padding: 4px 10px;
        border-radius: 100px;
      }
      
      .hc-ticket-stats {
        display: flex;
        align-items: center;
        gap: 16px;
        color: var(--ink-faint);
        font-size: 12px;
        font-weight: 500;
      }
      
      .hc-ticket-stats span {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .no-results {
        padding: 40px;
        text-align: center;
        color: var(--ink-soft);
        background: white;
        border-radius: var(--radius-m);
        border: 1px dashed var(--border);
      }
      
      @media (max-width: 992px) {
        .hc-layout {
          flex-direction: column;
        }
        .hc-sidebar {
          width: 100%;
          border-right: none;
          border-bottom: 1px solid var(--border-soft);
          padding: 24px;
        }
        .hc-main {
          padding: 24px;
        }
      }
    `
  ],
})
export class CommunityComponent implements OnInit {
  public auth = inject(AuthService);
  private api = inject(ApiService);

  feedbackContent = '';
  submitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  
  showFeedbackForm = false;
  
  searchQuery = '';
  activeTab = 'getting-started';
  
  allArticles: Article[] = [
    { id: '2020-3451', category: 'getting-started', title: 'Signing Up for an Account', desc: 'Click the "Sign Up" button on the top right corner. You can register using your email address to get access to all the features.', image: 'assets/kt/Signuppage.png', tag: 'Help, Account, Registration', time: '10:24AM' },
    { id: '2020-3452', category: 'getting-started', title: 'Logging In securely', desc: 'Once registered, use the login page to access your account securely from any device.', image: 'assets/kt/Loginpage.png', tag: 'Help, Login, Security', time: '11:10AM' },
    { id: '2020-3453', category: 'reader-guide', title: 'Discovering Books and Stories', desc: 'Use the Search bar or browse the Categories page to find your next favorite story. The Home page also shows Trending and Recommended books.', image: 'assets/kt/Homepage.png', tag: 'Guide, Discovery, Reader', time: '02:15PM' },
    { id: '2020-3454', category: 'reader-guide', title: 'Using the Categories Page', desc: 'Browse through different genres to find exactly what you are in the mood to read. Filter by popular genres easily.', image: 'assets/kt/catogerypage.png', tag: 'Help, Categories, Filter', time: '04:30PM' },
    { id: '2020-3455', category: 'reader-guide', title: 'The Reading Interface', desc: 'Click on any book to open the reading interface. You can adjust the font size, theme (dark/light), and navigate between chapters smoothly.', image: 'assets/kt/Chapterpreviewpage.png', tag: 'Design, UI, Reader', time: '09:00AM' },
    { id: '2020-3456', category: 'reader-guide', title: 'Managing Your Library', desc: 'Save books to your library to easily find them later and track your reading progress across all devices.', image: 'assets/kt/Librarypage.png', tag: 'Library, Tools', time: '01:45PM' },
    { id: '2020-3457', category: 'author-studio', title: 'Becoming an Author on Mozhibu', desc: 'Go to your Settings -> Account Settings, and click "Become an Author" to gain access to the studio and start publishing.', image: 'assets/kt/Authorsstudiopage.png', tag: 'Help, Author, Studio', time: '10:00AM' },
    { id: '2020-3458', category: 'author-studio', title: 'Creating a New Book', desc: 'In the Author Studio, click "Create New Story". Fill in the title, description, genre, and upload an attractive book cover.', image: 'assets/kt/Creating a Book.png', tag: 'Publishing, Author', time: '03:20PM' },
    { id: '2020-3459', category: 'author-studio', title: 'Writing and Editing Chapters', desc: 'Use the rich text editor to write your chapters. You can save drafts and publish them whenever they are ready.', image: 'assets/kt/Writing Chapters.png', tag: 'Editor, UI, Author', time: '11:55AM' },
    { id: '2020-3460', category: 'account-settings', title: 'Updating Your Profile Info', desc: 'Change your profile picture, bio, and update your secure password directly from the Settings page.', image: 'assets/kt/Profilepage.png', tag: 'Account, Settings, Security', time: '08:30AM' },
  ];
  
  filteredArticles: Article[] = [];

  ngOnInit() {
    this.filterContent();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.filterContent();
  }
  
  filterContent() {
    let result = this.allArticles;
    
    if (!this.searchQuery.trim()) {
      result = result.filter(a => a.category === this.activeTab);
    } else {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.desc.toLowerCase().includes(q) ||
        a.tag.toLowerCase().includes(q)
      );
    }
    
    this.filteredArticles = result;
  }
  
  toggleFeedbackForm() {
    this.showFeedbackForm = !this.showFeedbackForm;
    if (!this.showFeedbackForm) {
      this.successMessage = null;
      this.errorMessage = null;
    }
  }

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
        this.successMessage = 'Feedback sent successfully.';
        setTimeout(() => {
          this.successMessage = null;
          this.showFeedbackForm = false;
        }, 4000);
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMessage = err.error?.msg || 'Failed to submit feedback.';
      },
    });
  }

  onImgError(event: any) {
    event.target.style.display = 'none';
  }
  
  onAvatarError(event: any) {
    event.target.style.display = 'none';
    event.target.parentElement.innerText = 'M';
  }
}
