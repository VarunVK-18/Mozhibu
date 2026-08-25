import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-layout">
      <div class="contact-container wrap">
        <!-- Info Side -->
        <div class="contact-info">
          <h1>Get in Touch</h1>
          <p class="subtitle">Have a question, feedback, or a partnership inquiry? We'd love to hear from you. Fill out the form or reach us directly via email.</p>
          
          <div class="contact-methods">
            <div class="method">
              <div class="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div>
                <h4>Support</h4>
                <p>support&#64;mozhibu.com</p>
              </div>
            </div>
            <div class="method">
              <div class="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div>
                <h4>Partnerships</h4>
                <p>partners&#64;mozhibu.com</p>
              </div>
            </div>
            <div class="method">
              <div class="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div>
                <h4>Press & Media</h4>
                <p>press&#64;mozhibu.com</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Side -->
        <div class="contact-form-wrapper">
          <form class="contact-form" (submit)="onSubmit($event)">
            <h2>Send a Message</h2>
            
            <div class="form-group">
              <label>Name</label>
              <input type="text" placeholder="John Doe" required>
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input type="email" placeholder="john&#64;example.com" required>
            </div>
            
            <div class="form-group">
              <label>Subject</label>
              <select required>
                <option value="">Select a topic</option>
                <option value="support">General Support</option>
                <option value="author">Author Inquiry</option>
                <option value="billing">Billing Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Message</label>
              <textarea rows="5" placeholder="How can we help you?" required></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary submit-btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-layout {
      min-height: calc(100vh - 73px);
      background: var(--paper-warm);
      padding: 80px 0;
      display: flex;
      align-items: center;
    }
    .contact-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: center;
      background: var(--card);
      border-radius: var(--radius-l);
      padding: 64px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.04);
      border: 1px solid var(--border-soft);
    }

    /* Info Side */
    .contact-info h1 {
      font-size: 48px;
      color: var(--ink);
      margin-bottom: 16px;
    }
    .subtitle {
      font-size: 18px;
      color: var(--ink-soft);
      line-height: 1.6;
      margin-bottom: 48px;
    }
    .contact-methods {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .method {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .icon {
      width: 56px;
      height: 56px;
      background: var(--forest-tint);
      color: var(--forest-deep);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .method h4 {
      font-size: 18px;
      margin-bottom: 4px;
    }
    .method p {
      font-size: 15px;
      color: var(--forest);
      font-weight: 500;
      margin: 0;
    }

    /* Form Side */
    .contact-form-wrapper {
      background: var(--paper);
      padding: 48px;
      border-radius: var(--radius-m);
      border: 1px solid var(--border);
    }
    .contact-form h2 {
      font-size: 28px;
      margin-bottom: 32px;
    }
    .form-group {
      margin-bottom: 24px;
    }
    label {
      display: block;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 8px;
      color: var(--ink);
    }
    input, select, textarea {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-s);
      font-family: var(--body);
      font-size: 15px;
      background: var(--paper-warm);
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--forest);
      background: var(--card);
    }
    .submit-btn {
      width: 100%;
      padding: 16px;
      font-size: 16px;
      margin-top: 16px;
    }

    @media (max-width: 900px) {
      .contact-container {
        grid-template-columns: 1fr;
        padding: 32px;
        gap: 48px;
      }
      .contact-form-wrapper {
        padding: 32px;
      }
    }
  `]
})
export class ContactComponent {
  onSubmit(e: Event) {
    e.preventDefault();
    alert('Thank you! Your message has been sent to our support team.');
  }
}
