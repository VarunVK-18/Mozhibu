import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, PendingAuthor } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-author-approvals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="header-left">
          <h1>Author Approvals</h1>
          <p>Review users requesting to become authors on the platform.</p>
        </div>
      </header>

      @if (loading()) {
        <div class="loading-state">Loading pending requests...</div>
      } @else if (pendingAuthors().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <h3>All caught up!</h3>
          <p>There are no pending author requests to review right now.</p>
        </div>
      } @else {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Request Date</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (author of pendingAuthors(); track author._id) {
                <tr>
                  <td>
                    <div class="title-cell">
                      <span class="user-name">{{ author.username }}</span>
                      <span class="user-email">{{ author.email }}</span>
                    </div>
                  </td>
                  <td class="date-cell">{{ author.createdAt | date:'mediumDate' }}</td>
                  <td>
                    <span class="status-badge pending">Pending</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-primary btn-sm" (click)="updateStatus(author._id, 'approve')" [disabled]="processingId() === author._id">
                        {{ processingId() === author._id ? 'Processing...' : 'Approve' }}
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="updateStatus(author._id, 'reject')" [disabled]="processingId() === author._id">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-page { padding: 8px 0; }
    .page-header { margin-bottom: 32px; }
    .page-header h1 { font-family: var(--display); font-size: 28px; color: var(--ink); margin-bottom: 8px; }
    .page-header p { color: var(--ink-soft); font-size: 15px; }
    
    .loading-state, .empty-state { padding: 64px; text-align: center; color: var(--ink-soft); background: #fff; border: 1px solid var(--border-soft); border-radius: var(--radius-m); }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-state h3 { font-family: var(--display); font-size: 20px; color: var(--ink); margin-bottom: 8px; }
    
    .table-container { background: #fff; border: 1px solid var(--border-soft); border-radius: var(--radius-m); overflow: hidden; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { padding: 16px 24px; background: #F8FAFC; font-weight: 600; font-size: 13px; color: var(--ink-soft); border-bottom: 1px solid var(--border-soft); text-transform: uppercase; letter-spacing: 0.05em; }
    .admin-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-soft); vertical-align: middle; }
    .admin-table tr:last-child td { border-bottom: none; }
    
    .title-cell { display: flex; flex-direction: column; gap: 4px; }
    .user-name { font-family: var(--display); font-weight: 600; font-size: 15px; color: var(--ink); }
    .user-email { font-size: 13px; color: var(--ink-faint); }
    
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .status-badge.pending { background: #fef3c7; color: #d97706; }
    
    .date-cell { font-size: 14px; color: var(--ink-soft); }
    
    .action-buttons { display: flex; gap: 8px; }
    .btn-sm { padding: 6px 12px; font-size: 13px; border-radius: var(--radius-s); }
    .btn-danger { background: var(--rose); color: #fff; border: 1px solid var(--rose); }
    .btn-danger:hover { background: #e11d48; }
  `]
})
export class AuthorApprovalsComponent implements OnInit {
  adminService = inject(AdminService);
  
  pendingAuthors = signal<PendingAuthor[]>([]);
  loading = signal(true);
  processingId = signal<string | null>(null);

  ngOnInit() {
    this.loadPendingAuthors();
  }
  
  loadPendingAuthors() {
    this.loading.set(true);
    this.adminService.getPendingAuthors().subscribe({
      next: (data) => {
        this.pendingAuthors.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateStatus(id: string, action: 'approve' | 'reject') {
    if (confirm(`Are you sure you want to ${action} this author request?`)) {
      this.processingId.set(id);
      this.adminService.updatePendingAuthorStatus(id, action).subscribe({
        next: () => {
          // Remove from list
          this.pendingAuthors.update(list => list.filter(a => a._id !== id));
          this.processingId.set(null);
        },
        error: () => {
          alert('Failed to update author status');
          this.processingId.set(null);
        }
      });
    }
  }
}
