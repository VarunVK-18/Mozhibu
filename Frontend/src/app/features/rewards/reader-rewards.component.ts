import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../core/services/subscription.service';

@Component({
  selector: 'app-reader-rewards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rewards-page">
      <div class="wrap">
        <div class="page-header">
          <h1>🏆 Reader Rewards</h1>
          <p>Earn money every month just by reading on Mozhibu</p>
        </div>

        @if (isLoading()) {
          <div class="loading-state"><div class="spinner"></div></div>
        } @else {
          <!-- Engagement Score Card -->
          @if (currentScore()) {
            <div class="score-card">
              <h3>This Month's Engagement Score</h3>
              <div class="total-score">{{ currentScore().totalScore }}<span class="pts"> pts</span></div>
              <div class="score-breakdown">
                <div class="score-row">
                  <span>📖 Reading</span>
                  <div class="score-bar"><div class="bar-fill" [style.width]="currentScore().readingScore + '%'"></div></div>
                  <span>{{ currentScore().readingScore }}</span>
                </div>
                <div class="score-row">
                  <span>🔥 Consistency</span>
                  <div class="score-bar"><div class="bar-fill blue" [style.width]="currentScore().consistencyScore + '%'"></div></div>
                  <span>{{ currentScore().consistencyScore }}</span>
                </div>
                <div class="score-row">
                  <span>⏱ Time Spent</span>
                  <div class="score-bar"><div class="bar-fill green" [style.width]="currentScore().timeScore + '%'"></div></div>
                  <span>{{ currentScore().timeScore }}</span>
                </div>
                <div class="score-row">
                  <span>💬 Interactions</span>
                  <div class="score-bar"><div class="bar-fill purple" [style.width]="currentScore().interactionScore + '%'"></div></div>
                  <span>{{ currentScore().interactionScore }}</span>
                </div>
              </div>
            </div>
          }

          <!-- Summary Cards -->
          <div class="summary-grid">
            <div class="summary-card">
              <div class="card-label">Total Earned</div>
              <div class="card-value green">{{ summary()?.totalPaidDisplay || '₹0.00' }}</div>
            </div>
            <div class="summary-card">
              <div class="card-label">Pending</div>
              <div class="card-value yellow">{{ summary()?.totalPendingDisplay || '₹0.00' }}</div>
            </div>
          </div>

          <!-- Rewards Table -->
          <div class="table-section">
            <h3>Rewards History</h3>
            @if (rewards().length === 0) {
              <div class="empty-state">
                <div class="empty-icon">🎯</div>
                <p>No rewards yet. Keep reading to build your engagement score!</p>
              </div>
            } @else {
              <div class="data-table">
                <div class="table-header">
                  <span>Period</span>
                  <span>Score</span>
                  <span>Reward</span>
                  <span>Status</span>
                </div>
                @for (r of rewards(); track r._id) {
                  <div class="table-row">
                    <span class="period">{{ monthName(r.month) }} {{ r.year }}</span>
                    <span class="score">{{ r.engagementScore }} pts</span>
                    <span class="amount">{{ r.rewardDisplay }}</span>
                    <span class="status-badge" [class]="r.status">{{ r.status }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- How It Works -->
          <div class="how-it-works">
            <h3>How Rewards Are Calculated</h3>
            <div class="formula-card">
              <code>Your Reward = (Your Engagement Score ÷ Total Platform Score) × Readers Pool</code>
            </div>
            <p>The Readers Pool is <strong>5%</strong> of monthly net ad revenue. Score more by reading consistently, completing chapters, and interacting with stories.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .rewards-page { min-height: 100vh; background: #0d0d0d; color: #f5f0e8; padding-bottom: 80px; }
    .wrap { max-width: 900px; margin: 0 auto; padding: 48px 24px; }
    .page-header { margin-bottom: 40px; }
    .page-header h1 { font-size: 32px; font-weight: 800; margin: 0 0 8px; }
    .page-header p { color: #6b7280; }
    .loading-state { display: flex; justify-content: center; padding: 64px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #2a2a3e; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .score-card { background: linear-gradient(135deg, #1e1b4b, #1a1a2e); border: 1px solid #6366f1; border-radius: 20px; padding: 32px; margin-bottom: 32px; }
    .score-card h3 { font-size: 16px; color: #a5b4fc; font-weight: 700; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.05em; }
    .total-score { font-size: 56px; font-weight: 900; color: #fff; margin-bottom: 24px; }
    .pts { font-size: 24px; color: #6b7280; }
    .score-breakdown { display: flex; flex-direction: column; gap: 12px; }
    .score-row { display: grid; grid-template-columns: 120px 1fr 40px; align-items: center; gap: 12px; font-size: 14px; color: #9ca3af; }
    .score-bar { background: #2a2a3e; border-radius: 100px; height: 8px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 100px; background: #6366f1; transition: width 0.5s ease; }
    .bar-fill.blue { background: #3b82f6; }
    .bar-fill.green { background: #10b981; }
    .bar-fill.purple { background: #a855f7; }

    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .summary-card { background: #1a1a2a; border: 1px solid #2a2a3e; border-radius: 16px; padding: 24px; }
    .card-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px; }
    .card-value { font-size: 28px; font-weight: 800; color: #f5f0e8; }
    .card-value.green { color: #69f0ae; }
    .card-value.yellow { color: #fbbf24; }

    .table-section h3 { font-size: 20px; font-weight: 700; margin: 0 0 16px; }
    .empty-state { text-align: center; padding: 48px; background: #1a1a2a; border-radius: 16px; }
    .empty-icon { font-size: 40px; margin-bottom: 12px; }
    .empty-state p { color: #6b7280; }
    .data-table { border: 1px solid #2a2a3e; border-radius: 12px; overflow: hidden; }
    .table-header { display: grid; grid-template-columns: 2fr 2fr 2fr 1.5fr; padding: 12px 20px; background: #1a1a2a; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; }
    .table-row { display: grid; grid-template-columns: 2fr 2fr 2fr 1.5fr; padding: 14px 20px; border-top: 1px solid #2a2a3e; font-size: 14px; align-items: center; }
    .table-row:hover { background: #1a1a2a; }
    .period { color: #d1d5db; font-weight: 500; }
    .score { color: #a5b4fc; }
    .amount { color: #f5f0e8; font-weight: 700; }
    .status-badge { padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; text-align: center; width: fit-content; }
    .status-badge.pending { background: #2a2a0a; color: #fbbf24; }
    .status-badge.paid { background: #1a3a1a; color: #69f0ae; }
    .status-badge.rolled_over { background: #1a1a3a; color: #a5b4fc; }

    .how-it-works { margin-top: 48px; padding-top: 32px; border-top: 1px solid #2a2a3e; }
    .how-it-works h3 { font-size: 18px; font-weight: 700; margin: 0 0 16px; }
    .formula-card { background: #111; border: 1px solid #2a2a3e; border-radius: 10px; padding: 16px 20px; margin-bottom: 12px; }
    .formula-card code { color: #a5b4fc; font-size: 14px; }
    .how-it-works p { color: #9ca3af; font-size: 14px; line-height: 1.6; }
  `]
})
export class ReaderRewardsComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);

  rewards = signal<any[]>([]);
  summary = signal<any>(null);
  currentScore = signal<any>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.subscriptionService.getMyRewards().subscribe({
      next: (res) => {
        this.rewards.set(res.rewards || []);
        this.summary.set(res.summary);
        this.currentScore.set(res.currentMonthScore);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  monthName(m: number): string {
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];
  }
}
