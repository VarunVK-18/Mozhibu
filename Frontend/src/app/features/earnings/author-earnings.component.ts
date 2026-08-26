import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../core/services/subscription.service';

@Component({
  selector: 'app-author-earnings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="earnings-page">
      <div class="wrap">
        <!-- Header -->
        <div class="page-header">
          <h1>✍️ Author Earnings</h1>
          <p>Your monthly earnings from the Mozhibu revenue sharing program</p>
        </div>

        @if (isLoading()) {
          <div class="loading-state"><div class="spinner"></div></div>
        } @else {
          <!-- Summary Cards -->
          <div class="summary-grid">
            <div class="summary-card">
              <div class="card-label">Total Earned</div>
              <div class="card-value green">
                {{ summary()?.totalPaidDisplay || '₹0.00' }}
              </div>
            </div>
            <div class="summary-card">
              <div class="card-label">Pending Payout</div>
              <div class="card-value yellow">
                {{ summary()?.totalPendingDisplay || '₹0.00' }}
              </div>
            </div>
            <div class="summary-card">
              <div class="card-label">Requested Payout</div>
              <div class="card-value blue">
                {{ summary()?.totalRequestedDisplay || '₹0.00' }}
              </div>
            </div>
            <div class="summary-card">
              <div class="card-label">This Month (Est.)</div>
              <div class="card-value">
                {{ projection()?.estimatedEarningsDisplay || '₹0.00' }}
              </div>
              <div class="card-sub">
                {{ projection()?.myQualifiedReads || 0 }} qualified reads
              </div>
            </div>
          </div>

          <div class="actions-container">
            <button
              class="btn-primary"
              (click)="requestWithdrawal()"
              [disabled]="isWithdrawing() || !canWithdraw()"
            >
              {{ isWithdrawing() ? 'Requesting...' : 'Request Withdrawal' }}
            </button>
            @if (summary()?.totalPendingInPaise < summary()?.minPayoutInPaise) {
              <div class="min-payout-note">
                Minimum withdrawal is ₹{{
                  (summary()?.minPayoutInPaise / 100).toFixed(2)
                }}
              </div>
            }
          </div>

          <!-- Projection Note -->
          @if (projection()?.note) {
            <div class="note-card">ℹ️ {{ projection()?.note }}</div>
          }

          <!-- Earnings Table -->
          <div class="table-section">
            <h3>Earnings History</h3>
            @if (earnings().length === 0) {
              <div class="empty-state">
                <div class="empty-icon">📊</div>
                <p>
                  No earnings yet. Your first earnings will appear here after
                  the end of the month.
                </p>
              </div>
            } @else {
              <div class="data-table">
                <div class="table-header">
                  <span>Period</span>
                  <span>Qualified Reads</span>
                  <span>Earnings</span>
                  <span>Status</span>
                </div>
                @for (e of earnings(); track e._id) {
                  <div class="table-row">
                    <span class="period"
                      >{{ monthName(e.month) }} {{ e.year }}</span
                    >
                    <span class="reads">{{
                      e.qualifiedReads.toLocaleString()
                    }}</span>
                    <span class="amount">{{ e.earningsDisplay }}</span>
                    <span class="status-badge" [class]="e.status">{{
                      e.status
                    }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- How It Works -->
          <div class="how-it-works">
            <h3>How Earnings Are Calculated</h3>
            <div class="formula-card">
              <code
                >Your Earnings = (Your Qualified Reads ÷ Total Platform Reads) ×
                Authors Pool</code
              >
            </div>
            <p>
              The Authors Pool is <strong>15%</strong> of monthly net ad
              revenue. Qualified reads require ≥30% chapter completion and ≥60
              seconds reading time.
            </p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .earnings-page {
        min-height: 100vh;
        background: #0d0d0d;
        color: #f5f0e8;
        padding-bottom: 80px;
      }
      .wrap {
        max-width: 900px;
        margin: 0 auto;
        padding: 48px 24px;
      }
      .page-header {
        margin-bottom: 40px;
      }
      .page-header h1 {
        font-size: 32px;
        font-weight: 800;
        margin: 0 0 8px;
      }
      .page-header p {
        color: #6b7280;
      }

      .loading-state {
        display: flex;
        justify-content: center;
        padding: 64px;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #2a2a3e;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }
      .summary-card {
        background: #1a1a2a;
        border: 1px solid #2a2a3e;
        border-radius: 16px;
        padding: 24px;
      }
      .card-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6b7280;
        margin-bottom: 8px;
      }
      .card-value {
        font-size: 28px;
        font-weight: 800;
        color: #f5f0e8;
      }
      .card-value.green {
        color: #69f0ae;
      }
      .card-value.yellow {
        color: #fbbf24;
      }
      .card-sub {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
      }

      .note-card {
        background: #1a1a2a;
        border-left: 3px solid #6366f1;
        padding: 14px 18px;
        border-radius: 8px;
        font-size: 13px;
        color: #9ca3af;
        margin-bottom: 40px;
      }

      .table-section h3 {
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 16px;
      }
      .empty-state {
        text-align: center;
        padding: 48px;
        background: #1a1a2a;
        border-radius: 16px;
      }
      .empty-icon {
        font-size: 40px;
        margin-bottom: 12px;
      }
      .empty-state p {
        color: #6b7280;
      }

      .data-table {
        border: 1px solid #2a2a3e;
        border-radius: 12px;
        overflow: hidden;
      }
      .table-header {
        display: grid;
        grid-template-columns: 2fr 2fr 2fr 1.5fr;
        padding: 12px 20px;
        background: #1a1a2a;
        font-size: 12px;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
      }
      .table-row {
        display: grid;
        grid-template-columns: 2fr 2fr 2fr 1.5fr;
        padding: 14px 20px;
        border-top: 1px solid #2a2a3e;
        font-size: 14px;
        align-items: center;
      }
      .table-row:hover {
        background: #1a1a2a;
      }
      .period {
        color: #d1d5db;
        font-weight: 500;
      }
      .reads {
        color: #9ca3af;
      }
      .amount {
        color: #f5f0e8;
        font-weight: 700;
      }
      .status-badge {
        padding: 3px 10px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        text-align: center;
        width: fit-content;
      }
      .status-badge.pending {
        background: #2a2a0a;
        color: #fbbf24;
      }
      .status-badge.requested {
        background: #1e3a8a;
        color: #60a5fa;
      }
      .status-badge.paid {
        background: #1a3a1a;
        color: #69f0ae;
      }
      .status-badge.rolled_over {
        background: #1a1a3a;
        color: #a5b4fc;
      }

      .actions-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        margin-bottom: 32px;
        gap: 8px;
      }
      .btn-primary {
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .btn-primary:hover {
        opacity: 0.9;
      }
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .min-payout-note {
        font-size: 12px;
        color: #9ca3af;
      }

      .how-it-works {
        margin-top: 48px;
        padding-top: 32px;
        border-top: 1px solid #2a2a3e;
      }
      .how-it-works h3 {
        font-size: 18px;
        font-weight: 700;
        margin: 0 0 16px;
      }
      .formula-card {
        background: #111;
        border: 1px solid #2a2a3e;
        border-radius: 10px;
        padding: 16px 20px;
        margin-bottom: 12px;
      }
      .formula-card code {
        color: #a5b4fc;
        font-size: 14px;
      }
      .how-it-works p {
        color: #9ca3af;
        font-size: 14px;
        line-height: 1.6;
      }
    `,
  ],
})
export class AuthorEarningsComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);

  earnings = signal<any[]>([]);
  summary = signal<any>(null);
  projection = signal<any>(null);
  isLoading = signal(true);
  isWithdrawing = signal(false);

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.subscriptionService.getMyEarnings().subscribe({
      next: (res) => {
        this.earnings.set(res.earnings || []);
        this.summary.set(res.summary);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    this.subscriptionService.getEarningsProjection().subscribe({
      next: (p) => this.projection.set(p),
      error: () => {},
    });
  }

  canWithdraw(): boolean {
    const sum = this.summary();
    if (!sum) return false;
    return sum.totalPendingInPaise >= sum.minPayoutInPaise;
  }

  requestWithdrawal() {
    if (!this.canWithdraw()) return;
    this.isWithdrawing.set(true);
    this.subscriptionService.requestWithdrawal().subscribe({
      next: (res) => {
        alert('Withdrawal requested successfully!');
        this.fetchData();
        this.isWithdrawing.set(false);
      },
      error: (err) => {
        alert(err.error?.msg || 'Failed to request withdrawal');
        this.isWithdrawing.set(false);
      },
    });
  }

  monthName(m: number): string {
    return [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ][m - 1];
  }
}
