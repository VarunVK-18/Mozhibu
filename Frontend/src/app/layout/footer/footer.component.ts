import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="logo">
            <img src="assets/logo.png" alt="Mozhibu logo" class="logo-img">Mozhibu
          </div>
          <p class="brand-desc">Stories worth staying up for. Read and publish fiction in 12+ languages with your progress saved across every device.</p>
          <div class="social-links">
            <a href="#" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>
        
        <div class="footer-links-group">
          <div class="footer-col">
            <h3>Company</h3>
            <a routerLink="/about">About Us</a>
            <a routerLink="/careers">Careers</a>
            <a routerLink="/press">Press</a>
            <a routerLink="/blog">Blog</a>
            <a routerLink="/contact">Contact Us</a>
          </div>
          
          <div class="footer-col">
            <h3>Resources</h3>
            <a routerLink="/help">Help Center</a>
            <a routerLink="/guidelines">Community Guidelines</a>
            <a routerLink="/writers">Writer's Portal</a>
            <a routerLink="/competitions">Competitions</a>
          </div>
          
          <div class="footer-col">
            <h3>Legal</h3>
            <a routerLink="/terms">Terms of Service</a>
            <a routerLink="/privacy">Privacy Policy</a>
            <a routerLink="/cookies">Cookie Policy</a>
            <a routerLink="/copyright">Copyright</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2026 Mozhibu Inc. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: #0F172A;
      color: #F8FAFC;
      padding: 64px 32px 32px 32px;
      margin-top: 64px;
    }
    .footer-container {
      max-width: 1240px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      gap: 64px;
      padding-bottom: 48px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .footer-brand {
      max-width: 320px;
    }
    .logo {
      font-family: var(--display);
      font-weight: 700;
      font-size: 24px;
      letter-spacing: 0.01em;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 16px;
    }
    .logo-img {
      width: 36px;
      height: 36px;
      object-fit: contain;
    }
    .brand-desc {
      font-size: 14px;
      color: #94A3B8;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .social-links {
      display: flex;
      gap: 16px;
    }
    .social-links a {
      color: #94A3B8;
      transition: color 0.2s ease;
    }
    .social-links a:hover {
      color: var(--gold);
    }
    .footer-links-group {
      display: flex;
      gap: 80px;
    }
    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .footer-col h3 {
      font-family: var(--display);
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    .footer-col a {
      font-size: 14px;
      color: #94A3B8;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .footer-col a:hover {
      color: #fff;
    }
    .footer-bottom {
      max-width: 1240px;
      margin: 0 auto;
      padding-top: 32px;
      text-align: center;
      font-size: 13px;
      color: #64748B;
    }
    @media (max-width: 900px) {
      .footer-container {
        flex-direction: column;
        gap: 48px;
      }
      .footer-links-group {
        flex-wrap: wrap;
        gap: 48px;
      }
    }
  `]
})
export class FooterComponent {}
