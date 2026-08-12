import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-competition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-container">
      <div class="page-header">
        <h1>Competition Banner</h1>
        <p>Manage the dynamic promotional banner on the homepage.</p>
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
    </div>
  `,
  styleUrls: ['./competition.component.css']
})
export class AdminCompetitionComponent implements OnInit {
  private adminService = inject(AdminService);
  
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

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
}
