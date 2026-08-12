import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubscriptionService } from '../../core/services/subscription.service';

@Component({
  selector: 'app-subscription-me',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sub-page">
      <div class="wrap">
        <div class="page-header">
          <h1>My Subscription</h1>
          <p>Manage your Mozhibu Premium plan and payment history</p>
        </div>

        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
          </div>
        } @else if (subscription()?.active) {
          <!-- Active Subscription Card -->
          <div class="active-card">
            <div class="active-header">
              <div>
                <div class="active-badge">👑 Premium Active</div>
                <h2>{{ subscription()!.subscription!.plan.name }}</h2>
              </div>
              <div class="days-pill">{{ subscription()!.subscription!.daysRemaining }} days left</div>
            </div>
            <div class="sub-details">
              <div class="detail-row">
                <span class="label">Status</span>
                <span class="value status-active">Active</span>
              </div>
              <div class="detail-row">
                <span class="label">Start Date</span>
                <span class="value">{{ formatDate(subscription()!.subscription!.startDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Renewal Date</span>
                <span class="value">{{ formatDate(subscription()!.subscription!.endDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Auto-Renew</span>
                <span class="value">{{ subscription()!.subscription!.autoRenew ? 'On' : 'Off' }}</span>
              </div>
            </div>
            <div class="action-row">
              <a routerLink="/subscription/plans" class="btn-upgrade">Upgrade Plan</a>
              @if (subscription()!.subscription!.autoRenew) {
                <button class="btn-cancel" (click)="cancelAutoRenew()">Cancel Auto-Renewal</button>
              }
            </div>
          </div>
        } @else {
          <!-- No Subscription -->
          <div class="empty-card">
            <div class="empty-icon">🔓</div>
            <h2>No Active Subscription</h2>
            <p>Unlock all premium stories, support authors, and earn monthly rewards by going Premium.</p>
            <a routerLink="/subscription/plans" class="btn-upgrade">View Plans</a>
          </div>
        }

        <!-- Payment History -->
        <div class="history-section">
          <h3>Payment History</h3>
          @if (history().length === 0) {
            <p class="empty-text">No payment history yet.</p>
          } @else {
            <div class="history-table">
              <div class="table-header">
                <span>Plan</span>
                <span>Amount</span>
                <span>Date</span>
                <span>Status</span>
              </div>
              @for (item of history(); track item._id) {
                <div class="table-row">
                  <span class="plan-name">{{ item.plan?.name || '—' }}</span>
                  <span class="amount">₹{{ (item.amountPaidInPaise / 100).toFixed(2) }}</span>
                  <span class="date">{{ formatDate(item.createdAt) }}</span>
                  <span class="status-badge" [class]="item.status">{{ item.status }}</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sub-page { min-height: 100vh; background: #0d0d0d; color: #f5f0e8; padding-bottom: 80px; }
    .wrap { max-width: 800px; margin: 0 auto; padding: 48px 24px; }
    .page-header { margin-bottom: 40px; }
    .page-header h1 { font-size: 32px; font-weight: 800; margin: 0 0 8px; }
    .page-header p { color: #6b7280; font-size: 15px; margin: 0; }

    .loading-state { display: flex; justify-content: center; padding: 64px; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #2a2a3e;
      border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .active-card {
      background: linear-gradient(135deg, #1e1b4b, #1a1a2e);
      border: 1px solid #6366f1; border-radius: 20px;
      padding: 32px; margin-bottom: 40px;
      box-shadow: 0 0 40px rgba(99,102,241,0.15);
    }
    .active-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; }
    .active-badge {
      background: rgba(99,102,241,0.2); color: #a5b4fc;
      padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 700;
      display: inline-block; margin-bottom: 8px;
    }
    .active-header h2 { font-size: 24px; font-weight: 800; margin: 0; }
    .days-pill {
      background: rgba(99,102,241,0.2); color: #a5b4fc;
      padding: 8px 18px; border-radius: 100px; font-size: 14px; font-weight: 700;
      white-space: nowrap;
    }
    .sub-details { border-top: 1px solid #2a2a3e; border-bottom: 1px solid #2a2a3e; padding: 16px 0; margin-bottom: 24px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .label { color: #6b7280; }
    .value { color: #d1d5db; font-weight: 500; }
    .status-active { color: #69f0ae; }
    .action-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-upgrade {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white; padding: 12px 24px; border-radius: 10px;
      font-weight: 700; font-size: 14px; text-decoration: none; border: none; cursor: pointer;
    }
    .btn-cancel {
      background: transparent; border: 1px solid #5a2a2a; color: #f87171;
      padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer;
    }
    .btn-cancel:hover { background: rgba(248,113,113,0.1); }

    .empty-card {
      background: #1a1a2a; border: 1px dashed #3a3a5e; border-radius: 20px;
      padding: 48px; text-align: center; margin-bottom: 40px;
    }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-card h2 { font-size: 22px; font-weight: 700; margin: 0 0 10px; }
    .empty-card p { color: #6b7280; max-width: 400px; margin: 0 auto 24px; font-size: 15px; }

    .history-section h3 { font-size: 20px; font-weight: 700; margin: 0 0 20px; }
    .empty-text { color: #6b7280; font-size: 14px; }
    .history-table { border: 1px solid #2a2a3e; border-radius: 12px; overflow: hidden; }
    .table-header {
      display: grid; grid-template-columns: 2fr 1fr 1.5fr 1fr;
      padding: 12px 20px; background: #1a1a2a;
      font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase;
    }
    .table-row {
      display: grid; grid-template-columns: 2fr 1fr 1.5fr 1fr;
      padding: 14px 20px; border-top: 1px solid #2a2a3e;
      font-size: 14px; align-items: center;
    }
    .table-row:hover { background: #1a1a2a; }
    .plan-name { color: #d1d5db; font-weight: 500; }
    .amount { color: #f5f0e8; font-weight: 700; }
    .date { color: #9ca3af; }
    .status-badge {
      padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 600;
      text-align: center; width: fit-content;
    }
    .status-badge.active { background: #1a3a1a; color: #69f0ae; }
    .status-badge.expired { background: #2a1a1a; color: #f87171; }
    .status-badge.cancelled { background: #2a1a2a; color: #c084fc; }

    @media (max-width: 600px) {
      .table-header, .table-row { grid-template-columns: 2fr 1fr 1fr; }
      .table-header span:nth-child(3), .table-row .date { display: none; }
    }
  `]
})
export class SubscriptionMeComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);

  subscription = signal<any>(null);
  history = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.subscriptionService.getMySubscription().subscribe({
      next: (sub) => { this.subscription.set(sub); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
    this.subscriptionService.getPaymentHistory().subscribe({
      next: (h) => this.history.set(h),
      error: () => {}
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  cancelAutoRenew() {
    if (confirm('Are you sure you want to cancel auto-renewal? Your subscription will remain active until expiry.')) {
      this.subscriptionService.cancelAutoRenew().subscribe({
        next: () => {
          const sub = this.subscription();
          if (sub?.subscription) {
            this.subscription.set({ ...sub, subscription: { ...sub.subscription, autoRenew: false } });
          }
        }
      });
    }
  }
}
