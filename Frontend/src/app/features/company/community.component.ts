import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-layout">
      <!-- Header -->
      <div class="header wrap">
        <h1>Mozhibu <span class="accent">Knowledge Base</span></h1>
        <p>Complete User Guide & Documentation</p>
      </div>

      <div class="toc wrap">
        <button (click)="scrollTo('getting-started')" class="toc-link">1. Getting Started</button>
        <button (click)="scrollTo('reader-guide')" class="toc-link">2. Reader Guide</button>
        <button (click)="scrollTo('author-studio')" class="toc-link">3. Author Studio</button>
        <button (click)="scrollTo('account-settings')" class="toc-link">4. Account Settings</button>
      </div>

      <!-- Guide Content -->
      <div class="guide-content wrap">
        
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
        margin-bottom: 40px;
      }
      .header h1 {
        font-family: var(--display);
        font-size: 42px;
        margin-bottom: 16px;
        color: var(--ink);
      }
      .accent {
        color: var(--forest);
      }
      .header p {
        font-size: 18px;
        color: var(--ink-soft);
      }

      .toc {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 64px;
        padding-bottom: 32px;
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
        font-size: 14px;
        transition: all 0.2s;
        cursor: pointer;
        font-family: inherit;
      }
      .toc-link:hover {
        border-color: var(--forest);
        color: var(--forest);
      }

      .guide-content {
        max-width: 800px;
        margin: 0 auto;
      }

      .guide-section {
        margin-bottom: 80px;
        scroll-margin-top: 100px; /* For smooth scrolling offset */
      }
      .guide-section h2 {
        font-family: var(--display);
        font-size: 32px;
        color: var(--forest-deep);
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--forest-tint);
      }
      .guide-section > p {
        font-size: 16px;
        color: var(--ink-soft);
        margin-bottom: 32px;
        line-height: 1.6;
      }

      .step {
        margin-bottom: 48px;
        background: var(--surface);
        padding: 32px;
        border-radius: var(--radius-l);
        border: 1px solid var(--border-soft);
      }
      .step h3 {
        font-size: 20px;
        margin-bottom: 12px;
        color: var(--ink);
      }
      .step p {
        font-size: 15px;
        color: var(--ink-soft);
        line-height: 1.6;
        margin-bottom: 24px;
      }

      .screenshot-wrapper {
        position: relative;
        width: 100%;
        background: var(--paper-warm);
        border: 2px dashed var(--border);
        border-radius: 12px;
        overflow: hidden;
        min-height: 200px;
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

      /* This text shows up behind the image, visible if the image fails to load */
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
        padding: 24px;
        text-align: center;
      }
      
      @media (max-width: 768px) {
        .guide-content {
          padding: 0 20px;
        }
        .step {
          padding: 20px;
        }
      }
    `
  ],
})
export class CommunityComponent {
  onImgError(event: any) {
    // Hide the broken image icon so the placeholder text underneath is visible
    event.target.style.opacity = '0';
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

