import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SubscriptionService, SubscriptionPlan, CouponValidation } from '../../core/services/subscription.service';
import { AuthService } from '../../core/services/auth.service';

declare var Razorpay: any;

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="plans-page">
      <!-- Hero Banner -->
      <div class="hero">
        <div class="wrap">
          <div class="crown-badge" style="display:inline-flex;align-items:center;gap:4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.25C10.4812 2.25 9.25 3.48122 9.25 5C9.25 5.78328 9.57756 6.48937 10.1018 6.98967C10.0375 7.10378 9.97102 7.22294 9.90223 7.34628L8.10504 10.5686C7.92732 10.8873 7.82158 11.0749 7.7325 11.2018C7.70459 11.2415 7.68483 11.2655 7.67287 11.2788L7.67118 11.2791C7.65596 11.2695 7.63012 11.2518 7.5918 11.2208C7.47104 11.1231 7.31753 10.9715 7.05879 10.7138L6.97976 10.635C6.6607 10.317 6.37058 10.0279 6.10664 9.79144C6.19926 9.54508 6.25 9.27824 6.25 9C6.25 7.75736 5.24264 6.75 4 6.75C2.75736 6.75 1.75 7.75736 1.75 9C1.75 9.98302 2.3804 10.8188 3.25898 11.1251C3.26199 11.1822 3.26564 11.2399 3.26976 11.298C3.29277 11.6228 3.33458 12.0116 3.38243 12.4564L3.5671 14.1733C3.59705 14.4517 3.62574 14.7289 3.65412 15.0031C3.76616 16.0856 3.87332 17.121 4.03322 17.994C4.1343 18.5459 4.26178 19.0659 4.43833 19.5172C4.61339 19.9648 4.8549 20.3925 5.21187 20.712C5.84173 21.2758 6.60137 21.522 7.50819 21.6381C8.38307 21.75 9.48625 21.75 10.8602 21.75H13.1398C14.5137 21.75 15.6169 21.75 16.4918 21.6381C17.3986 21.522 18.1583 21.2758 18.7881 20.712C19.1451 20.3925 19.3866 19.9648 19.5617 19.5172C19.7382 19.0659 19.8657 18.5459 19.9668 17.994C20.1267 17.1211 20.2338 16.0858 20.3459 15.0034C20.3742 14.7293 20.403 14.4516 20.4329 14.1733L20.6176 12.4565C20.6654 12.0116 20.7072 11.6228 20.7302 11.298C20.7344 11.2399 20.738 11.1822 20.741 11.1251C21.6196 10.8188 22.25 9.98302 22.25 9C22.25 7.75736 21.2426 6.75 20 6.75C18.7574 6.75 17.75 7.75736 17.75 9C17.75 9.27824 17.8007 9.54509 17.8934 9.79145C17.6294 10.0279 17.3393 10.317 17.0202 10.635L16.9412 10.7138C16.6825 10.9715 16.529 11.1231 16.4082 11.2208C16.3699 11.2518 16.344 11.2695 16.3288 11.2791L16.3271 11.2788C16.3152 11.2655 16.2954 11.2415 16.2675 11.2018C16.1784 11.0749 16.0727 10.8873 15.895 10.5686L14.0977 7.34619C14.0289 7.22288 13.9625 7.10375 13.8982 6.98967C14.4224 6.48937 14.75 5.78328 14.75 5C14.75 3.48122 13.5188 2.25 12 2.25ZM10.75 5C10.75 4.30964 11.3096 3.75 12 3.75C12.6904 3.75 13.25 4.30964 13.25 5C13.25 5.48504 12.9739 5.90689 12.5668 6.11457C12.3975 6.20095 12.2056 6.25 12 6.25C11.7944 6.25 11.6025 6.20095 11.4332 6.11457C11.0261 5.90689 10.75 5.48504 10.75 5ZM11.2046 8.09072C11.2857 7.94528 11.3599 7.81229 11.4288 7.69043C11.6133 7.72949 11.8045 7.75 12 7.75C12.1955 7.75 12.3867 7.72949 12.5712 7.69043C12.6401 7.81229 12.7143 7.94528 12.7954 8.09071L14.6016 11.3291C14.7569 11.6077 14.9005 11.8653 15.0399 12.0638C15.1885 12.2753 15.3911 12.5089 15.7015 12.6456C15.9698 12.7637 16.2657 12.8049 16.556 12.7648C16.8918 12.7184 17.1507 12.5495 17.3517 12.3869C17.5403 12.2343 17.7493 12.026 17.9756 11.8006L17.9998 11.7765C18.3752 11.4026 18.6497 11.1315 18.8593 10.9397C18.9792 11.0103 19.1061 11.0701 19.2389 11.1179C19.2374 11.1417 19.2358 11.1664 19.234 11.192C19.2131 11.4865 19.1743 11.8486 19.1249 12.3082L18.9415 14.0129C18.9095 14.3104 18.8794 14.6003 18.8502 14.8822C18.7807 15.553 18.7159 16.178 18.641 16.75H5.35903C5.28409 16.178 5.2193 15.553 5.14978 14.8822C5.12056 14.6003 5.0905 14.3104 5.0585 14.0129L4.87514 12.3082C4.82571 11.8486 4.78687 11.4865 4.76601 11.192C4.7642 11.1664 4.76255 11.1417 4.76107 11.1179C4.89386 11.0701 5.02084 11.0103 5.14066 10.9397C5.35033 11.1315 5.62484 11.4026 6.0002 11.7765L6.02438 11.8006C6.25065 12.026 6.45971 12.2343 6.64834 12.3869C6.84933 12.5495 7.10824 12.7184 7.44397 12.7648C7.73429 12.8049 8.03016 12.7637 8.29846 12.6456C8.60887 12.5089 8.81155 12.2753 8.96009 12.0638C9.09945 11.8653 9.24306 11.6078 9.39842 11.3291L11.2046 8.09072ZM5.61801 18.25C5.68337 18.526 5.75521 18.7662 5.83525 18.9708C5.96405 19.3 6.0962 19.4904 6.21228 19.5943C6.52851 19.8774 6.9509 20.0545 7.69857 20.1502C8.46719 20.2486 9.47421 20.25 10.9121 20.25H13.0879C14.5258 20.25 15.5328 20.2486 16.3014 20.1502C17.0491 20.0545 17.4715 19.8774 17.7877 19.5943C17.9038 19.4904 18.036 19.3 18.1647 18.9708C18.2448 18.7662 18.3166 18.526 18.382 18.25H5.61801ZM3.25 9C3.25 8.58579 3.58579 8.25 4 8.25C4.41421 8.25 4.75 8.58579 4.75 9C4.75 9.18789 4.68188 9.35799 4.56799 9.48982C4.4311 9.64827 4.23192 9.74737 4.00904 9.74995L4 9.75C3.58579 9.75 3.25 9.41421 3.25 9ZM19.25 9C19.25 8.58579 19.5858 8.25 20 8.25C20.4142 8.25 20.75 8.58579 20.75 9C20.75 9.41421 20.4142 9.75 20 9.75L19.991 9.74995C19.7681 9.74737 19.5689 9.64827 19.432 9.48982C19.3181 9.35799 19.25 9.18789 19.25 9Z" /></svg>
            Mozhibu Premium
          </div>
          <h1>Unlock Every Story</h1>
          <p>Access thousands of premium chapters, support your favourite authors, and earn rewards as you read.</p>
        </div>
      </div>

      <!-- Current Plan Banner -->
      @if (currentSub()?.active) {
        <div class="current-plan-banner wrap">
          <div class="current-plan-info">
            <span class="badge-active">✓ Active</span>
            <span>You're on <strong>{{ currentSub()?.subscription?.plan?.name }}</strong> — {{ currentSub()?.subscription?.daysRemaining }} days remaining</span>
          </div>
          <a routerLink="/subscription/me" class="btn-outline-sm">Manage Plan →</a>
        </div>
      }

      <!-- Plans Grid -->
      <div class="wrap plans-section">
        <h2 class="section-title">Choose Your Plan</h2>

        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading plans...</p>
          </div>
        } @else {
          <!-- Mobile Tabs -->
          <div class="mobile-tabs">
            @for (plan of plans(); track plan._id) {
              <button class="mobile-tab" [class.active]="selectedPlan()?._id === plan._id" (click)="selectPlan(plan)">
                {{ plan.name }}
              </button>
            }
          </div>

          <div class="plans-grid">
            @for (plan of plans(); track plan._id; let i = $index) {
              <div class="plan-card" [class.featured]="i === 1" [class.selected]="selectedPlan()?._id === plan._id" (click)="selectPlan(plan)">
                @if (i === 1) {
                  <div class="popular-badge">Most Popular</div>
                }
                <div class="plan-header">
                  <h3 class="plan-name">{{ plan.name }}</h3>
                  <div class="plan-price">
                    @if (appliedCoupon() && selectedPlan()?._id === plan._id) {
                      <span class="price-original">{{ plan.priceDisplay }}</span>
                      <span class="price-final">₹{{ (appliedCoupon()!.finalPriceInPaise / 100).toFixed(2) }}</span>
                    } @else {
                      <span class="price-main">{{ plan.priceDisplay }}</span>
                    }
                    <span class="price-period">/ {{ plan.durationDays }} days</span>
                  </div>
                  <p class="plan-desc">{{ plan.description }}</p>
                </div>
                <ul class="benefits-list">
                  @for (benefit of plan.marketingBenefits; track benefit) {
                    <li><span class="check">✓</span> {{ benefit }}</li>
                  }
                </ul>
                <button class="btn-select" [class.active]="selectedPlan()?._id === plan._id">
                  {{ selectedPlan()?._id === plan._id ? '✓ Selected' : 'Select Plan' }}
                </button>
              </div>
            }
          </div>

          <!-- Coupon Code -->
          @if (selectedPlan()) {
            <div class="coupon-section">
              <div class="coupon-input-row">
                <input 
                  [(ngModel)]="couponCode" 
                  placeholder="Have a coupon code? Enter here"
                  class="coupon-input"
                  [disabled]="!!appliedCoupon()"
                />
                @if (!appliedCoupon()) {
                  <button class="btn-apply" (click)="validateCoupon()" [disabled]="!couponCode.trim() || couponLoading()">
                    {{ couponLoading() ? '...' : 'Apply' }}
                  </button>
                } @else {
                  <button class="btn-remove" (click)="removeCoupon()">Remove</button>
                }
              </div>
              @if (couponError()) {
                <p class="coupon-error">{{ couponError() }}</p>
              }
              @if (appliedCoupon()) {
                <div class="coupon-success">
                  🎉 Coupon applied! You save {{ appliedCoupon()!.savingsDisplay }}
                </div>
              }
            </div>

            <!-- Order Summary -->
            <div class="order-summary">
              <div class="summary-row">
                <span>Plan</span>
                <span>{{ selectedPlan()!.name }}</span>
              </div>
              <div class="summary-row">
                <span>Duration</span>
                <span>{{ selectedPlan()!.durationDays }} days</span>
              </div>
              @if (appliedCoupon()) {
                <div class="summary-row discount">
                  <span>Discount</span>
                  <span>- {{ appliedCoupon()!.savingsDisplay }}</span>
                </div>
              }
              <div class="summary-row total">
                <span>Total</span>
                <span>{{ finalPrice() }}</span>
              </div>
              <button class="btn-checkout" (click)="checkout()" [disabled]="checkoutLoading()">
                @if (checkoutLoading()) {
                  <span class="spinner-sm"></span> Processing...
                } @else {
                  Pay {{ finalPrice() }} with Razorpay
                }
              </button>
              <p class="secure-note">🔒 Secured by Razorpay. 256-bit SSL encryption.</p>
            </div>
          }
        }
      </div>

      <!-- Features Comparison -->
      <div class="comparison-section wrap">
        <h2 class="section-title">Why Go Premium?</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            </div>
            <h4>Unlimited Access</h4>
            <p>Read all premium chapters without restrictions</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
            </div>
            <h4>Earn Rewards</h4>
            <p>Get rewarded every month for your reading engagement</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </div>
            <h4>Support Authors</h4>
            <p>Your subscription directly funds the authors you love</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <h4>Offline & Multi-Language</h4>
            <p>Read in your language, on any device, anytime</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plans-page {
      min-height: 100vh;
      background: #ffffff;
      color: #111827;
      font-family: 'Inter', system-ui, sans-serif;
      padding-bottom: 80px;
    }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
      padding: 72px 0 64px;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
    }
    .crown-badge {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      color: white;
      padding: 6px 20px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 20px;
    }
    .hero h1 {
      font-size: clamp(32px, 5vw, 52px);
      font-weight: 800;
      background: linear-gradient(135deg, #111827 0%, #4f46e5 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 16px;
    }
    .hero p { font-size: 18px; color: #4b5563; max-width: 560px; margin: 0 auto; }

    /* Current plan banner */
    .current-plan-banner {
      display: flex; align-items: center; justify-content: space-between;
      background: #f0fdf4; border: 1px solid #bbf7d0;
      border-radius: 12px; padding: 16px 24px;
      margin: 24px auto; gap: 16px;
    }
    .current-plan-info { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #166534; }
    .badge-active {
      background: #d1fae5; color: #065f46;
      padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 700;
    }
    .btn-outline-sm {
      background: transparent; border: 1px solid #059669; color: #059669;
      padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
      cursor: pointer; text-decoration: none; transition: background 0.2s;
    }
    .btn-outline-sm:hover { background: rgba(5,150,105,0.1); }

    /* Plans */
    .plans-section { padding-top: 48px; }
    .section-title {
      font-size: 28px; font-weight: 700; color: #111827;
      margin-bottom: 32px; text-align: center;
    }
    .mobile-tabs {
      display: none;
      background: #f1f5f9; border-radius: 12px; padding: 4px;
      margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto;
    }
    .mobile-tab {
      flex: 1; padding: 10px; border: none; background: transparent;
      border-radius: 8px; font-size: 14px; font-weight: 600;
      color: #64748b; cursor: pointer; transition: all 0.2s;
    }
    .mobile-tab.active {
      background: #ffffff; color: #111827;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px; margin-bottom: 40px;
    }
    .plan-card {
      background: #ffffff; border: 2px solid #e5e7eb;
      border-radius: 20px; padding: 32px 28px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);
      cursor: pointer; position: relative;
      transition: all 0.2s;
    }
    .plan-card:hover { border-color: #6366f1; transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .plan-card.featured {
      background: linear-gradient(135deg, #f8fafc, #ffffff);
      border-color: #6366f1;
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.1);
    }
    .plan-card.selected { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.2); }
    .popular-badge {
      position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white; padding: 5px 18px; border-radius: 100px;
      font-size: 12px; font-weight: 700; white-space: nowrap;
    }
    .plan-name { font-size: 20px; font-weight: 700; margin: 0 0 12px; color: #111827; }
    .plan-price { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .price-main { font-size: 36px; font-weight: 800; color: #111827; }
    .price-original { font-size: 22px; color: #9ca3af; text-decoration: line-through; }
    .price-final { font-size: 36px; font-weight: 800; color: #059669; }
    .price-period { font-size: 14px; color: #6b7280; }
    .plan-desc { font-size: 14px; color: #4b5563; margin: 0 0 20px; }
    .benefits-list { list-style: none; padding: 0; margin: 0 0 24px; }
    .benefits-list li { display: flex; gap: 10px; font-size: 14px; color: #4b5563; padding: 6px 0; }
    .check { color: #6366f1; font-weight: 700; }
    .btn-select {
      width: 100%; padding: 12px;
      background: #f9fafb; border: 1px solid #d1d5db;
      color: #4b5563; border-radius: 10px; font-size: 14px;
      font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn-select.active, .btn-select:hover { background: #6366f1; border-color: #6366f1; color: white; }

    /* Coupon */
    .coupon-section { max-width: 600px; margin: 0 auto 32px; }
    .coupon-input-row { display: flex; gap: 12px; }
    .coupon-input {
      flex: 1; padding: 12px 16px;
      background: #ffffff; border: 1px solid #d1d5db;
      border-radius: 10px; color: #111827; font-size: 14px;
      outline: none; transition: border 0.2s;
    }
    .coupon-input:focus { border-color: #6366f1; }
    .btn-apply, .btn-remove {
      padding: 12px 20px; border-radius: 10px; font-size: 14px;
      font-weight: 600; cursor: pointer; border: none;
    }
    .btn-apply { background: #6366f1; color: white; }
    .btn-apply:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-remove { background: #fee2e2; color: #ef4444; }
    .coupon-error { color: #ef4444; font-size: 13px; margin-top: 8px; }
    .coupon-success {
      background: #f0fdf4; border: 1px solid #bbf7d0;
      border-radius: 8px; padding: 10px 16px;
      color: #059669; font-size: 14px; margin-top: 10px;
    }

    /* Order Summary */
    .order-summary {
      max-width: 600px; margin: 0 auto;
      background: #ffffff; border: 1px solid #e5e7eb;
      border-radius: 16px; padding: 28px; box-shadow: 0 10px 20px rgba(0,0,0,0.02);
    }
    .summary-row {
      display: flex; justify-content: space-between;
      padding: 10px 0; border-bottom: 1px solid #e5e7eb;
      font-size: 15px; color: #4b5563;
    }
    .summary-row.discount { color: #059669; }
    .summary-row.total {
      font-size: 18px; font-weight: 700; color: #111827;
      border-bottom: none; padding-top: 16px;
    }
    .btn-checkout {
      width: 100%; padding: 16px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border: none; border-radius: 12px;
      color: white; font-size: 16px; font-weight: 700;
      cursor: pointer; margin-top: 20px;
      transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    .btn-checkout:hover { opacity: 0.9; }
    .btn-checkout:disabled { opacity: 0.6; cursor: not-allowed; }
    .secure-note { text-align: center; font-size: 12px; color: #6b7280; margin-top: 12px; }

    /* Loading */
    .loading-state { text-align: center; padding: 64px; color: #6b7280; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #e5e7eb;
      border-top-color: #6366f1; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 16px;
    }
    .spinner-sm {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Features */
    .comparison-section { padding-top: 64px; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    .feature-item {
      background: #ffffff; border: 1px solid #e5e7eb; box-shadow: 0 4px 15px rgba(0,0,0,0.02);
      border-radius: 16px; padding: 28px 24px; text-align: center;
      transition: border-color 0.2s;
    }
    .feature-item:hover { border-color: #6366f1; }
    .feature-icon { font-size: 36px; margin-bottom: 12px; }
    .feature-item h4 { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 8px; }
    .feature-item p { font-size: 13px; color: #4b5563; margin: 0; line-height: 1.5; }

    @media (max-width: 768px) {
      .hero { padding: 48px 0; }
      .plans-grid { display: block; }
      .plan-card { display: none; margin-bottom: 24px; }
      .plan-card.selected { display: block; }
      .mobile-tabs { display: flex; }
      .current-plan-banner { flex-direction: column; align-items: flex-start; }
      .coupon-input-row { flex-direction: column; }
      .coupon-input-row button { width: 100%; }
      .features-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
      .feature-item { padding: 20px 16px; }
    }
    
    @media (max-width: 480px) {
      .hero h1 { font-size: 28px; }
      .plan-card { padding: 24px 20px; }
      .feature-icon { transform: scale(0.8); margin-bottom: 8px; }
      .feature-item h4 { font-size: 14px; }
      .feature-item p { font-size: 12px; }
    }
  `]
})
export class SubscriptionPlansComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  plans = signal<SubscriptionPlan[]>([]);
  selectedPlan = signal<SubscriptionPlan | null>(null);
  currentSub = signal<any>(null);
  isLoading = signal(true);
  couponCode = '';
  couponLoading = signal(false);
  couponError = signal<string | null>(null);
  appliedCoupon = signal<CouponValidation | null>(null);
  checkoutLoading = signal(false);

  ngOnInit() {
    this.subscriptionService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        // Pre-select a plan (middle one if 3, else first)
        if (plans.length > 0) {
          const defaultPlan = plans.length >= 3 ? plans[1] : plans[0];
          this.selectPlan(defaultPlan);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    if (this.authService.user()) {
      this.subscriptionService.getMySubscription().subscribe({
        next: (sub) => this.currentSub.set(sub),
        error: () => {}
      });
    }
  }

  selectPlan(plan: SubscriptionPlan) {
    this.selectedPlan.set(plan);
    this.appliedCoupon.set(null);
    this.couponCode = '';
    this.couponError.set(null);
  }

  finalPrice(): string {
    const plan = this.selectedPlan();
    if (!plan) return '';
    const coupon = this.appliedCoupon();
    const paise = coupon ? coupon.finalPriceInPaise : plan.priceInPaise;
    return `INR ${(paise / 100).toFixed(2)}`;
  }

  validateCoupon() {
    if (!this.couponCode.trim() || !this.selectedPlan()) return;
    this.couponLoading.set(true);
    this.couponError.set(null);
    this.subscriptionService.validateCoupon(this.couponCode.trim(), this.selectedPlan()!._id).subscribe({
      next: (res) => {
        this.appliedCoupon.set(res);
        this.couponLoading.set(false);
      },
      error: (err) => {
        this.couponError.set(err.error?.msg || 'Invalid coupon');
        this.couponLoading.set(false);
      }
    });
  }

  removeCoupon() {
    this.appliedCoupon.set(null);
    this.couponCode = '';
    this.couponError.set(null);
  }

  checkout() {
    if (!this.authService.user()) {
      this.router.navigate(['/login']);
      return;
    }
    const plan = this.selectedPlan();
    if (!plan) return;
    this.checkoutLoading.set(true);

    this.subscriptionService.createOrder(plan._id, this.appliedCoupon() ? this.couponCode : undefined).subscribe({
      next: (orderData) => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: 'INR',
          name: 'Mozhibu Premium',
          description: `${plan.name} — ${plan.durationDays} days`,
          order_id: orderData.orderId,
          handler: (response: any) => {
            // Verify payment on backend
            this.subscriptionService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              planId: plan._id,
              couponCode: this.appliedCoupon() ? this.couponCode : undefined
            }).subscribe({
              next: () => {
                this.checkoutLoading.set(false);
                this.router.navigate(['/subscription/me']);
              },
              error: (err) => {
                this.checkoutLoading.set(false);
                alert('Payment verification failed: ' + (err.error?.msg || 'Please contact support'));
              }
            });
          },
          prefill: {
            name: this.authService.user()?.username,
            email: this.authService.user()?.email
          },
          theme: { color: '#6366f1' },
          modal: {
            ondismiss: () => this.checkoutLoading.set(false)
          }
        };
        const rzp = new Razorpay(options);
        rzp.open();
      },
      error: (err) => {
        this.checkoutLoading.set(false);
        alert('Failed to create order: ' + (err.error?.msg || 'Server error'));
      }
    });
  }
}
