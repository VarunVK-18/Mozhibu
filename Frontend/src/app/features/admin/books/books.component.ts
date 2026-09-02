import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminBook } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="header-left">
          <h1>Book Management</h1>
          <p>Manage published books across the platform.</p>
        </div>
        <div class="header-actions">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by title or author..."
            class="search-input"
          />
          <select
            [(ngModel)]="statusFilter"
            (change)="loadBooks()"
            class="filter-select"
          >
            <option value="all">All Books</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="suspended">Suspended</option>
            <option value="reported">Reported Queue</option>
          </select>
        </div>
      </header>

      @if (loading()) {
        <div class="loading-state">Loading books...</div>
      } @else if (books().length === 0) {
        <div class="empty-state">
          No books found matching the current filter.
        </div>
      } @else {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Title & Author</th>
                <th>Status</th>
                <th>
                  {{ statusFilter === 'reported' ? 'Reports' : 'Submitted' }}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (book of filteredBooks(); track book._id) {
                <tr>
                  <td>
                    <div class="title-cell">
                      <a
                        [routerLink]="['/admin/books', book._id]"
                        class="book-title"
                        >{{ book.title }}</a
                      >
                      <span class="book-author"
                        >by {{ book.author.username }}</span
                      >
                    </div>
                  </td>
                  <td>
                    <span class="status-badge" [ngClass]="book.status">{{
                      book.status
                    }}</span>
                  </td>
                  <td class="date-cell">
                    @if (statusFilter === 'reported') {
                      <div class="reports-info">
                        @if (book.reports && book.reports.length > 0) {
                          <ul class="report-list">
                            @for (r of book.reports; track r.createdAt || $index) {
                              <li>
                                <div class="report-reason-row">
                                  <strong>{{ r.reason }}</strong>
                                  @if (r.comment) {
                                    <div class="comment-icon-wrapper" [title]="r.comment">
                                      <svg class="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                      </svg>
                                    </div>
                                  }
                                </div>
                                <span class="reporter">by {{ r.user.username || 'Unknown User' }}</span>
                              </li>
                            }
                          </ul>
                        }
                        <span class="report-count-text">
                          {{ book.reportCount }} Reports
                        </span>
                      </div>
                    } @else {
                      {{ book.submittedAt | date: 'mediumDate' }}
                    }
                  </td>
                  <td>
                    <div class="action-buttons">
                      @if (book.status === 'published') {
                        <button
                          class="btn-reject"
                          (click)="updateStatus(book, 'suspended')"
                        >
                          Suspend
                        </button>
                      } @else if (
                        book.status === 'rejected' ||
                        book.status === 'suspended'
                      ) {
                        <button
                          class="btn-approve"
                          (click)="updateStatus(book, 'published')"
                        >
                          Republish
                        </button>
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
  styles: [
    `
      .admin-page {
        padding: 8px 0;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
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

      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .search-input {
        padding: 8px 12px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-s);
        width: 250px;
        font-family: var(--body);
        font-size: 14px;
        outline: none;
      }
      .search-input:focus {
        border-color: var(--forest);
      }
      .filter-select {
        padding: 8px 12px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-s);
        font-family: var(--body);
        font-size: 14px;
        outline: none;
        background: var(--card);
        cursor: pointer;
      }

      .loading-state,
      .empty-state {
        padding: 48px;
        text-align: center;
        color: var(--ink-soft);
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
      }

      .table-container {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        overflow: hidden;
      }
      .admin-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .admin-table th {
        padding: 16px 24px;
        background: #f8fafc;
        font-weight: 600;
        font-size: 13px;
        color: var(--ink-soft);
        border-bottom: 1px solid var(--border-soft);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .admin-table td {
        padding: 16px 24px;
        border-bottom: 1px solid var(--border-soft);
        vertical-align: middle;
      }
      .admin-table tr:last-child td {
        border-bottom: none;
      }

      .title-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .book-title {
        font-family: var(--display);
        font-weight: 600;
        font-size: 15px;
        color: var(--ink);
        text-decoration: none;
      }
      .book-title:hover {
        color: var(--forest);
      }
      .book-author {
        font-size: 13px;
        color: var(--ink-faint);
      }

      .status-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
      }
      .status-badge.pending {
        background: #fff7ed;
        color: #c2410c;
      }
      .status-badge.published {
        background: var(--forest-tint);
        color: var(--forest-deep);
      }
      .status-badge.rejected {
        background: #fee2e2;
        color: #991b1b;
      }
      .status-badge.suspended {
        background: #fef3c7;
        color: #92400e;
      }

      .report-list {
        margin: 0 0 8px 0;
        padding: 0;
        list-style: none;
        font-size: 13px;
        color: var(--ink-soft);
      }
      .report-list li {
        margin-bottom: 8px;
        line-height: 1.4;
        background: #f8fafc;
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px solid var(--border-soft);
      }
      .report-reason-row {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--ink);
      }
      .comment-icon-wrapper {
        display: flex;
        align-items: center;
        color: var(--ink-soft);
        cursor: help;
      }
      .comment-icon-wrapper:hover {
        color: var(--forest);
      }
      .comment-icon {
        width: 14px;
        height: 14px;
      }
      .reporter {
        color: var(--ink-faint);
        font-size: 11px;
        display: block;
        margin-top: 2px;
      }
      .report-count-text {
        font-size: 11px;
        color: var(--rose);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .status-badge.draft {
        background: #f3f4f6;
        color: #4b5563;
      }

      .action-buttons {
        display: flex;
        gap: 8px;
      }
      .action-buttons button {
        padding: 6px 12px;
        border-radius: var(--radius-s);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
      }
      .btn-approve {
        background: var(--forest);
        color: #fff;
      }
      .btn-approve:hover {
        background: var(--forest-deep);
      }
      .btn-reject {
        background: var(--card);
        border-color: var(--border-soft);
        color: var(--rose);
      }
      .btn-reject:hover {
        border-color: var(--rose);
        background: var(--rose-tint);
      }
    `,
  ],
})
export class BooksComponent implements OnInit {
  adminService = inject(AdminService);

  books = signal<AdminBook[]>([]);
  searchQuery = signal('');
  loading = signal(true);
  statusFilter = 'all';

  filteredBooks = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.books();
    return this.books().filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.username.toLowerCase().includes(q)),
    );
  });

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.loading.set(true);

    if (this.statusFilter === 'reported') {
      this.adminService.getReportedBooks().subscribe({
        next: (data) => {
          this.books.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.adminService.getBooks(this.statusFilter).subscribe({
        next: (data) => {
          this.books.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  updateStatus(book: AdminBook, status: string, reason?: string) {
    if (confirm(`Are you sure you want to mark this book as ${status}?`)) {
      this.adminService
        .updateBookStatus(book._id, status, reason)
        .subscribe(() => {
          this.loadBooks();
        });
    }
  }

  rejectBook(book: AdminBook) {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      this.updateStatus(book, 'rejected', reason);
    }
  }
}

