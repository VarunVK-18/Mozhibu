import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

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
            <label for="message">Message</label>
            <textarea id="message" name="message" [(ngModel)]="message" required rows="4" placeholder="Type your full announcement here..."></textarea>
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
    </div>
  `,
  styleUrls: ['./broadcast.component.css']
})
export class BroadcastComponent {
  private adminService = inject(AdminService);

  title = '';
  message = '';
  audience = 'all';

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  sendBroadcast() {
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
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.msg || 'Failed to send broadcast.';
      }
    });
  }
}
