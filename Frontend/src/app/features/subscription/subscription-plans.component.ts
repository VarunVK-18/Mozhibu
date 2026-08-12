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
          <div class="crown-badge">👑 Mozhibu Premium</div>
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
                  @for (benefit of plan.benefits; track benefit) {
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
            <div class="feature-icon">📚</div>
            <h4>Unlimited Access</h4>
            <p>Read all premium chapters without restrictions</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💰</div>
            <h4>Earn Rewards</h4>
            <p>Get rewarded every month for your reading engagement</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✍️</div>
            <h4>Support Authors</h4>
            <p>Your subscription directly funds the authors you love</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🌐</div>
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
      background: #0d0d0d;
      color: #f5f0e8;
      font-family: 'Inter', system-ui, sans-serif;
      padding-bottom: 80px;
    }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      padding: 72px 0 64px;
      text-align: center;
      border-bottom: 1px solid #2a2a3e;
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
      background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 16px;
    }
    .hero p { font-size: 18px; color: #a0a8b8; max-width: 560px; margin: 0 auto; }

    /* Current plan banner */
    .current-plan-banner {
      display: flex; align-items: center; justify-content: space-between;
      background: #1a2a1a; border: 1px solid #2d5a27;
      border-radius: 12px; padding: 16px 24px;
      margin: 24px auto; gap: 16px;
    }
    .current-plan-info { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #c8e6c9; }
    .badge-active {
      background: #2d5a27; color: #69f0ae;
      padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 700;
    }
    .btn-outline-sm {
      background: transparent; border: 1px solid #4caf50; color: #4caf50;
      padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
      cursor: pointer; text-decoration: none; transition: background 0.2s;
    }
    .btn-outline-sm:hover { background: rgba(76,175,80,0.15); }

    /* Plans */
    .plans-section { padding-top: 48px; }
    .section-title {
      font-size: 28px; font-weight: 700; color: #f5f0e8;
      margin-bottom: 32px; text-align: center;
    }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px; margin-bottom: 40px;
    }
    .plan-card {
      background: #1a1a2a; border: 2px solid #2a2a3e;
      border-radius: 20px; padding: 32px 28px;
      cursor: pointer; position: relative;
      transition: all 0.2s;
    }
    .plan-card:hover { border-color: #6366f1; transform: translateY(-2px); }
    .plan-card.featured {
      background: linear-gradient(135deg, #1e1b4b, #1a1a2e);
      border-color: #6366f1;
      box-shadow: 0 0 40px rgba(99, 102, 241, 0.2);
    }
    .plan-card.selected { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.3); }
    .popular-badge {
      position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white; padding: 5px 18px; border-radius: 100px;
      font-size: 12px; font-weight: 700; white-space: nowrap;
    }
    .plan-name { font-size: 20px; font-weight: 700; margin: 0 0 12px; color: #f5f0e8; }
    .plan-price { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .price-main { font-size: 36px; font-weight: 800; color: #f5f0e8; }
    .price-original { font-size: 22px; color: #666; text-decoration: line-through; }
    .price-final { font-size: 36px; font-weight: 800; color: #69f0ae; }
    .price-period { font-size: 14px; color: #6b7280; }
    .plan-desc { font-size: 14px; color: #9ca3af; margin: 0 0 20px; }
    .benefits-list { list-style: none; padding: 0; margin: 0 0 24px; }
    .benefits-list li { display: flex; gap: 10px; font-size: 14px; color: #d1d5db; padding: 6px 0; }
    .check { color: #6366f1; font-weight: 700; }
    .btn-select {
      width: 100%; padding: 12px;
      background: #2a2a3e; border: 1px solid #3a3a5e;
      color: #d1d5db; border-radius: 10px; font-size: 14px;
      font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn-select.active, .btn-select:hover { background: #6366f1; border-color: #6366f1; color: white; }

    /* Coupon */
    .coupon-section { max-width: 600px; margin: 0 auto 32px; }
    .coupon-input-row { display: flex; gap: 12px; }
    .coupon-input {
      flex: 1; padding: 12px 16px;
      background: #1a1a2a; border: 1px solid #3a3a5e;
      border-radius: 10px; color: #f5f0e8; font-size: 14px;
      outline: none; transition: border 0.2s;
    }
    .coupon-input:focus { border-color: #6366f1; }
    .btn-apply, .btn-remove {
      padding: 12px 20px; border-radius: 10px; font-size: 14px;
      font-weight: 600; cursor: pointer; border: none;
    }
    .btn-apply { background: #6366f1; color: white; }
    .btn-apply:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-remove { background: #3a1a1a; color: #f87171; }
    .coupon-error { color: #f87171; font-size: 13px; margin-top: 8px; }
    .coupon-success {
      background: #1a2a1a; border: 1px solid #2d5a27;
      border-radius: 8px; padding: 10px 16px;
      color: #69f0ae; font-size: 14px; margin-top: 10px;
    }

    /* Order Summary */
    .order-summary {
      max-width: 600px; margin: 0 auto;
      background: #1a1a2a; border: 1px solid #2a2a3e;
      border-radius: 16px; padding: 28px;
    }
    .summary-row {
      display: flex; justify-content: space-between;
      padding: 10px 0; border-bottom: 1px solid #2a2a3e;
      font-size: 15px; color: #9ca3af;
    }
    .summary-row.discount { color: #69f0ae; }
    .summary-row.total {
      font-size: 18px; font-weight: 700; color: #f5f0e8;
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
      width: 40px; height: 40px; border: 3px solid #2a2a3e;
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
      background: #1a1a2a; border: 1px solid #2a2a3e;
      border-radius: 16px; padding: 28px 24px; text-align: center;
      transition: border-color 0.2s;
    }
    .feature-item:hover { border-color: #6366f1; }
    .feature-icon { font-size: 36px; margin-bottom: 12px; }
    .feature-item h4 { font-size: 16px; font-weight: 700; color: #f5f0e8; margin: 0 0 8px; }
    .feature-item p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5; }

    @media (max-width: 768px) {
      .hero { padding: 48px 0; }
      .plans-grid { grid-template-columns: 1fr; }
      .current-plan-banner { flex-direction: column; align-items: flex-start; }
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
      next: (plans) => { this.plans.set(plans); this.isLoading.set(false); },
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
