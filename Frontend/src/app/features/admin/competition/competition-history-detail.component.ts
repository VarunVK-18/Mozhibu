import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-competition-history-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="page-header" style="display: flex; align-items: center; gap: 16px;">
        <a routerLink="/admin/competition" class="btn-outline btn-small" style="text-decoration: none;">&larr; Back to Competitions</a>
        <div>
          <h1>Competition History Detail</h1>
          <p>View the submitted entries and final winners for this competition.</p>
        </div>
      </div>

      @if (isLoading) {
        <div class="loading">Loading details...</div>
      } @else if (competition) {
        <div class="card" style="margin-bottom: 24px;">
          <h2>{{ competition.title }}</h2>
          <p style="color: var(--ink-soft); font-size: 14px; margin-bottom: 16px;">
            Tag: <strong>{{ competition.tag }}</strong> &bull; Closed on: <strong>{{ competition.updatedAt | date: 'mediumDate' }}</strong>
          </p>
          <p>{{ competition.description }}</p>
        </div>

        <div class="card" style="margin-bottom: 24px;">
          <h2>Winners ({{ competition.winnerBookIds?.length || 0 }})</h2>
          @if (!competition.winnerBookIds?.length) {
            <div class="empty-state">No winners were announced for this competition.</div>
          } @else {
            <div class="table-container">
              <div class="entries-grid">
                <div *ngFor="let winner of competition.winnerBookIds" class="entry-card" style="border: 2px solid var(--forest); background: rgba(0,0,0,0.02);">
                  <div class="entry-cover-wrapper" [routerLink]="['/admin/books', winner._id]">
                    <img [src]="winner.cover || api.getFallbackCover()" alt="Cover" class="entry-cover" (error)="onCoverError($event)" />
                    <div class="entry-badges">
                      <span class="badge success-badge">WINNER</span>
                    </div>
                  </div>
                  <div class="entry-details">
                    <h3 class="entry-title">{{ winner.title }}</h3>
                    <p class="entry-author">By <strong>{{ winner.author.username }}</strong></p>
                    <p class="entry-date">Submitted: {{ winner.submittedAt | date: 'mediumDate' }}</p>
                    <div class="entry-actions">
                      <button class="btn-primary btn-small" [routerLink]="['/admin/books', winner._id]">View Details</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="card">
          <h2>All Submitted Entries ({{ entries.length }})</h2>
          @if (entries.length === 0) {
            <div class="empty-state">No entries were submitted.</div>
          } @else {
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let entry of entries">
                    <td><strong>{{ entry.title }}</strong></td>
                    <td>{{ entry.author.username }}</td>
                    <td><span class="badge genre-badge">{{ entry.genre }}</span></td>
                    <td>{{ entry.submittedAt | date: 'mediumDate' }}</td>
                    <td>
                      <span class="badge" [ngClass]="{'success-badge': entry.status === 'published'}">
                        {{ entry.status }}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <a [routerLink]="['/admin/books', entry._id]" class="btn-outline btn-small">View</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">Competition details not found.</div>
      }
    </div>
  `,
  styleUrls: ['./competition.component.css']
})
export class CompetitionHistoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);
  api = inject(ApiService);

  isLoading = true;
  competition: any = null;
  entries: any[] = [];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.adminService.getCompetitionDetails(id).subscribe({
        next: (res) => {
          this.competition = res.competition;
          this.entries = res.entries;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  onCoverError(event: any) {
    event.target.src = this.api.getFallbackCover();
  }
}
