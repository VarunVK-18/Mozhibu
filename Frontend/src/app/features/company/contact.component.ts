import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-layout">
      <div class="contact-wrapper wrap">
        
        <!-- Header -->
        <div class="contact-header">
          <span class="overline">CONTACT US</span>
          <h1>Get in touch with us</h1>
          <p class="subtitle">
            Fill out the form below or schedule a meeting with us at your convenience.
          </p>
        </div>

        <div class="contact-grid">
          <!-- Left Column (Form) -->
          <div class="contact-form-side">
            <form class="contact-form" [formGroup]="contactForm" (ngSubmit)="onSubmit()">
              
              <div class="form-group">
                <label>NAME</label>
                <input type="text" formControlName="name" placeholder="Your name" />
              </div>

              <div class="form-group">
                <label>EMAIL</label>
                <input type="email" formControlName="email" placeholder="Enter Your Email" />
              </div>

              <div class="form-group">
                <label>MESSAGE</label>
                <textarea
                  rows="3"
                  formControlName="message"
                  placeholder="Enter Your Message"
                ></textarea>
              </div>

              <div class="terms-group">
                <label class="checkbox-container">
                  <input type="checkbox" formControlName="agreeTerms" />
                  <span class="checkmark"></span>
                  <span class="terms-text">I agree with <a href="/terms" target="_blank">Terms and Conditions</a></span>
                </label>
              </div>

              <button type="submit" class="btn submit-btn" [disabled]="contactForm.invalid || isSubmitting()">
                {{ isSubmitting() ? 'Sending...' : 'Send Your Request' }}
              </button>
              
              <div *ngIf="successMsg()" class="success-msg">{{ successMsg() }}</div>
              <div *ngIf="errorMsg()" class="error-msg">{{ errorMsg() }}</div>
            </form>
          </div>

          <!-- Right Column (Info) -->
          <div class="contact-info-side">
            <div class="contact-direct">
              <p class="direct-title">You can also Contact Us via</p>
              <div class="direct-methods">
                <div class="method-chip">
                  <div class="chip-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <span>{{ contactEmail() }}</span>
                </div>
                <div class="method-chip">
                  <div class="chip-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <span>{{ contactPhone() }}</span>
                </div>
              </div>
            </div>

            <h3 class="services-title">With our services you can</h3>
            
            <ul class="benefits-list">
              <li>
                <div class="check-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Improve usability of your product</span>
              </li>
              <li>
                <div class="check-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Engage users at a higher level and outperform your competition</span>
              </li>
              <li>
                <div class="check-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Reduce the onboarding time and improve sales</span>
              </li>
              <li>
                <div class="check-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Balance user needs with your business goal</span>
              </li>
            </ul>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-layout {
        background: var(--paper);
        padding: 64px 0 120px 0;
      }
      .contact-wrapper {
        max-width: 1000px;
        margin: 0 auto;
      }

      /* Header */
      .contact-header {
        text-align: center;
        margin-bottom: 72px;
      }
      .overline {
        font-family: var(--display);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--ink);
        display: block;
        margin-bottom: 16px;
      }
      .contact-header h1 {
        font-size: 42px;
        color: var(--ink);
        margin-bottom: 16px;
        font-weight: 700;
      }
      .subtitle {
        font-size: 16px;
        color: var(--ink-soft);
        max-width: 480px;
        margin: 0 auto;
        line-height: 1.6;
      }

      /* Grid Layout */
      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 80px;
      }

      /* Left Side - Form */
      .contact-form {
        margin-bottom: 48px;
      }
      .form-group {
        margin-bottom: 24px;
      }
      .form-group label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.05em;
        color: var(--ink-soft);
        margin-bottom: 8px;
        text-transform: uppercase;
      }
      input[type="text"],
      input[type="email"],
      textarea {
        width: 100%;
        padding: 14px 16px;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--paper-warm);
        font-size: 15px;
        font-family: var(--body);
        color: var(--ink);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      input:focus,
      textarea:focus {
        outline: none;
        border-color: var(--gold);
        background: var(--paper);
        box-shadow: 0 0 0 3px rgba(185, 139, 50, 0.1);
      }
      
      /* Checkbox Styles */
      .terms-group {
        margin: 32px 0;
      }
      .checkbox-container {
        display: flex;
        align-items: center;
        position: relative;
        cursor: pointer;
        user-select: none;
      }
      .checkbox-container input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      }
      .checkmark {
        height: 18px;
        width: 18px;
        background-color: var(--paper-warm);
        border: 1px solid var(--border);
        border-radius: 4px;
        display: inline-block;
        margin-right: 12px;
        position: relative;
        transition: all 0.2s;
      }
      .checkbox-container:hover input ~ .checkmark {
        border-color: var(--gold);
      }
      .checkbox-container input:checked ~ .checkmark {
        background-color: var(--ink);
        border-color: var(--ink);
      }
      .checkmark:after {
        content: "";
        position: absolute;
        display: none;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
      .checkbox-container input:checked ~ .checkmark:after {
        display: block;
      }
      .terms-text {
        font-size: 13.5px;
        color: var(--ink-soft);
      }
      .terms-text a {
        color: var(--ink);
        text-decoration: underline;
        font-weight: 500;
      }

      /* Submit Button */
      .submit-btn {
        width: 100%;
        background: var(--ink);
        color: var(--paper);
        padding: 16px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 15px;
        border: none;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .submit-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .success-msg {
        color: #03543f;
        background: #def7ec;
        padding: 12px;
        border-radius: 6px;
        margin-top: 16px;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
      }
      .error-msg {
        color: #9b1c1c;
        background: #fde8e8;
        padding: 12px;
        border-radius: 6px;
        margin-top: 16px;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
      }

      /* Direct Methods */
      .contact-direct {
        margin-bottom: 48px;
      }
      .direct-title {
        font-weight: 700;
        font-size: 16px;
        color: var(--ink);
        margin-bottom: 24px;
      }
      .direct-methods {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .method-chip {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .chip-icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: 1.5px solid #EBE4D5;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ink);
        background: transparent;
      }
      .method-chip span {
        font-size: 16px;
        font-weight: 500;
        color: var(--ink);
      }

      /* Right Side - Info */
      .services-title {
        font-size: 18px;
        color: var(--ink);
        margin-bottom: 24px;
        font-weight: 700;
      }
      .benefits-list {
        list-style: none;
        padding: 0;
        margin: 0 0 48px 0;
      }
      .benefits-list li {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 20px;
        font-size: 14px;
        color: var(--ink-soft);
        line-height: 1.5;
      }
      .check-icon {
        color: var(--ink);
        flex-shrink: 0;
        margin-top: 1px;
      }

      @media (max-width: 900px) {
        .contact-grid {
          grid-template-columns: 1fr;
          gap: 64px;
        }
        .page-layout {
          padding: 40px 24px 80px 24px;
        }
      }
    
      /* Universal Mobile Fixes injected automatically */
      @media (max-width: 768px) {
        .hero { padding: 40px 16px !important; }
        .hero h1 { font-size: 28px !important; line-height: 1.2 !important; }
        .hero p { font-size: 16px !important; }
        
        .content-section, .wrap { padding: 24px 16px !important; }
        
        .policy-block h2, .section h2 { font-size: 22px !important; margin-top: 24px !important; margin-bottom: 16px !important; }
        .policy-block h3, .section h3 { font-size: 18px !important; }
        
        p, li, .right-item, .contact-details div { font-size: 15px !important; line-height: 1.6 !important; }
        
        .partner-grid, .rights-grid, .values-grid, .features-grid, .grid { 
          grid-template-columns: 1fr !important; 
          gap: 16px !important; 
        }
        
        .icon, .feature-icon, .value-icon {
          width: 40px !important;
          height: 40px !important;
        }
        .icon svg, .feature-icon svg, .value-icon svg {
          width: 20px !important;
          height: 20px !important;
        }
        
        .partner-card, .value-card, .feature-card {
          padding: 20px !important;
        }
        
        .table-row {
          flex-direction: column !important;
        }
        .col-type, .col-desc {
          width: 100% !important;
          padding: 12px !important;
        }
        .col-type {
          border-right: none !important;
          border-bottom: 1px dashed var(--border-soft) !important;
          background: var(--paper-warm) !important;
        }
      }
`,
  ],
})
export class ContactComponent implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  contactForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
    agreeTerms: [false, Validators.requiredTrue]
  });

  isSubmitting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Signals that hold the dynamically fetched data
  contactEmail = signal('contact.growthux@gmail.com');
  contactPhone = signal('+91 7648999213');

  ngOnInit() {
    this.apiService.get<any>('/settings').subscribe({
      next: (settings: any) => {
        if (settings?.contactEmail) this.contactEmail.set(settings.contactEmail);
        if (settings?.contactPhone) this.contactPhone.set(settings.contactPhone);
      },
      error: (err: any) => console.error('Failed to load contact settings:', err)
    });

    const user = this.authService.user();
    if (user) {
      this.contactForm.patchValue({
        name: user.legalName || user.username || '',
        email: user.email || ''
      });
    }
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    const { name, email, message } = this.contactForm.value;
    const user = this.authService.user();
    const payload: any = { name, email, message };
    
    if (user && user.id) {
      payload.userId = user.id;
    }

    this.apiService.post<any>('/contact', payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMsg.set('Thank you! Your message has been sent successfully.');
        this.contactForm.reset();
        
        // Repopulate user info after reset
        if (user) {
          this.contactForm.patchValue({
            name: user.legalName || user.username || '',
            email: user.email || ''
          });
        }
        setTimeout(() => {
          this.successMsg.set('');
        }, 5000);
      },
      error: (err) => {
        console.error('Failed to submit form', err);
        this.isSubmitting.set(false);
        this.errorMsg.set('Failed to send message. Please try again.');
      }
    });
  }
}
