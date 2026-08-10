import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminAuthor } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-authors',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="header-left">
          <h1>Author Management</h1>
          <p>Review author statistics and published works.</p>
        </div>
      </header>

      @if (loading()) {
        <div class="loading-state">Loading authors...</div>
      } @else if (authors().length === 0) {
        <div class="empty-state">No authors found on the platform.</div>
      } @else {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Published Books</th>
                <th>Total Reads</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (author of authors(); track author._id) {
                <tr>
                  <td>
                    <div class="title-cell">
                      <span class="user-name">{{ author.username }}</span>
                      <span class="user-email">{{ author.email }}</span>
                    </div>
                  </td>
                  <td><span class="stat-badge">{{ author.publishedCount }}</span></td>
                  <td><span class="stat-text">{{ author.totalReads | number }}</span></td>
                  <td>
                    <span class="status-badge" [ngClass]="author.status">{{ author.status }}</span>
                  </td>
                  <td class="date-cell">{{ author.joinedAt | date:'mediumDate' }}</td>
                  <td>
                    <div class="action-buttons">
                      <a [routerLink]="['/admin/authors', author._id]" class="btn-outline">View Profile</a>
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
    
    .loading-state, .empty-state { padding: 48px; text-align: center; color: var(--ink-soft); background: #fff; border: 1px solid var(--border-soft); border-radius: var(--radius-m); }
    
    .table-container { background: #fff; border: 1px solid var(--border-soft); border-radius: var(--radius-m); overflow: hidden; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { padding: 16px 24px; background: #F8FAFC; font-weight: 600; font-size: 13px; color: var(--ink-soft); border-bottom: 1px solid var(--border-soft); text-transform: uppercase; letter-spacing: 0.05em; }
    .admin-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-soft); vertical-align: middle; }
    .admin-table tr:last-child td { border-bottom: none; }
    
    .title-cell { display: flex; flex-direction: column; gap: 4px; }
    .user-name { font-family: var(--display); font-weight: 600; font-size: 15px; color: var(--ink); }
    .user-email { font-size: 13px; color: var(--ink-faint); }
    
    .stat-badge { display: inline-block; padding: 4px 10px; border-radius: 100px; font-size: 13px; font-weight: 600; background: var(--paper-warm); color: var(--ink); }
    .stat-text { font-size: 14px; font-weight: 500; color: var(--ink-soft); }
    
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .status-badge.active { background: var(--forest-tint); color: var(--forest-deep); }
    .status-badge.suspended { background: var(--rose-tint); color: var(--rose); }
    
    .date-cell { font-size: 14px; color: var(--ink-soft); }
    
    .action-buttons { display: flex; gap: 8px; }
    .btn-outline { padding: 6px 12px; border-radius: var(--radius-s); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border-soft); background: #fff; color: var(--ink); text-decoration: none; }
    .btn-outline:hover { border-color: var(--forest); color: var(--forest); }
  `]
})
export class AuthorsComponent implements OnInit {
  adminService = inject(AdminService);
  authors = signal<AdminAuthor[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.adminService.getAuthors().subscribe({
      next: (data) => {
        this.authors.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
