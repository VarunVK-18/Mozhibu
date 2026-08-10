import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="settings-page">
      <div class="settings-container">
        <header class="page-header">
          <h1>Account Settings</h1>
          <p>Manage your profile and account preferences.</p>
        </header>

        <div class="settings-grid">
          
          <!-- Basic Profile Info -->
          <div class="settings-card">
            <h3>Profile Information</h3>
            <div class="info-group">
              <label>Username</label>
              <div class="value">{{ auth.user()?.username }}</div>
            </div>
            <div class="info-group">
              <label>Email Address</label>
              <div class="value">{{ auth.user()?.email }}</div>
            </div>
            <div class="info-group">
              <label>Current Role</label>
              <div class="value role-badge" [ngClass]="auth.user()?.role">
                {{ auth.user()?.role }}
              </div>
            </div>
          </div>

          <!-- Become an Author Section -->
          @if (auth.user()?.role === 'reader' && auth.user()?.authorStatus !== 'pending') {
            <div class="settings-card author-upgrade">
              <div class="upgrade-icon">✍️</div>
              <h3>Become an Author</h3>
              <p>Want to publish your own stories on Mozhibu? Upgrade your account to an Author for free and get access to the Author Studio.</p>
              
              @if (errorMsg()) {
                <div class="error-msg">{{ errorMsg() }}</div>
              }
              
              <button (click)="upgradeToAuthor()" class="btn btn-primary upgrade-btn" [disabled]="loading()">
                {{ loading() ? 'Requesting...' : 'Request Author Status' }}
              </button>
            </div>
          } @else if (auth.user()?.role === 'reader' && auth.user()?.authorStatus === 'pending') {
            <div class="settings-card author-pending">
              <div class="upgrade-icon">⏳</div>
              <h3>Request Pending</h3>
              <p>Your request to become an author is currently pending admin approval. You will gain access to the Author Studio once approved.</p>
              <button class="btn btn-outline upgrade-btn" disabled>Request Pending Admin Approval</button>
            </div>
          } @else if (auth.user()?.role === 'writer' || auth.user()?.role === 'superadmin') {
            <div class="settings-card author-active">
              <div class="upgrade-icon">🎉</div>
              <h3>Author Studio Active</h3>
              <p>You already have author privileges! Head over to the Author Studio to publish and manage your books.</p>
              <button class="btn btn-outline" disabled>Go to Studio (Coming Soon)</button>
            </div>
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      background: var(--paper);
      min-height: calc(100vh - 80px);
      padding: 48px 24px;
    }
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 32px;
    }
    .page-header h1 {
      font-family: var(--display);
      font-size: 28px;
      color: var(--ink);
      margin-bottom: 8px;
    }
    .page-header p {
      color: var(--ink-soft);
      font-size: 15px;
    }
    
    .settings-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .settings-card {
      background: #fff;
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-l);
      padding: 32px;
    }
    .settings-card h3 {
      font-family: var(--display);
      font-size: 18px;
      color: var(--ink);
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-soft);
    }
    
    .info-group {
      margin-bottom: 16px;
    }
    .info-group label {
      display: block;
      font-size: 12px;
      color: var(--ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .info-group .value {
      font-size: 15px;
      color: var(--ink);
      font-weight: 500;
    }
    
    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    .role-badge.reader { background: var(--paper-warm); color: var(--ink); }
    .role-badge.writer { background: var(--forest-tint); color: var(--forest-deep); }
    .role-badge.superadmin { background: var(--gold-tint); color: var(--ink); }
    
    .author-upgrade {
      background: var(--forest-tint);
      border-color: var(--forest);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .author-upgrade h3 {
      border: none;
      margin-bottom: 12px;
      padding: 0;
      color: var(--forest-deep);
    }
    .author-upgrade p {
      color: var(--forest-deep);
      opacity: 0.8;
      margin-bottom: 24px;
      max-width: 500px;
      line-height: 1.5;
    }
    .upgrade-icon {
      font-size: 40px;
      margin-bottom: 16px;
    }
    .upgrade-btn {
      padding: 12px 32px;
      font-size: 15px;
      background: var(--forest);
      color: #fff;
    }
    .upgrade-btn:hover:not(:disabled) {
      background: var(--forest-deep);
    }
    
    .author-pending {
      background: #fef3c7;
      border-color: #f59e0b;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .author-pending h3 { border: none; padding: 0; margin-bottom: 12px; color: #b45309; }
    .author-pending p { color: #92400e; margin-bottom: 24px; max-width: 500px; line-height: 1.5; }
    
    .author-active {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .author-active h3 { border: none; padding: 0; margin-bottom: 12px; }
    .author-active p { color: var(--ink-soft); margin-bottom: 24px; max-width: 500px; line-height: 1.5; }
    
    .error-msg {
      color: var(--rose);
      background: var(--rose-tint);
      padding: 8px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 13px;
    }
  `]
})
export class SettingsComponent implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  
  loading = signal(false);
  errorMsg = signal<string | null>(null);

  ngOnInit() {
    // If not logged in, redirect to login
    if (!this.auth.user()) {
      this.router.navigate(['/login']);
    }
  }

  upgradeToAuthor() {
    this.loading.set(true);
    this.errorMsg.set(null);
    
    this.auth.upgradeRole().subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.msg || 'Failed to upgrade account. Please try again.');
      }
    });
  }
}
