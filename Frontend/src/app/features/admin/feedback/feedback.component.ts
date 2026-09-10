import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

interface Feedback {
  _id: string;
  content: string;
  status: 'pending' | 'fixed';
  createdAt: string;
  user?: {
    username: string;
    penName: string;
    email: string;
    role: string;
  };
}

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <h1>User Feedback & Bug Reports</h1>
      </header>

      <div class="tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'pending'"
          (click)="activeTab = 'pending'"
        >
          Pending ({{ pendingFeedback.length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'fixed'"
          (click)="activeTab = 'fixed'"
        >
          Fixed ({{ fixedFeedback.length }})
        </button>
      </div>

      <div class="content-wrapper">
        @if (loading) {
          <div class="loading-state">
            <span class="spinner"></span> Loading feedback...
          </div>
        } @else {
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Report Content</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of currentFeedbackList; track item._id) {
                  <tr>
                    <td>{{ item.createdAt | date:'short' }}</td>
                    <td>
                      <div class="user-cell">
                        <span class="user-name">{{ item.user?.penName || item.user?.username || 'Unknown' }}</span>
                        <span class="user-email">{{ item.user?.email }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="feedback-content">{{ item.content }}</div>
                    </td>
                    <td>
                      @if (item.status === 'pending') {
                        <button class="btn btn-sm btn-success" (click)="markAsFixed(item._id)" [disabled]="actionLoading === item._id">
                          @if (actionLoading === item._id) {
                            <span class="spinner-small"></span>
                          } @else {
                            <i class="fa fa-check"></i> Mark as Fixed
                          }
                        </button>
                      } @else {
                        <span class="status-badge fixed">Fixed</span>
                      }
                    </td>
                  </tr>
                }
                
                @if (currentFeedbackList.length === 0) {
                  <tr>
                    <td colspan="4" class="empty-state">
                      No {{ activeTab }} feedback found.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .admin-page {
        padding: 24px;
      }
      .page-header {
        margin-bottom: 24px;
      }
      .page-header h1 {
        font-size: 24px;
        color: var(--ink);
      }
      .tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        border-bottom: 1px solid var(--border-soft);
      }
      .tab-btn {
        background: transparent;
        border: none;
        padding: 12px 24px;
        font-size: 15px;
        font-weight: 500;
        color: var(--ink-soft);
        cursor: pointer;
        position: relative;
      }
      .tab-btn.active {
        color: var(--primary);
      }
      .tab-btn.active::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--primary);
        border-radius: 3px 3px 0 0;
      }
      .table-container {
        background: var(--card);
        border-radius: var(--radius-m);
        border: 1px solid var(--border-soft);
        overflow: hidden;
      }
      .admin-table {
        width: 100%;
        border-collapse: collapse;
      }
      .admin-table th, .admin-table td {
        padding: 16px;
        text-align: left;
        border-bottom: 1px solid var(--border-soft);
      }
      .admin-table th {
        background: var(--surface);
        font-weight: 600;
        color: var(--ink-soft);
        font-size: 14px;
      }
      .admin-table tbody tr:hover {
        background: var(--surface);
      }
      .user-cell {
        display: flex;
        flex-direction: column;
      }
      .user-name {
        font-weight: 600;
        color: var(--ink);
      }
      .user-email {
        font-size: 13px;
        color: var(--ink-soft);
      }
      .feedback-content {
        max-width: 400px;
        white-space: pre-wrap;
        color: var(--ink);
        line-height: 1.5;
      }
      .btn-sm {
        padding: 6px 12px;
        font-size: 13px;
        border-radius: 4px;
      }
      .btn-success {
        background: #10b981;
        color: white;
        border: none;
        cursor: pointer;
      }
      .btn-success:hover {
        background: #059669;
      }
      .btn-success:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .status-badge.fixed {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
      }
      .loading-state, .empty-state {
        text-align: center;
        padding: 48px;
        color: var(--ink-soft);
      }
      .spinner-small {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
        vertical-align: middle;
      }
    `
  ]
})
export class AdminFeedbackComponent implements OnInit {
  private api = inject(ApiService);
  
  feedbacks: Feedback[] = [];
  loading = true;
  activeTab: 'pending' | 'fixed' = 'pending';
  actionLoading: string | null = null;

  ngOnInit() {
    this.loadFeedback();
  }

  loadFeedback() {
    this.loading = true;
    this.api.get<Feedback[]>('/feedback').subscribe({
      next: (res) => {
        this.feedbacks = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  get pendingFeedback() {
    return this.feedbacks.filter(f => f.status === 'pending');
  }

  get fixedFeedback() {
    return this.feedbacks.filter(f => f.status === 'fixed');
  }

  get currentFeedbackList() {
    return this.activeTab === 'pending' ? this.pendingFeedback : this.fixedFeedback;
  }

  markAsFixed(id: string) {
    this.actionLoading = id;
    this.api.put(`/feedback/${id}/fix`, {}).subscribe({
      next: () => {
        // Update local state
        const index = this.feedbacks.findIndex(f => f._id === id);
        if (index !== -1) {
          this.feedbacks[index].status = 'fixed';
        }
        this.actionLoading = null;
      },
      error: (err) => {
        console.error(err);
        this.actionLoading = null;
      }
    });
  }
}
