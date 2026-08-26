import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, AdminBook } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-competition',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-page-container">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1>Competition Management</h1>
          <p>Manage the active competition banner, notify writers, and pick a winner.</p>
        </div>
        <button class="btn-primary" (click)="notifyWriters()" [disabled]="isNotifying || !config.isActive">
          {{ isNotifying ? 'Notifying...' : 'Broadcast Invite to Writers' }}
        </button>
      </div>

      <div class="card">
        @if (isLoading) {
          <div class="loading">Loading configuration...</div>
        } @else {
          <form (ngSubmit)="saveConfig()" #configForm="ngForm">
            
            <div class="toggle-group">
              <label class="toggle">
                <input type="checkbox" name="isActive" [(ngModel)]="config.isActive" (change)="saveConfig()">
                <span class="slider"></span>
              </label>
              <div class="toggle-info">
                <span class="toggle-title">Enable Banner</span>
                <span class="toggle-desc">Show the competition banner on the homepage.</span>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Tag (Eyebrow Text)</label>
                <input type="text" name="tag" [(ngModel)]="config.tag" required placeholder="e.g. Writing competition">
              </div>

              <div class="form-group">
                <label>Main Title</label>
                <input type="text" name="title" [(ngModel)]="config.title" required placeholder="e.g. The Twelve Tongues Prize 2026">
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea name="description" [(ngModel)]="config.description" rows="3" required placeholder="Description..."></textarea>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>End Date (Countdown Target)</label>
                <input type="datetime-local" name="endDate" [(ngModel)]="config.endDate" required>
              </div>

              <div class="form-group">
                <label>Button Text</label>
                <input type="text" name="buttonText" [(ngModel)]="config.buttonText" required placeholder="e.g. Submit your story">
              </div>

              <div class="form-group" style="grid-column: 1 / -1;">
                <label>Button Destination URL</label>
                <input type="text" name="buttonLink" [(ngModel)]="config.buttonLink" required placeholder="e.g. /write/new?competition=TwelveTongues2026 or https://google.com">
                <small style="color: var(--ink-soft); display: block; margin-top: 6px;">Use an internal path like /write/new or a full external URL like https://...</small>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="!configForm.valid || isSaving">
                {{ isSaving ? 'Saving...' : 'Save Configuration' }}
              </button>
            </div>

            @if (successMessage) {
              <div class="alert success">{{ successMessage }}</div>
            }
            @if (errorMessage) {
              <div class="alert error">{{ errorMessage }}</div>
            }
          </form>
        }
      </div>

      <div class="card" style="margin-top: 24px;">
        <h2>Submitted Entries</h2>
        <p style="color: var(--ink-soft); font-size: 14px; margin-bottom: 24px;">
          Books published by authors with the current competition tag: <strong>{{ config.tag || 'None' }}</strong>
        </p>

        @if (isLoadingEntries) {
          <div class="loading">Loading entries...</div>
        } @else if (entries.length === 0) {
          <div class="empty-state">No entries found for this competition tag yet.</div>
        } @else {
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Submitted At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let entry of entries">
                  <td>
                    <div class="book-info">
                      <strong>{{ entry.title }}</strong>
                      <span class="genre-badge">{{ entry.genre }}</span>
                    </div>
                  </td>
                  <td>{{ entry.author.username }}</td>
                  <td>{{ entry.submittedAt | date:'mediumDate' }}</td>
                  <td>
                    <button class="btn-outline btn-small" [routerLink]="['/book', entry._id]" style="margin-right: 8px;">View Book</button>
                    <button 
                      class="btn-primary btn-small" 
                      style="background: var(--honey); color: var(--ink); border-color: var(--honey);"
                      (click)="announceWinner(entry._id)"
                      [disabled]="isAnnouncing">
                      🏆 Pick Winner
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./competition.component.css']
})
export class AdminCompetitionComponent implements OnInit {
  private adminService = inject(AdminService);
  
  isLoading = true;
  isLoadingEntries = false;
  isSaving = false;
  isNotifying = false;
  isAnnouncing = false;
  successMessage = '';
  errorMessage = '';

  entries: AdminBook[] = [];

  config: any = {
    isActive: false,
    tag: '',
    title: '',
    description: '',
    endDate: '',
    buttonText: ''
  };

  ngOnInit() {
    this.loadConfig();
    this.loadEntries();
  }

  loadEntries() {
    this.isLoadingEntries = true;
    this.adminService.getCompetitionEntries().subscribe({
      next: (entries) => {
        this.entries = entries;
        this.isLoadingEntries = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingEntries = false;
      }
    });
  }

  loadConfig() {
    this.adminService.getCompetitionConfig().subscribe({
      next: (data) => {
        this.config = { ...data };
        if (this.config.endDate) {
          // Format for datetime-local input
          const date = new Date(this.config.endDate);
          this.config.endDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load configuration';
      }
    });
  }

  saveConfig() {
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = { ...this.config };
    if (payload.endDate) {
      payload.endDate = new Date(payload.endDate).toISOString();
    }

    this.adminService.updateCompetitionConfig(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.successMessage = 'Banner configuration updated successfully!';
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = 'Failed to save configuration';
      }
    });
  }

  notifyWriters() {
    if (!confirm('This will send a notification to ALL writers on the platform to join this competition. Proceed?')) return;
    this.isNotifying = true;
    this.adminService.sendCompetitionNotification(`The "${this.config.title}" competition is now open! Click here to submit your story.`).subscribe({
      next: () => {
        this.isNotifying = false;
        alert('All writers have been notified successfully.');
      },
      error: (err) => {
        console.error(err);
        this.isNotifying = false;
        alert('Failed to send notifications.');
      }
    });
  }

  announceWinner(bookId: string) {
    if (!confirm('Are you sure? This will immediately end the competition, set this book as the winner, and notify EVERYONE on the platform!')) return;
    this.isAnnouncing = true;
    this.adminService.announceCompetitionWinner(bookId).subscribe({
      next: (res) => {
        this.isAnnouncing = false;
        this.config = res.competition;
        alert('Winner announced successfully! The competition is now closed.');
      },
      error: (err) => {
        console.error(err);
        this.isAnnouncing = false;
        alert('Failed to announce winner.');
      }
    });
  }
}
