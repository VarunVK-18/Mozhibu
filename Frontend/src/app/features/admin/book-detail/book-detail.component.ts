import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AdminService, AdminBook } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="breadcrumb">
        <a routerLink="/admin/books">← Back to Books</a>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading book details...</div>
      } @else if (book()) {
        <header class="book-header">
          <div class="header-content">
            <div class="book-cover" [ngStyle]="{'background-image': 'url(' + (book()?.cover || 'assets/placeholder.jpg') + ')'}"></div>
            <div class="book-info">
              <span class="status-badge" [ngClass]="book()?.status">{{ book()?.status }}</span>
              <h1>{{ book()?.title }}</h1>
              <p class="author">by <strong>{{ book()?.author?.username }}</strong> ({{ book()?.author?.email }})</p>
              
              <div class="metadata">
                <span class="meta-item"><strong>Genre:</strong> {{ book()?.genre }}</span>
                <span class="meta-item"><strong>Format:</strong> {{ book()?.isAudio ? 'Audiobook' : 'Text' }}</span>
                <span class="meta-item"><strong>Submitted:</strong> {{ book()?.submittedAt | date:'medium' }}</span>
              </div>
            </div>
          </div>
          
          <div class="action-panel">
            @if (book()?.status === 'published') {
              <h3>Published Book</h3>
              <p>This book is currently visible to the public.</p>
              <div class="action-buttons">
                <button class="btn-reject" (click)="updateStatus('rejected', 'Suspended by admin')">Suspend Book</button>
              </div>
            } @else if (book()?.status === 'rejected') {
              <h3>Rejected Book</h3>
              <p><strong>Reason:</strong> {{ book()?.rejectionReason }}</p>
              <div class="action-buttons">
                <button class="btn-approve" (click)="updateStatus('published')">Republish Book</button>
              </div>
            }
          </div>
        </header>

        <section class="book-content-preview">
          <h2>Content Preview</h2>
          <div class="preview-box">
            <!-- In a real app, this would render the book chapters/text -->
            <p><em>[The full text of the story would be rendered here for the admin to read and review. Since this is a placeholder, assume the admin can scroll through the entire manuscript.]</em></p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .admin-page { padding: 8px 0; }
    .breadcrumb { margin-bottom: 24px; }
    .breadcrumb a { color: var(--ink-soft); text-decoration: none; font-size: 14px; font-weight: 500; }
    .breadcrumb a:hover { color: var(--forest); }
    
    .loading-state { padding: 48px; text-align: center; color: var(--ink-soft); background: #fff; border: 1px solid var(--border-soft); border-radius: var(--radius-m); }
    
    .book-header { display: flex; gap: 48px; background: #fff; padding: 32px; border: 1px solid var(--border-soft); border-radius: var(--radius-m); margin-bottom: 32px; }
    .header-content { display: flex; gap: 32px; flex-grow: 1; }
    
    .book-cover { width: 140px; height: 210px; background-size: cover; background-position: center; border-radius: var(--radius-s); box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0; }
    
    .book-info h1 { font-family: var(--display); font-size: 32px; color: var(--ink); margin: 12px 0 8px 0; line-height: 1.2; }
    .author { font-size: 15px; color: var(--ink-soft); margin-bottom: 24px; }
    .author strong { color: var(--ink); }
    
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .status-badge.pending { background: #FFF7ED; color: #C2410C; }
    .status-badge.published { background: var(--forest-tint); color: var(--forest-deep); }
    .status-badge.rejected { background: var(--rose-tint); color: var(--rose); }
    
    .metadata { display: flex; flex-direction: column; gap: 8px; }
    .meta-item { font-size: 14px; color: var(--ink-soft); }
    .meta-item strong { color: var(--ink); }
    
    .action-panel { width: 300px; background: #F8FAFC; padding: 24px; border-radius: var(--radius-s); border: 1px solid var(--border-soft); flex-shrink: 0; }
    .action-panel h3 { font-family: var(--display); font-size: 18px; margin-bottom: 8px; color: var(--ink); }
    .action-panel p { font-size: 13px; color: var(--ink-soft); line-height: 1.5; margin-bottom: 24px; }
    
    .action-buttons { display: flex; flex-direction: column; gap: 12px; }
    .action-buttons button { width: 100%; padding: 12px; border-radius: var(--radius-s); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
    .btn-approve { background: var(--forest); color: #fff; }
    .btn-approve:hover { background: var(--forest-deep); }
    .btn-reject { background: #fff; border-color: var(--rose); color: var(--rose); }
    .btn-reject:hover { background: var(--rose-tint); }
    
    .book-content-preview h2 { font-family: var(--display); font-size: 20px; color: var(--ink); margin-bottom: 16px; }
    .preview-box { background: #fff; border: 1px solid var(--border-soft); border-radius: var(--radius-m); padding: 48px; max-width: 800px; }
    .preview-box p { font-size: 16px; line-height: 1.8; color: var(--ink); margin-bottom: 24px; }
    .preview-box p:last-child { margin-bottom: 0; }
  `]
})
export class BookDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  adminService = inject(AdminService);
  
  book = signal<AdminBook | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.adminService.getBookDetails(id).subscribe({
        next: (data) => {
          this.book.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/admin/books']);
        }
      });
    }
  }

  updateStatus(status: string, reason?: string) {
    if (!this.book()) return;
    
    if (confirm(`Are you sure you want to mark this book as ${status}?`)) {
      this.adminService.updateBookStatus(this.book()!._id, status, reason).subscribe({
        next: (updated) => this.book.set(updated)
      });
    }
  }

  rejectBook() {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      this.updateStatus('rejected', reason);
    }
  }
}
