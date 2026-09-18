import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-layout">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-content wrap">
          <h1>Terms of Service</h1>
        </div>
        <div class="hero-bg"></div>
      </div>

      <!-- Content -->
      <div class="content-section wrap">
        <div class="policy-container">
          
          <div class="policy-block intro">
            <p>Welcome to Mozhibu. These Terms of Service (“Terms”) govern your access to and use of the Mozhibu website, mozhibu.com, and the services provided through the platform (“Services”).</p>
            <p>By accessing, registering with, or using our website or Services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use the website or Services.</p>
          </div>

          <div class="policy-block">
            <h2>1. About Mozhibu</h2>
            <p>Mozhibu provides online services and assistance relating to business, registration, compliance, documentation, intellectual property, and other services made available through the platform.</p>
            <p>The specific Services available to you may vary depending on the service selected, applicable requirements, and information provided by you.</p>
          </div>

          <div class="policy-block">
            <h2>2. User Account and Registration</h2>
            <p>To access certain Services, you may be required to create an account.</p>
            <p>You agree to:</p>
            <ul class="styled-list">
              <li>Provide accurate, complete, and up-to-date information.</li>
              <li>Keep your login credentials confidential.</li>
              <li>Not share your account credentials with unauthorized persons.</li>
              <li>Notify Mozhibu if you suspect unauthorized access to your account.</li>
              <li>Be responsible for activities performed through your account.</li>
            </ul>
            <p class="highlight-box warning">
              Mozhibu reserves the right to suspend or restrict an account where there is reasonable evidence of misuse, unauthorized access, fraudulent activity, or violation of these Terms.
            </p>
          </div>

          <div class="policy-block">
            <h2>3. Information and Documents Provided by Users</h2>
            <p>Certain Services may require you to provide personal, business, financial, identification, or other supporting information and documents.</p>
            <p>You represent that:</p>
            <ul class="styled-list">
              <li>The information you provide is accurate and complete to the best of your knowledge.</li>
              <li>Documents submitted by you belong to you or you are authorized to submit them.</li>
              <li>You have the necessary authority to provide information relating to another individual or business where applicable.</li>
              <li>You will promptly notify Mozhibu if any submitted information becomes inaccurate or outdated.</li>
            </ul>
            <p>Mozhibu may rely on the information and documents provided by you when processing your requested Services.</p>
            <p>Delays or issues resulting from incomplete, inaccurate, outdated, or incorrect information provided by the User may affect service processing.</p>
          </div>

          <div class="policy-block">
            <h2>4. Service Requests and Processing</h2>
            <p>When you request a Service through Mozhibu, you may be required to provide relevant information, documents, approvals, and payments.</p>
            <p>Mozhibu will make reasonable efforts to process your request based on the information and documents provided. However, certain Services may depend on:</p>
            <div class="tags-container">
              <span class="tag">Government departments</span>
              <span class="tag">Third-party service providers</span>
              <span class="tag">Verification procedures</span>
              <span class="tag">Availability of required documents</span>
              <span class="tag">Applicable laws and regulations</span>
              <span class="tag">External processing times</span>
            </div>
            <p>Therefore, Mozhibu does not guarantee a specific approval, registration outcome, government processing time, or result where the final decision is made by an external authority.</p>
          </div>

          <div class="policy-block">
            <h2>5. Fees and Payments</h2>
            <p>Applicable fees will be communicated to the User before or during the relevant Service process.</p>
            <p>You agree to provide accurate payment information and complete applicable payments required for the requested Service.</p>
            <p>Where payments are processed through third-party payment providers, their respective terms and policies may also apply.</p>
            <p>Government fees, statutory fees, professional charges, third-party charges, or other applicable expenses may be separate from Mozhibu's service fees where specifically stated.</p>
          </div>

          <div class="policy-block">
            <h2>6. Cancellations and Refunds</h2>
            <p>Cancellation and refund eligibility may depend on the nature and stage of the Service requested.</p>
            <p>Where a refund is applicable, it will be processed according to the applicable refund terms communicated for that Service.</p>
            <p>Services that have already been initiated, processed, submitted, or completed may not be eligible for a full refund where work or third-party expenses have already been incurred.</p>
            <p>Any applicable refund will generally be processed using the original payment method, subject to the payment provider's processing procedures.</p>
          </div>

          <div class="policy-block">
            <h2>7. User Responsibilities</h2>
            <p>While using Mozhibu, you agree not to:</p>
            <ul class="styled-list">
              <li>Use the website for unlawful or unauthorized purposes.</li>
              <li>Submit false, misleading, fraudulent, or unauthorized information.</li>
              <li>Upload malicious files, software, or harmful content.</li>
              <li>Attempt to gain unauthorized access to the website, accounts, servers, or databases.</li>
              <li>Interfere with or disrupt the operation or security of the Services.</li>
              <li>Use another person's account without authorization.</li>
              <li>Copy, reproduce, modify, distribute, or commercially exploit website content without permission.</li>
              <li>Use automated systems to access or collect information from the website in a manner that is not authorized by Mozhibu.</li>
            </ul>
            <p>Mozhibu may take appropriate action where a User violates these requirements.</p>
          </div>

          <div class="policy-block">
            <h2>8. Third-Party Services and Links</h2>
            <p>Mozhibu may use or integrate third-party services to support functionality such as payments, communications, hosting, analytics, authentication, or other Services.</p>
            <p>The availability and operation of third-party services may be subject to their own terms, conditions, and privacy policies.</p>
            <p>Mozhibu is not responsible for the independent policies, availability, or actions of third-party service providers.</p>
          </div>

          <div class="policy-block">
            <h2>9. Intellectual Property</h2>
            <p>All website content, including but not limited to:</p>
            <div class="tags-container">
              <span class="tag">Text</span>
              <span class="tag">Logos</span>
              <span class="tag">Branding</span>
              <span class="tag">Graphics</span>
              <span class="tag">Designs</span>
              <span class="tag">Software</span>
              <span class="tag">Website layout</span>
              <span class="tag">Images</span>
              <span class="tag">Documentation</span>
            </div>
            <p>is owned by or licensed to Mozhibu, unless otherwise stated.</p>
            <p>You may use the website and its content only for legitimate purposes connected with your use of the Services.</p>
            <p>You may not reproduce, modify, distribute, sell, publish, reverse engineer, or commercially exploit Mozhibu's intellectual property without prior written permission.</p>
          </div>

          <div class="policy-block">
            <h2>10. Privacy</h2>
            <p>Your use of Mozhibu is also subject to our Privacy Policy, which explains how we collect, use, store, and protect User Information.</p>
            <p>By using our Services, you acknowledge that you have read and understood the Privacy Policy.</p>
          </div>

          <div class="policy-block">
            <h2>11. Service Availability</h2>
            <p>Mozhibu aims to keep its website and Services available and functioning properly. However, uninterrupted availability cannot be guaranteed.</p>
            <p>The website or particular Services may occasionally be unavailable due to:</p>
            <ul class="styled-list">
              <li>Maintenance.</li>
              <li>Technical issues.</li>
              <li>Server or network problems.</li>
              <li>Security incidents.</li>
              <li>Third-party service interruptions.</li>
              <li>Government or regulatory system downtime.</li>
              <li>Circumstances beyond our reasonable control.</li>
            </ul>
          </div>

          <div class="policy-block">
            <h2>12. Disclaimer</h2>
            <p>Information provided through the Mozhibu website is intended to assist Users in accessing and using our Services.</p>
            <p>Unless expressly stated otherwise, information provided on the website should not be considered a substitute for professional legal, financial, tax, or other specialized advice.</p>
            <p>Where a Service involves government or regulatory approval, the final decision may be made by the relevant authority and is outside Mozhibu's control.</p>
            <p>Mozhibu does not guarantee that every Service request will result in approval, registration, certification, or a particular outcome.</p>
          </div>

          <div class="policy-block">
            <h2>13. Limitation of Liability</h2>
            <p>To the extent permitted by applicable law, Mozhibu will not be responsible for losses or delays arising from circumstances beyond its reasonable control, including third-party service interruptions, government processing delays, regulatory decisions, inaccurate information supplied by Users, or unauthorized use of User accounts.</p>
            <p>Nothing in these Terms is intended to exclude or limit any liability that cannot legally be excluded or limited under applicable law.</p>
          </div>

          <div class="policy-block">
            <h2>14. Suspension or Termination</h2>
            <p>Mozhibu may suspend or terminate access to a User account or particular Services where:</p>
            <ul class="styled-list">
              <li>The User violates these Terms.</li>
              <li>The User provides fraudulent or unauthorized information.</li>
              <li>The account is used for unlawful activity.</li>
              <li>The User attempts to compromise the security of the platform.</li>
              <li>Such action is necessary to comply with applicable law or regulatory requirements.</li>
            </ul>
            <p>Users may contact Mozhibu regarding account-related termination or access concerns.</p>
          </div>

          <div class="policy-block">
            <h2>15. Changes to the Services</h2>
            <p>Mozhibu may modify, update, add, or discontinue features or Services from time to time.</p>
            <p>Changes may be made to improve functionality, security, comply with legal requirements, or reflect changes in our business operations.</p>
          </div>

          <div class="policy-block">
            <h2>16. Changes to These Terms</h2>
            <p>Mozhibu may update these Terms of Service from time to time.</p>
            <p>When changes are made, the updated version will be published on this page.</p>
            <p>Your continued use of the website after the updated Terms are published constitutes acceptance of the revised Terms, to the extent permitted by applicable law.</p>
          </div>

          <div class="policy-block">
            <h2>17. Governing Law</h2>
            <p>These Terms shall be governed by and interpreted in accordance with the applicable laws of India.</p>
            <p>Any disputes arising in connection with these Terms or the Services shall be subject to the jurisdiction of the courts having appropriate jurisdiction, subject to applicable law.</p>
          </div>

          <div class="policy-block contact-block">
            <h2>18. Contact Us</h2>
            <p>If you have questions, concerns, or requests regarding these Terms of Service, please contact us:</p>
            
            <div class="contact-details">
              <div><strong>Company:</strong> Mozhibu</div>
              <div><strong>Email:</strong> <a href="mailto:contactmozhibu&#64;gmail.com">contactmozhibu&#64;gmail.com</a></div>
              <div><strong>Website:</strong> <a href="https://mozhibu.com">mozhibu.com</a></div>
            </div>
          </div>
          
          <div class="important-notice">
            <div class="icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            </div>
            <div>
              <strong>Important Notice</strong>
              <p>For Mozhibu, the Terms of Service and Privacy Policy are kept as two separate pages. Because the platform can involve business registrations, compliance services, payments, and sensitive documents, have the final legal wording reviewed by an Indian lawyer before publishing it as the company's binding term.</p>
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
      
      /* Important Notice */
      .important-notice {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        padding: 24px;
        border-radius: 12px;
        margin-top: 64px;
      }
      .important-notice .icon {
        color: #64748b;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .important-notice strong {
        display: block;
        color: #334155;
        margin-bottom: 8px;
        font-size: 16px;
      }
      .important-notice p {
        margin: 0;
        color: #64748b;
        font-size: 14px;
        line-height: 1.6;
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
    `
  ]
})
export class TermsOfServiceComponent {}
