import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="header-left">
          <h1>User Management</h1>
          <p>View and manage all registered platform users.</p>
        </div>
        <div class="header-right">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search users by name or email..." class="search-input">
        </div>
      </header>

      @if (loading()) {
        <div class="loading-state">Loading users...</div>
      } @else {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of filteredUsers(); track user._id) {
                <tr>
                  <td>
                    <div class="title-cell">
                      <span class="user-name">{{ user.username }}</span>
                      <span class="user-email">{{ user.email }}</span>
                    </div>
                  </td>
                  <td><span class="role-badge">{{ user.role }}</span></td>
                  <td>
                    <span class="status-badge" [ngClass]="user.status">{{ user.status }}</span>
                  </td>
                  <td class="date-cell">{{ user.createdAt | date:'mediumDate' }}</td>
                  <td>
                    <div class="action-buttons">
                      @if (user.status === 'active' && user.role !== 'superadmin') {
                        <button class="btn-reject" (click)="toggleStatus(user, 'suspended')">Suspend</button>
                      } @else if (user.status === 'suspended') {
                        <button class="btn-approve" (click)="toggleStatus(user, 'active')">Reactivate</button>
                      }
                      @if (user.role !== 'superadmin') {
                        <button class="btn-delete" (click)="deleteUser(user)">Delete</button>
                      }
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
    
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .search-input { padding: 10px 16px; border: 1px solid var(--border-soft); border-radius: var(--radius-m); width: 300px; font-size: 14px; outline: none; }
    .search-input:focus { border-color: var(--forest); }
    
    .loading-state { padding: 48px; text-align: center; color: var(--ink-soft); background: #fff; border: 1px solid var(--border-soft); border-radius: var(--radius-m); }
    
    .table-container { background: #fff; border: 1px solid var(--border-soft); border-radius: var(--radius-m); overflow: hidden; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { padding: 16px 24px; background: #F8FAFC; font-weight: 600; font-size: 13px; color: var(--ink-soft); border-bottom: 1px solid var(--border-soft); text-transform: uppercase; letter-spacing: 0.05em; }
    .admin-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-soft); vertical-align: middle; }
    .admin-table tr:last-child td { border-bottom: none; }
    
    .title-cell { display: flex; flex-direction: column; gap: 4px; }
    .user-name { font-family: var(--display); font-weight: 600; font-size: 15px; color: var(--ink); }
    .user-email { font-size: 13px; color: var(--ink-faint); }
    
    .role-badge { font-size: 13px; font-weight: 500; color: var(--ink-soft); text-transform: capitalize; }
    
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .status-badge.active { background: var(--forest-tint); color: var(--forest-deep); }
    .status-badge.suspended { background: var(--rose-tint); color: var(--rose); }
    
    .date-cell { font-size: 14px; color: var(--ink-soft); }
    
    .action-buttons { display: flex; gap: 8px; }
    .action-buttons button { padding: 6px 12px; border-radius: var(--radius-s); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
    .btn-approve { background: var(--forest); color: #fff; }
    .btn-approve:hover { background: var(--forest-deep); }
    .btn-reject { background: #fff; border-color: var(--border-soft); color: var(--rose); }
    .btn-reject:hover { border-color: var(--rose); background: var(--rose-tint); }
    .btn-delete { background: #dc2626; color: #fff; }
    .btn-delete:hover { background: #b91c1c; }
  `]
})
export class UsersComponent implements OnInit {
  adminService = inject(AdminService);
  users = signal<AdminUser[]>([]);
  searchQuery = signal('');
  loading = signal(true);
  
  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.users();
    return this.users().filter(u => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleStatus(user: AdminUser, status: string) {
    if (confirm(`Are you sure you want to mark this user as ${status}?`)) {
      this.adminService.updateUserStatus(user._id, status).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  deleteUser(user: AdminUser) {
    if (confirm(`Are you absolutely sure you want to permanently delete user "${user.username}"? All their books, chapters, and records will be deleted forever.`)) {
      if (confirm(`FINAL CONFIRMATION: Permanently delete "${user.username}"?`)) {
        this.adminService.deleteUser(user._id).subscribe(() => {
          this.loadUsers();
        });
      }
    }
  }
}
