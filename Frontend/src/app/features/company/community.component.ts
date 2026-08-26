import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-layout">
      <div class="header wrap">
        <h1>Mozhibu <span class="accent">Community</span></h1>
        <p>
          Resources, guidelines, and support to help you get the most out of our
          platform.
        </p>
      </div>

      <div class="resources-grid wrap">
        <div class="resource-card">
          <div class="icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h3>Help Center</h3>
          <p>
            Find answers to common questions about reading, subscriptions, and
            account management.
          </p>
          <button class="btn btn-outline">Visit Help Center</button>
        </div>

        <div class="resource-card">
          <div class="icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 20h9"></path>
              <path
                d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
              ></path>
            </svg>
          </div>
          <h3>Writer's Portal</h3>
          <p>
            Everything you need to know about publishing, monetization, and
            growing your audience.
          </p>
          <button class="btn btn-outline">Go to Portal</button>
        </div>

        <div class="resource-card">
          <div class="icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="8" r="7"></circle>
              <polyline
                points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"
              ></polyline>
            </svg>
          </div>
          <h3>Competitions</h3>
          <p>
            View active writing contests, submission guidelines, and past
            winners.
          </p>
          <button class="btn btn-outline">View Contests</button>
        </div>

        <div class="resource-card">
          <div class="icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h3>Guidelines</h3>
          <p>
            Read our community standards to understand what content is allowed
            on Mozhibu.
          </p>
          <button class="btn btn-outline">Read Guidelines</button>
        </div>
      </div>

      <div class="faq-section wrap">
        <h2>Frequently Asked Questions</h2>

        <div class="faq-list">
          <div class="faq-item">
            <h4>Is Mozhibu free to use?</h4>
            <p>
              Yes! Anyone can create an account and read thousands of free
              stories. We also offer a Premium subscription for exclusive
              content and ad-free reading.
            </p>
          </div>

          <div class="faq-item">
            <h4>How do authors get paid?</h4>
            <p>
              Authors earn revenue through reader subscriptions, direct tips,
              and ad-share on free chapters. We pay out 70% of net revenue
              directly to creators.
            </p>
          </div>

          <div class="faq-item">
            <h4>Can I publish fanfiction?</h4>
            <p>
              While we love fanfiction, Mozhibu is currently dedicated to
              original works only to ensure our authors can safely monetize
              their IP.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-layout {
        min-height: calc(100vh - 73px);
        background: var(--paper);
        padding: 80px 0 120px;
      }
      .header {
        text-align: center;
        margin-bottom: 80px;
      }
      .header h1 {
        font-size: 48px;
        margin-bottom: 16px;
      }
      .accent {
        color: var(--forest);
      }
      .header p {
        font-size: 20px;
        color: var(--ink-soft);
        max-width: 600px;
        margin: 0 auto;
      }

      .resources-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 32px;
        margin-bottom: 100px;
      }
      .resource-card {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-l);
        padding: 48px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: box-shadow 0.2s;
      }
      .resource-card:hover {
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
      }
      .icon {
        margin-bottom: 24px;
        width: 80px;
        height: 80px;
        background: var(--paper-warm);
        color: var(--forest-deep);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .resource-card h3 {
        font-size: 24px;
        margin-bottom: 16px;
      }
      .resource-card p {
        font-size: 16px;
        color: var(--ink-soft);
        margin-bottom: 32px;
        flex: 1;
      }

      .faq-section {
        background: var(--paper-warm);
        padding: 64px;
        border-radius: var(--radius-l);
      }
      .faq-section h2 {
        font-size: 32px;
        margin-bottom: 48px;
        text-align: center;
      }
      .faq-list {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 32px;
      }
      .faq-item h4 {
        font-size: 20px;
        margin-bottom: 12px;
        color: var(--forest-deep);
      }
      .faq-item p {
        font-size: 16px;
        color: var(--ink-soft);
      }

      @media (max-width: 900px) {
        .resources-grid {
          grid-template-columns: 1fr;
        }
        .faq-section {
          padding: 48px 24px;
        }
      }
    `,
  ],
})
export class CommunityComponent {}
