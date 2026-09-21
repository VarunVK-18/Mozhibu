import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-layout">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-content wrap">
          <h1>Cookie Policy</h1>
        </div>
        <div class="hero-bg"></div>
      </div>

      <!-- Content -->
      <div class="content-section wrap">
        <div class="policy-container">
          
          <div class="policy-block intro">
            <p>This Cookie Policy explains how Mozhibu (“Mozhibu,” “we,” “us,” or “our”) uses cookies and similar technologies when you visit or use our website at mozhibu.com (“Website”).</p>
            <p>By continuing to use our Website, you acknowledge that cookies and similar technologies may be used as described in this Cookie Policy. Where required by applicable law, we will obtain your consent before placing non-essential cookies on your device.</p>
          </div>

          <div class="policy-block">
            <h2>1. What Are Cookies?</h2>
            <p>Cookies are small text files that are stored on your computer, mobile phone, tablet, or other device when you visit a website.</p>
            <p>Cookies help websites remember information about your visit, improve functionality, understand how visitors use the website, and provide a better user experience.</p>
            <p>Cookies may be:</p>
            <ul class="styled-list">
              <li><strong>Session cookies:</strong> Deleted when you close your browser.</li>
              <li><strong>Persistent cookies:</strong> Remain on your device for a specified period or until you delete them.</li>
              <li><strong>First-party cookies:</strong> Set directly by Mozhibu.</li>
              <li><strong>Third-party cookies:</strong> Set by third-party services that may operate on or through our Website.</li>
            </ul>
          </div>

          <div class="policy-block">
            <h2>2. Why We Use Cookies</h2>
            <p>Mozhibu may use cookies and similar technologies for the following purposes:</p>
            
            <h3>2.1 Essential Cookies</h3>
            <p>These cookies may be necessary for the Website to function properly. They can support features such as:</p>
            <div class="tags-container">
              <span class="tag">User authentication</span>
              <span class="tag">Security</span>
              <span class="tag">Fraud prevention</span>
              <span class="tag">Maintaining user sessions</span>
              <span class="tag">Technical settings</span>
            </div>
            <p class="highlight-box warning">Because these cookies may be necessary for the operation and security of the Website, disabling them may affect certain features.</p>

            <h3>2.2 Preference Cookies</h3>
            <p>Preference cookies may allow the Website to remember choices you make, such as certain settings or preferences, so that you do not have to enter them repeatedly.</p>

            <h3>2.3 Analytics Cookies</h3>
            <p>Where analytics services are enabled on our Website, cookies may be used to help us understand how visitors interact with the Website, including information such as:</p>
            <ul class="styled-list">
              <li>Pages visited</li>
              <li>Time spent on pages</li>
              <li>General navigation patterns</li>
              <li>Browser and device information</li>
              <li>Website performance</li>
            </ul>
            <p>Analytics information helps us improve the Website and identify technical or usability issues.</p>

            <h3>2.4 Functional Cookies</h3>
            <p>Functional cookies may be used to support additional Website features and improve your experience. These cookies may remember certain preferences or settings that you have selected.</p>

            <h3>2.5 Marketing or Advertising Cookies</h3>
            <p>If Mozhibu uses advertising or marketing technologies in the future, these technologies may use cookies or similar identifiers to measure advertising performance or provide more relevant promotional content.</p>
            <p>Any such technologies will be used in accordance with applicable laws and, where required, with your consent.</p>
          </div>

          <div class="policy-block">
            <h2>3. Information Collected Through Cookies</h2>
            <p>Depending on the type of cookie or technology being used, information collected may include:</p>
            <div class="grid-list">
              <div class="grid-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                <span>IP address or approximate location</span>
              </div>
              <div class="grid-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                <span>Browser type and version</span>
              </div>
              <div class="grid-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                <span>Device type</span>
              </div>
              <div class="grid-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Operating system</span>
              </div>
              <div class="grid-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span>Website pages visited</span>
              </div>
              <div class="grid-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>Date and time of visits</span>
              </div>
              <div class="grid-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <span>Referring website</span>
              </div>
              <div class="grid-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Cookie identifiers</span>
              </div>
            </div>
            <p>Cookies generally do not directly identify you by name. However, information collected through cookies may be associated with other information where permitted by law and necessary for the purposes described in our Privacy Policy.</p>
          </div>

          <div class="policy-block">
            <h2>4. Third-Party Cookies</h2>
            <p>Some features or services available through our Website may be provided by third parties. These third parties may use cookies or similar technologies in accordance with their own privacy and cookie policies.</p>
            <p>Third-party services may include, where applicable:</p>
            <ul class="styled-list">
              <li>Analytics providers</li>
              <li>Authentication providers</li>
              <li>Security and fraud-prevention services</li>
              <li>Embedded content providers</li>
              <li>Payment or service providers</li>
              <li>Advertising or marketing providers</li>
            </ul>
            <p>Mozhibu does not control the cookies or privacy practices of independent third parties. We recommend reviewing the relevant third party's privacy and cookie policies when using services provided by them.</p>
          </div>

          <div class="policy-block">
            <h2>5. How Long Do Cookies Remain on Your Device?</h2>
            <p>The length of time cookies remain on your device depends on their type and purpose.</p>
            <ul class="styled-list">
              <li><strong>Session cookies</strong> are normally removed when you close your browser.</li>
              <li><strong>Persistent cookies</strong> may remain on your device for a specified period or until you manually delete them.</li>
            </ul>
            <p>The retention period may vary depending on the specific technology and its purpose.</p>
          </div>

          <div class="policy-block">
            <h2>6. Managing and Disabling Cookies</h2>
            <p>You can control or manage cookies through your browser settings.</p>
            <p>Most browsers allow you to:</p>
            <ul class="styled-list">
              <li>View cookies stored on your device</li>
              <li>Delete existing cookies</li>
              <li>Block cookies</li>
              <li>Allow cookies only from certain websites</li>
              <li>Receive notifications before cookies are stored</li>
            </ul>
            <p class="highlight-box warning">However, disabling or blocking certain cookies may affect the functionality, security, or availability of some features of the Website.</p>
            <p>You can also manage cookie preferences through any cookie-consent or preference-management tool made available by Mozhibu on the Website.</p>
          </div>

          <div class="policy-block">
            <h2>7. Cookie Consent</h2>
            <p>Where required by applicable law, Mozhibu will request your consent before using non-essential cookies or similar technologies.</p>
            <p>You may withdraw or change your cookie preferences where the Website provides an applicable consent-management mechanism.</p>
            <p>Withdrawal of consent does not necessarily affect the lawfulness of processing that occurred before the withdrawal.</p>
          </div>

          <div class="policy-block">
            <h2>8. Do Not Track Signals</h2>
            <p>Some web browsers provide a “Do Not Track” or similar feature. Because there is currently no universally accepted technical standard for responding to such signals, our Website may not respond to all browser-based Do Not Track settings.</p>
            <p>Where applicable law requires us to recognize a particular privacy preference signal, we will take reasonable steps to comply with the applicable requirements.</p>
          </div>

          <div class="policy-block">
            <h2>9. Cookies and Personal Information</h2>
            <p>Cookies may sometimes be associated with information that can be considered personal information under applicable laws.</p>
            <p>Mozhibu handles personal information in accordance with our Privacy Policy and applicable data-protection laws.</p>
            <p>Our Privacy Policy explains in greater detail how we collect, use, store, protect, and disclose personal information.</p>
          </div>

          <div class="policy-block">
            <h2>10. Security</h2>
            <p>We take reasonable technical and organizational measures to protect information processed through our Website.</p>
            <p class="highlight-box warning">However, no internet transmission, website, electronic storage system, or security measure can be guaranteed to be completely secure.</p>
          </div>

          <div class="policy-block">
            <h2>11. Children's Privacy</h2>
            <p>Our Website is not intended to knowingly collect personal information from children in violation of applicable laws.</p>
            <p>If you believe that a child has provided personal information to us without appropriate authorization, please contact us so that we can review and take appropriate action.</p>
          </div>

          <div class="policy-block">
            <h2>12. Changes to This Cookie Policy</h2>
            <p>We may update this Cookie Policy from time to time to reflect changes in our Website, cookies and technologies we use, legal or regulatory requirements, our business practices, or privacy and security practices.</p>
            <p>We encourage you to review this Cookie Policy periodically to stay informed about how cookies and similar technologies are used.</p>
          </div>

          <div class="policy-block contact-block">
            <h2>13. Contact Us</h2>
            <p>If you have questions, concerns, or requests regarding this Cookie Policy or the use of cookies on our Website, you can contact us at:</p>
            
            <div class="contact-details">
              <div><strong>Company:</strong> Mozhibu</div>
              <div><strong>Email:</strong> <a href="mailto:contactmozhibu&#64;gmail.com">contactmozhibu&#64;gmail.com</a></div>
              <div><strong>Website:</strong> <a href="https://mozhibu.com">mozhibu.com</a></div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: var(--paper);
        color: var(--ink);
      }
      
      .page-layout {
        padding-top: 80px;
      }
      
      /* Hero Section */
      .hero {
        position: relative;
        padding: 80px 24px;
        background: var(--ink);
        color: var(--paper);
        text-align: center;
        overflow: hidden;
      }
      .hero-content {
        position: relative;
        z-index: 2;
        max-width: 800px;
        margin: 0 auto;
      }
      .hero h1 {
        font-family: var(--display);
        font-size: 48px;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.02em;
        line-height: 1.1;
      }
      .hero-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          circle at top right,
          var(--forest-deep),
          transparent 60%
        );
        opacity: 0.3;
        z-index: 1;
      }
      
      /* Content */
      .content-section {
        padding: 60px 24px;
        background: var(--paper);
      }
      .policy-container {
        max-width: 800px;
        margin: 0 auto;
      }
      .policy-block {
        margin-bottom: 48px;
      }
      .policy-block.intro {
        font-size: 18px;
        line-height: 1.6;
      }
      .policy-block h2 {
        font-family: var(--display);
        font-size: 28px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 24px;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--border-soft);
      }
      .policy-block h3 {
        font-family: var(--display);
        font-size: 20px;
        font-weight: 600;
        color: var(--ink);
        margin: 32px 0 16px 0;
      }
      .policy-block p {
        font-size: 16px;
        line-height: 1.7;
        color: var(--ink-soft);
        margin-bottom: 16px;
      }
      
      /* Lists */
      .styled-list {
        list-style: none;
        padding: 0;
        margin: 0 0 24px 0;
      }
      .styled-list li {
        position: relative;
        padding-left: 28px;
        margin-bottom: 12px;
        font-size: 16px;
        line-height: 1.6;
        color: var(--ink-soft);
      }
      .styled-list li::before {
        content: "→";
        position: absolute;
        left: 0;
        top: 0;
        color: var(--forest);
        font-weight: bold;
      }
      
      /* Tags */
      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin: 24px 0;
      }
      .tag {
        background: var(--paper-warm);
        color: var(--ink);
        padding: 8px 16px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 500;
        border: 1px solid var(--border-soft);
      }
      
      /* Grid List */
      .grid-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin: 24px 0;
      }
      .grid-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--paper-warm);
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        color: var(--ink-soft);
        font-size: 15px;
      }
      .grid-item svg {
        color: var(--forest);
        flex-shrink: 0;
      }
      
      /* Highlight boxes */
      .highlight-box {
        background: var(--forest-tint);
        border-left: 4px solid var(--forest);
        padding: 16px 20px;
        border-radius: 0 8px 8px 0;
        color: var(--forest-deep) !important;
        font-weight: 500;
        margin: 24px 0 !important;
      }
      .highlight-box.warning {
        background: #fffbeb;
        border-left-color: #f59e0b;
        color: #b45309 !important;
      }
      
      /* Contact block */
      .contact-block {
        background: var(--paper-warm);
        padding: 32px;
        border-radius: 16px;
        border: 1px solid var(--border-soft);
      }
      .contact-block h2 {
        border: none;
        padding: 0;
      }
      .contact-details {
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .contact-details div {
        font-size: 16px;
        color: var(--ink-soft);
      }
      .contact-details strong {
        color: var(--ink);
        display: inline-block;
        width: 100px;
      }
      .contact-details a {
        color: var(--forest);
        text-decoration: none;
        font-weight: 500;
      }
      .contact-details a:hover {
        text-decoration: underline;
      }
      
      @media (max-width: 768px) {
        .hero {
          padding: 60px 16px;
        }
        .hero h1 {
          font-size: 36px;
        }
        .content-section {
          padding: 40px 16px;
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
`
  ]
})
export class CookiePolicyComponent {}
