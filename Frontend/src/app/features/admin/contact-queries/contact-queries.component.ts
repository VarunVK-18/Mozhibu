import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

interface ContactQuery {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read';
  createdAt: string;
}

@Component({
  selector: 'app-contact-queries',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h1>Contact Queries</h1>
        <p>Manage and respond to user inquiries from the Contact Us page.</p>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let query of queries()" [class.unread]="query.status === 'new'">
                <td class="text-nowrap">{{ query.createdAt | date:'mediumDate' }}</td>
                <td class="font-medium">{{ query.name }}</td>
                <td>{{ query.email }}</td>
                <td class="message-cell" [title]="query.message">
                  {{ query.message.length > 50 ? (query.message | slice:0:50) + '...' : query.message }}
                </td>
                <td>
                  <span class="badge" [class.badge-new]="query.status === 'new'" [class.badge-read]="query.status === 'read'">
                    {{ query.status | titlecase }}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <button class="btn btn-sm btn-outline" (click)="viewQuery(query)">
                      View
                    </button>
                    <button 
                      *ngIf="query.status === 'new'"
                      class="btn btn-sm btn-outline-primary" 
                      (click)="markAsRead(query._id)"
                      [disabled]="isLoading()"
                    >
                      Mark as Read
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr *ngIf="queries().length === 0 && !isLoading()">
                <td colspan="6" class="text-center py-8 text-gray-500">
                  No contact queries found.
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="isLoading()" class="loading-state">
            <div class="loader"></div>
            <p>Loading queries...</p>
          </div>
        </div>
      </div>

      <!-- Modal for viewing full message -->
      <div class="modal-overlay" *ngIf="selectedQuery()" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Query Details</h2>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ selectedQuery()?.name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ selectedQuery()?.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">{{ selectedQuery()?.createdAt | date:'medium' }}</span>
            </div>
            <div class="message-section">
              <span class="detail-label">Message:</span>
              <div class="full-message">{{ selectedQuery()?.message }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="closeModal()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .header {
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      color: #111;
      margin-bottom: 8px;
    }
    .header p {
      color: #666;
      font-size: 14px;
    }
    .card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .table th, .table td {
      padding: 16px 24px;
      border-bottom: 1px solid #eee;
    }
    .table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #444;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .table td {
      font-size: 14px;
      color: #333;
      vertical-align: middle;
    }
    .table tr:last-child td {
      border-bottom: none;
    }
    tr.unread td {
      background-color: #f8fbfb;
    }
    tr.unread td.font-medium {
      font-weight: 700;
    }
    .message-cell {
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #555;
    }
    .text-nowrap {
      white-space: nowrap;
    }
    .font-medium {
      font-weight: 500;
    }
    .text-center {
      text-align: center;
    }
    .py-8 {
      padding-top: 32px;
      padding-bottom: 32px;
    }
    .text-gray-500 {
      color: #6b7280;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-new {
      background: #e3f2fd;
      color: #1976d2;
    }
    .badge-read {
      background: #f1f3f5;
      color: #6c757d;
    }
    
    .btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-sm {
      padding: 4px 10px;
      font-size: 12px;
    }
    .btn-outline {
      background: transparent;
      border: 1px solid #ddd;
      color: #333;
    }
    .btn-outline:hover:not(:disabled) {
      background: #f8f9fa;
      border-color: #ccc;
    }
    .btn-outline-primary {
      background: transparent;
      border: 1px solid #1976d2;
      color: #1976d2;
    }
    .btn-outline-primary:hover:not(:disabled) {
      background: #e3f2fd;
    }
    .btn-primary {
      background: #111;
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) {
      background: #333;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
    }
    .modal-content {
      background: #fff;
      border-radius: 8px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      line-height: 1;
    }
    .close-btn:hover {
      color: #111;
    }
    .modal-body {
      padding: 24px;
      overflow-y: auto;
    }
    .detail-row {
      margin-bottom: 12px;
      display: flex;
    }
    .detail-label {
      width: 80px;
      font-weight: 600;
      color: #555;
      font-size: 14px;
    }
    .detail-value {
      flex: 1;
      color: #111;
      font-size: 14px;
    }
    .message-section {
      margin-top: 24px;
    }
    .full-message {
      margin-top: 8px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      white-space: pre-wrap;
    }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
    }
    
    .loading-state {
      padding: 48px;
      text-align: center;
      color: #666;
    }
    .loader {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #333;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin: 0 auto 12px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ContactQueriesComponent implements OnInit {
  private apiService = inject(ApiService);
  
  queries = signal<ContactQuery[]>([]);
  isLoading = signal<boolean>(true);
  selectedQuery = signal<ContactQuery | null>(null);

  ngOnInit() {
    this.loadQueries();
  }

  loadQueries() {
    this.isLoading.set(true);
    this.apiService.get<ContactQuery[]>('/contact').subscribe({
      next: (data) => {
        this.queries.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load contact queries', err);
        this.isLoading.set(false);
      }
    });
  }

  viewQuery(query: ContactQuery) {
    this.selectedQuery.set(query);
    if (query.status === 'new') {
      this.markAsRead(query._id);
    }
  }

  closeModal() {
    this.selectedQuery.set(null);
  }

  markAsRead(id: string) {
    this.apiService.put<any>(`/contact/${id}/read`, {}).subscribe({
      next: () => {
        this.queries.update(qs => qs.map(q => q._id === id ? { ...q, status: 'read' } : q));
        if (this.selectedQuery() && this.selectedQuery()?._id === id) {
          this.selectedQuery.update(q => q ? { ...q, status: 'read' } : null);
        }
      },
      error: (err) => console.error('Failed to mark as read', err)
    });
  }
}
