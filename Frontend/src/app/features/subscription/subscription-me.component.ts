import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubscriptionService } from '../../core/services/subscription.service';

@Component({
  selector: 'app-subscription-me',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sub-page">
      <div class="wrap">
        <div class="page-header">
          <h1>My Subscription</h1>
          <p>Manage your Mozhibu Premium plan and payment history</p>
        </div>

        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
          </div>
        } @else if (subscription()?.active) {
          <!-- Active Subscription Card -->
          <div class="active-card">
            <div class="active-header">
              <div>
                <div
                  class="active-badge"
                  style="display:inline-flex;align-items:center;gap:4px;"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12 2.25C10.4812 2.25 9.25 3.48122 9.25 5C9.25 5.78328 9.57756 6.48937 10.1018 6.98967C10.0375 7.10378 9.97102 7.22294 9.90223 7.34628L8.10504 10.5686C7.92732 10.8873 7.82158 11.0749 7.7325 11.2018C7.70459 11.2415 7.68483 11.2655 7.67287 11.2788L7.67118 11.2791C7.65596 11.2695 7.63012 11.2518 7.5918 11.2208C7.47104 11.1231 7.31753 10.9715 7.05879 10.7138L6.97976 10.635C6.6607 10.317 6.37058 10.0279 6.10664 9.79144C6.19926 9.54508 6.25 9.27824 6.25 9C6.25 7.75736 5.24264 6.75 4 6.75C2.75736 6.75 1.75 7.75736 1.75 9C1.75 9.98302 2.3804 10.8188 3.25898 11.1251C3.26199 11.1822 3.26564 11.2399 3.26976 11.298C3.29277 11.6228 3.33458 12.0116 3.38243 12.4564L3.5671 14.1733C3.59705 14.4517 3.62574 14.7289 3.65412 15.0031C3.76616 16.0856 3.87332 17.121 4.03322 17.994C4.1343 18.5459 4.26178 19.0659 4.43833 19.5172C4.61339 19.9648 4.8549 20.3925 5.21187 20.712C5.84173 21.2758 6.60137 21.522 7.50819 21.6381C8.38307 21.75 9.48625 21.75 10.8602 21.75H13.1398C14.5137 21.75 15.6169 21.75 16.4918 21.6381C17.3986 21.522 18.1583 21.2758 18.7881 20.712C19.1451 20.3925 19.3866 19.9648 19.5617 19.5172C19.7382 19.0659 19.8657 18.5459 19.9668 17.994C20.1267 17.1211 20.2338 16.0858 20.3459 15.0034C20.3742 14.7293 20.403 14.4516 20.4329 14.1733L20.6176 12.4565C20.6654 12.0116 20.7072 11.6228 20.7302 11.298C20.7344 11.2399 20.738 11.1822 20.741 11.1251C21.6196 10.8188 22.25 9.98302 22.25 9C22.25 7.75736 21.2426 6.75 20 6.75C18.7574 6.75 17.75 7.75736 17.75 9C17.75 9.27824 17.8007 9.54509 17.8934 9.79145C17.6294 10.0279 17.3393 10.317 17.0202 10.635L16.9412 10.7138C16.6825 10.9715 16.529 11.1231 16.4082 11.2208C16.3699 11.2518 16.344 11.2695 16.3288 11.2791L16.3271 11.2788C16.3152 11.2655 16.2954 11.2415 16.2675 11.2018C16.1784 11.0749 16.0727 10.8873 15.895 10.5686L14.0977 7.34619C14.0289 7.22288 13.9625 7.10375 13.8982 6.98967C14.4224 6.48937 14.75 5.78328 14.75 5C14.75 3.48122 13.5188 2.25 12 2.25ZM10.75 5C10.75 4.30964 11.3096 3.75 12 3.75C12.6904 3.75 13.25 4.30964 13.25 5C13.25 5.48504 12.9739 5.90689 12.5668 6.11457C12.3975 6.20095 12.2056 6.25 12 6.25C11.7944 6.25 11.6025 6.20095 11.4332 6.11457C11.0261 5.90689 10.75 5.48504 10.75 5ZM11.2046 8.09072C11.2857 7.94528 11.3599 7.81229 11.4288 7.69043C11.6133 7.72949 11.8045 7.75 12 7.75C12.1955 7.75 12.3867 7.72949 12.5712 7.69043C12.6401 7.81229 12.7143 7.94528 12.7954 8.09071L14.6016 11.3291C14.7569 11.6077 14.9005 11.8653 15.0399 12.0638C15.1885 12.2753 15.3911 12.5089 15.7015 12.6456C15.9698 12.7637 16.2657 12.8049 16.556 12.7648C16.8918 12.7184 17.1507 12.5495 17.3517 12.3869C17.5403 12.2343 17.7493 12.026 17.9756 11.8006L17.9998 11.7765C18.3752 11.4026 18.6497 11.1315 18.8593 10.9397C18.9792 11.0103 19.1061 11.0701 19.2389 11.1179C19.2374 11.1417 19.2358 11.1664 19.234 11.192C19.2131 11.4865 19.1743 11.8486 19.1249 12.3082L18.9415 14.0129C18.9095 14.3104 18.8794 14.6003 18.8502 14.8822C18.7807 15.553 18.7159 16.178 18.641 16.75H5.35903C5.28409 16.178 5.2193 15.553 5.14978 14.8822C5.12056 14.6003 5.0905 14.3104 5.0585 14.0129L4.87514 12.3082C4.82571 11.8486 4.78687 11.4865 4.76601 11.192C4.7642 11.1664 4.76255 11.1417 4.76107 11.1179C4.89386 11.0701 5.02084 11.0103 5.14066 10.9397C5.35033 11.1315 5.62484 11.4026 6.0002 11.7765L6.02438 11.8006C6.25065 12.026 6.45971 12.2343 6.64834 12.3869C6.84933 12.5495 7.10824 12.7184 7.44397 12.7648C7.73429 12.8049 8.03016 12.7637 8.29846 12.6456C8.60887 12.5089 8.81155 12.2753 8.96009 12.0638C9.09945 11.8653 9.24306 11.6078 9.39842 11.3291L11.2046 8.09072ZM5.61801 18.25C5.68337 18.526 5.75521 18.7662 5.83525 18.9708C5.96405 19.3 6.0962 19.4904 6.21228 19.5943C6.52851 19.8774 6.9509 20.0545 7.69857 20.1502C8.46719 20.2486 9.47421 20.25 10.9121 20.25H13.0879C14.5258 20.25 15.5328 20.2486 16.3014 20.1502C17.0491 20.0545 17.4715 19.8774 17.7877 19.5943C17.9038 19.4904 18.036 19.3 18.1647 18.9708C18.2448 18.7662 18.3166 18.526 18.382 18.25H5.61801ZM3.25 9C3.25 8.58579 3.58579 8.25 4 8.25C4.41421 8.25 4.75 8.58579 4.75 9C4.75 9.18789 4.68188 9.35799 4.56799 9.48982C4.4311 9.64827 4.23192 9.74737 4.00904 9.74995L4 9.75C3.58579 9.75 3.25 9.41421 3.25 9ZM19.25 9C19.25 8.58579 19.5858 8.25 20 8.25C20.4142 8.25 20.75 8.58579 20.75 9C20.75 9.41421 20.4142 9.75 20 9.75L19.991 9.74995C19.7681 9.74737 19.5689 9.64827 19.432 9.48982C19.3181 9.35799 19.25 9.18789 19.25 9Z"
                    />
                  </svg>
                  Premium Active
                </div>
                <h2>{{ subscription()!.subscription!.plan.name }}</h2>
              </div>
              <div class="days-pill">
                {{ subscription()!.subscription!.daysRemaining }} days left
              </div>
            </div>
            <div class="sub-details">
              <div class="detail-row">
                <span class="label">Status</span>
                <span class="value status-active">Active</span>
              </div>
              <div class="detail-row">
                <span class="label">Start Date</span>
                <span class="value">{{
                  formatDate(subscription()!.subscription!.startDate)
                }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Renewal Date</span>
                <span class="value">{{
                  formatDate(subscription()!.subscription!.endDate)
                }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Auto-Renew</span>
                <span class="value">{{
                  subscription()!.subscription!.autoRenew ? 'On' : 'Off'
                }}</span>
              </div>
            </div>
            <div class="action-row">
              <a routerLink="/subscription/plans" class="btn-upgrade"
                >Upgrade Plan</a
              >
              @if (subscription()!.subscription!.autoRenew) {
                <button class="btn-cancel" (click)="cancelAutoRenew()">
                  Cancel Auto-Renewal
                </button>
              }
            </div>
          </div>
        } @else {
          <!-- No Subscription -->
          <div class="empty-card">
            <div class="empty-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12 2.25C10.4812 2.25 9.25 3.48122 9.25 5C9.25 5.78328 9.57756 6.48937 10.1018 6.98967C10.0375 7.10378 9.97102 7.22294 9.90223 7.34628L8.10504 10.5686C7.92732 10.8873 7.82158 11.0749 7.7325 11.2018C7.70459 11.2415 7.68483 11.2655 7.67287 11.2788L7.67118 11.2791C7.65596 11.2695 7.63012 11.2518 7.5918 11.2208C7.47104 11.1231 7.31753 10.9715 7.05879 10.7138L6.97976 10.635C6.6607 10.317 6.37058 10.0279 6.10664 9.79144C6.19926 9.54508 6.25 9.27824 6.25 9C6.25 7.75736 5.24264 6.75 4 6.75C2.75736 6.75 1.75 7.75736 1.75 9C1.75 9.98302 2.3804 10.8188 3.25898 11.1251C3.26199 11.1822 3.26564 11.2399 3.26976 11.298C3.29277 11.6228 3.33458 12.0116 3.38243 12.4564L3.5671 14.1733C3.59705 14.4517 3.62574 14.7289 3.65412 15.0031C3.76616 16.0856 3.87332 17.121 4.03322 17.994C4.1343 18.5459 4.26178 19.0659 4.43833 19.5172C4.61339 19.9648 4.8549 20.3925 5.21187 20.712C5.84173 21.2758 6.60137 21.522 7.50819 21.6381C8.38307 21.75 9.48625 21.75 10.8602 21.75H13.1398C14.5137 21.75 15.6169 21.75 16.4918 21.6381C17.3986 21.522 18.1583 21.2758 18.7881 20.712C19.1451 20.3925 19.3866 19.9648 19.5617 19.5172C19.7382 19.0659 19.8657 18.5459 19.9668 17.994C20.1267 17.1211 20.2338 16.0858 20.3459 15.0034C20.3742 14.7293 20.403 14.4516 20.4329 14.1733L20.6176 12.4565C20.6654 12.0116 20.7072 11.6228 20.7302 11.298C20.7344 11.2399 20.738 11.1822 20.741 11.1251C21.6196 10.8188 22.25 9.98302 22.25 9C22.25 7.75736 21.2426 6.75 20 6.75C18.7574 6.75 17.75 7.75736 17.75 9C17.75 9.27824 17.8007 9.54509 17.8934 9.79145C17.6294 10.0279 17.3393 10.317 17.0202 10.635L16.9412 10.7138C16.6825 10.9715 16.529 11.1231 16.4082 11.2208C16.3699 11.2518 16.344 11.2695 16.3288 11.2791L16.3271 11.2788C16.3152 11.2655 16.2954 11.2415 16.2675 11.2018C16.1784 11.0749 16.0727 10.8873 15.895 10.5686L14.0977 7.34619C14.0289 7.22288 13.9625 7.10375 13.8982 6.98967C14.4224 6.48937 14.75 5.78328 14.75 5C14.75 3.48122 13.5188 2.25 12 2.25ZM10.75 5C10.75 4.30964 11.3096 3.75 12 3.75C12.6904 3.75 13.25 4.30964 13.25 5C13.25 5.48504 12.9739 5.90689 12.5668 6.11457C12.3975 6.20095 12.2056 6.25 12 6.25C11.7944 6.25 11.6025 6.20095 11.4332 6.11457C11.0261 5.90689 10.75 5.48504 10.75 5ZM11.2046 8.09072C11.2857 7.94528 11.3599 7.81229 11.4288 7.69043C11.6133 7.72949 11.8045 7.75 12 7.75C12.1955 7.75 12.3867 7.72949 12.5712 7.69043C12.6401 7.81229 12.7143 7.94528 12.7954 8.09071L14.6016 11.3291C14.7569 11.6077 14.9005 11.8653 15.0399 12.0638C15.1885 12.2753 15.3911 12.5089 15.7015 12.6456C15.9698 12.7637 16.2657 12.8049 16.556 12.7648C16.8918 12.7184 17.1507 12.5495 17.3517 12.3869C17.5403 12.2343 17.7493 12.026 17.9756 11.8006L17.9998 11.7765C18.3752 11.4026 18.6497 11.1315 18.8593 10.9397C18.9792 11.0103 19.1061 11.0701 19.2389 11.1179C19.2374 11.1417 19.2358 11.1664 19.234 11.192C19.2131 11.4865 19.1743 11.8486 19.1249 12.3082L18.9415 14.0129C18.9095 14.3104 18.8794 14.6003 18.8502 14.8822C18.7807 15.553 18.7159 16.178 18.641 16.75H5.35903C5.28409 16.178 5.2193 15.553 5.14978 14.8822C5.12056 14.6003 5.0905 14.3104 5.0585 14.0129L4.87514 12.3082C4.82571 11.8486 4.78687 11.4865 4.76601 11.192C4.7642 11.1664 4.76255 11.1417 4.76107 11.1179C4.89386 11.0701 5.02084 11.0103 5.14066 10.9397C5.35033 11.1315 5.62484 11.4026 6.0002 11.7765L6.02438 11.8006C6.25065 12.026 6.45971 12.2343 6.64834 12.3869C6.84933 12.5495 7.10824 12.7184 7.44397 12.7648C7.73429 12.8049 8.03016 12.7637 8.29846 12.6456C8.60887 12.5089 8.81155 12.2753 8.96009 12.0638C9.09945 11.8653 9.24306 11.6078 9.39842 11.3291L11.2046 8.09072ZM5.61801 18.25C5.68337 18.526 5.75521 18.7662 5.83525 18.9708C5.96405 19.3 6.0962 19.4904 6.21228 19.5943C6.52851 19.8774 6.9509 20.0545 7.69857 20.1502C8.46719 20.2486 9.47421 20.25 10.9121 20.25H13.0879C14.5258 20.25 15.5328 20.2486 16.3014 20.1502C17.0491 20.0545 17.4715 19.8774 17.7877 19.5943C17.9038 19.4904 18.036 19.3 18.1647 18.9708C18.2448 18.7662 18.3166 18.526 18.382 18.25H5.61801ZM3.25 9C3.25 8.58579 3.58579 8.25 4 8.25C4.41421 8.25 4.75 8.58579 4.75 9C4.75 9.18789 4.68188 9.35799 4.56799 9.48982C4.4311 9.64827 4.23192 9.74737 4.00904 9.74995L4 9.75C3.58579 9.75 3.25 9.41421 3.25 9ZM19.25 9C19.25 8.58579 19.5858 8.25 20 8.25C20.4142 8.25 20.75 8.58579 20.75 9C20.75 9.41421 20.4142 9.75 20 9.75L19.991 9.74995C19.7681 9.74737 19.5689 9.64827 19.432 9.48982C19.3181 9.35799 19.25 9.18789 19.25 9Z"
                  fill="#111827"
                />
              </svg>
            </div>
            <h2>No Active Subscription</h2>
            <p>
              Unlock all premium stories, support authors, and earn monthly
              rewards by going Premium.
            </p>
            <a routerLink="/subscription/plans" class="btn-upgrade"
              >View Plans</a
            >
          </div>
        }

        <!-- Payment History -->
        <div class="history-section">
          <h3>Payment History</h3>
          @if (history().length === 0) {
            <p class="empty-text">No payment history yet.</p>
          } @else {
            <div class="history-table">
              <div class="table-header">
                <span>Plan</span>
                <span>Amount</span>
                <span>Date</span>
                <span>Status</span>
              </div>
              @for (item of history(); track item._id) {
                <div class="table-row">
                  <span class="plan-name">{{
                    item.planSnapshot?.name || item.plan?.name || '—'
                  }}</span>
                  <span class="amount"
                    >₹{{ (item.amountPaidInPaise / 100).toFixed(2) }}</span
                  >
                  <span class="date">{{ formatDate(item.createdAt) }}</span>
                  <span class="status-badge" [class]="item.status">{{
                    item.status
                  }}</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .sub-page {
        min-height: 100vh;
        background: #ffffff;
        color: #111827;
        padding-bottom: 80px;
      }
      .wrap {
        max-width: 800px;
        margin: 0 auto;
        padding: 48px 24px;
      }
      .page-header {
        margin-bottom: 40px;
      }
      .page-header h1 {
        font-size: 32px;
        font-weight: 800;
        margin: 0 0 8px;
      }
      .page-header p {
        color: #6b7280;
        font-size: 15px;
        margin: 0;
      }

      .loading-state {
        display: flex;
        justify-content: center;
        padding: 64px;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e5e7eb;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .active-card {
        background: linear-gradient(135deg, #f8fafc, #ffffff);
        border: 1px solid #6366f1;
        border-radius: 20px;
        padding: 32px;
        margin-bottom: 40px;
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.1);
      }
      .active-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
        gap: 16px;
      }
      .active-badge {
        background: rgba(99, 102, 241, 0.1);
        color: #4f46e5;
        padding: 4px 12px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 700;
        display: inline-block;
        margin-bottom: 8px;
      }
      .active-header h2 {
        font-size: 24px;
        font-weight: 800;
        margin: 0;
      }
      .days-pill {
        background: rgba(99, 102, 241, 0.1);
        color: #4f46e5;
        padding: 8px 18px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 700;
        white-space: nowrap;
      }
      .sub-details {
        border-top: 1px solid #e5e7eb;
        border-bottom: 1px solid #e5e7eb;
        padding: 16px 0;
        margin-bottom: 24px;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 14px;
      }
      .label {
        color: #6b7280;
      }
      .value {
        color: #111827;
        font-weight: 500;
      }
      .status-active {
        color: #059669;
      }
      .action-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .btn-upgrade {
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 14px;
        text-decoration: none;
        border: none;
        cursor: pointer;
      }
      .btn-cancel {
        background: transparent;
        border: 1px solid #fecaca;
        color: #ef4444;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
      }
      .btn-cancel:hover {
        background: rgba(239, 68, 68, 0.05);
      }

      .empty-card {
        background: #f9fafb;
        border: 1px dashed #d1d5db;
        border-radius: 20px;
        padding: 48px;
        text-align: center;
        margin-bottom: 40px;
      }
      .empty-icon {
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
      }
      .empty-card h2 {
        font-size: 22px;
        font-weight: 700;
        margin: 0 0 10px;
      }
      .empty-card p {
        color: #6b7280;
        max-width: 400px;
        margin: 0 auto 24px;
        font-size: 15px;
      }

      .history-section h3 {
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 20px;
      }
      .empty-text {
        color: #6b7280;
        font-size: 14px;
      }
      .history-table {
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
      }
      .table-header {
        display: grid;
        grid-template-columns: 2fr 1fr 1.5fr 1fr;
        padding: 12px 20px;
        background: #f9fafb;
        font-size: 12px;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
      }
      .table-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1.5fr 1fr;
        padding: 14px 20px;
        border-top: 1px solid #e5e7eb;
        font-size: 14px;
        align-items: center;
        background: #ffffff;
      }
      .table-row:hover {
        background: #f3f4f6;
      }
      .plan-name {
        color: #111827;
        font-weight: 500;
      }
      .amount {
        color: #111827;
        font-weight: 700;
      }
      .date {
        color: #6b7280;
      }
      .status-badge {
        padding: 3px 10px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        text-align: center;
        width: fit-content;
      }
      .status-badge.active {
        background: #d1fae5;
        color: #065f46;
      }
      .status-badge.expired {
        background: #fee2e2;
        color: #b91c1c;
      }
      .status-badge.cancelled {
        background: #f3e8ff;
        color: #7e22ce;
      }

      @media (max-width: 600px) {
        .table-header,
        .table-row {
          grid-template-columns: 2fr 1fr 1fr;
        }
        .table-header span:nth-child(3),
        .table-row .date {
          display: none;
        }
      }
    `,
  ],
})
export class SubscriptionMeComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);

  subscription = signal<any>(null);
  history = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.subscriptionService.getMySubscription().subscribe({
      next: (sub) => {
        this.subscription.set(sub);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    this.subscriptionService.getPaymentHistory().subscribe({
      next: (h) => this.history.set(h),
      error: () => {},
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  cancelAutoRenew() {
    if (
      confirm(
        'Are you sure you want to cancel auto-renewal? Your subscription will remain active until expiry.',
      )
    ) {
      this.subscriptionService.cancelAutoRenew().subscribe({
        next: () => {
          const sub = this.subscription();
          if (sub?.subscription) {
            this.subscription.set({
              ...sub,
              subscription: { ...sub.subscription, autoRenew: false },
            });
          }
        },
      });
    }
  }
}
