import { Component, inject, ViewChild, ElementRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminBroadcast } from '../../../core/services/admin.service';

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-container">
      <div class="page-header">
        <h1>Broadcast Announcement</h1>
        <p>Send a notification directly to users' feeds.</p>
      </div>

      <div class="broadcast-card">
        <form (ngSubmit)="sendBroadcast()" #broadcastForm="ngForm">
          
          <div class="form-group">
            <label for="title">Announcement Title</label>
            <input type="text" id="title" name="title" [(ngModel)]="title" required placeholder="e.g. Server Maintenance at 2 AM" />
          </div>

          <div class="form-group">
            <label>Message</label>
            <div class="editor-container">
              <div class="editor-toolbar">
                <button type="button" class="toolbar-btn" (click)="format('bold')" title="Bold">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
                </button>
                <button type="button" class="toolbar-btn" (click)="format('italic')" title="Italic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
                </button>
                <button type="button" class="toolbar-btn" (click)="format('underline')" title="Underline">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
                </button>
                <div class="toolbar-divider"></div>
                <button type="button" class="toolbar-btn" (click)="insertLink()" title="Insert Link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </button>
              </div>
              <div 
                #editor 
                class="editor-content" 
                contenteditable="true" 
                (input)="onEditorInput()"
                placeholder="Type your full announcement here..."
              ></div>
            </div>
            <input type="hidden" name="message" [(ngModel)]="message" required />
          </div>

          <div class="form-group">
            <label for="audience">Target Audience</label>
            <select id="audience" name="audience" [(ngModel)]="audience" required>
              <option value="all">All Users</option>
              <option value="readers">Readers Only</option>
              <option value="writers">Writers Only</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="!broadcastForm.valid || isSubmitting">
              {{ isSubmitting ? 'Sending...' : 'Send Broadcast' }}
            </button>
          </div>

          @if (successMessage) {
            <div class="alert success">{{ successMessage }}</div>
          }
          @if (errorMessage) {
            <div class="alert error">{{ errorMessage }}</div>
          }
        </form>
      </div>

      <div class="history-section">
        <div class="page-header" style="margin-top: 48px;">
          <h2>Past Broadcasts</h2>
          <p>History of announcements sent to users.</p>
        </div>

        @if (loadingHistory()) {
          <div class="loading-state">Loading history...</div>
        } @else if (history().length === 0) {
          <div class="empty-state">
            No past broadcasts found.
          </div>
        } @else {
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Audience</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of history(); track item._id) {
                  <tr>
                    <td>
                      <div class="title-cell">
                        <span class="broadcast-title">{{ item.title }}</span>
                        <span class="broadcast-sender">Sent by {{ item.sentBy?.username || 'Unknown' }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="audience-badge" [ngClass]="item.audience">{{ item.audience }}</span>
                    </td>
                    <td class="date-cell">{{ item.createdAt | date:'short' }}</td>
                    <td>
                      <button class="btn-danger btn-sm" (click)="deleteBroadcast(item._id)">
                        Delete
                      </button>
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
  styleUrls: ['./broadcast.component.css']
})
export class BroadcastComponent implements OnInit {
  private adminService = inject(AdminService);

  @ViewChild('editor') editorElement!: ElementRef;

  title = '';
  message = '';
  audience = 'all';

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  history = signal<AdminBroadcast[]>([]);
  loadingHistory = signal(true);

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loadingHistory.set(true);
    this.adminService.getBroadcastHistory().subscribe({
      next: (data) => {
        this.history.set(data);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false)
    });
  }

  format(command: string) {
    document.execCommand(command, false, '');
    this.editorElement.nativeElement.focus();
    this.onEditorInput();
  }

  insertLink() {
    const url = prompt('Enter the link URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      this.editorElement.nativeElement.focus();
      this.onEditorInput();
    }
  }

  onEditorInput() {
    this.message = this.editorElement.nativeElement.innerHTML;
  }

  sendBroadcast() {
    if (!this.title || !this.message) return;
    
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.adminService.broadcastAnnouncement({
      title: this.title,
      message: this.message,
      audience: this.audience
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res.msg || 'Broadcast sent successfully!';
        this.title = '';
        this.message = '';
        this.audience = 'all';
        if (this.editorElement) {
          this.editorElement.nativeElement.innerHTML = '';
        }
        this.loadHistory(); // Refresh history
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.msg || 'Failed to send broadcast.';
      }
    });
  }

  deleteBroadcast(id: string) {
    if (confirm('Are you sure you want to delete this broadcast from the history?')) {
      this.adminService.deleteBroadcast(id).subscribe({
        next: () => {
          this.history.update(list => list.filter(b => b._id !== id));
        },
        error: () => {
          alert('Failed to delete broadcast');
        }
      });
    }
  }
}
