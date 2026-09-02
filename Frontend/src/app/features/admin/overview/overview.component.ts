import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to the Super Admin control panel.</p>
      </header>

      @if (loading()) {
        <div class="loading-state">Loading analytics...</div>
      } @else if (errorMsg()) {
        <div class="error-state">
          <p>{{ errorMsg() }}</p>
          <button (click)="forceLogout()" class="btn btn-outline">
            Log Out & Re-authenticate
          </button>
        </div>
      } @else if (stats()) {
        <div class="dashboard-grid">
          <!-- Top Stats Row -->
          <div class="metrics-row">
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon users-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
              </div>
              <div class="stat-label">Total Users</div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.totalUsers }}</div>
                <div class="trend positive">
                  ↑ {{ getTrend(stats()!.monthlyUsersData) }}%
                </div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon books-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path
                      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="stat-label">Published Books</div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.totalPublishedBooks }}</div>
                <div class="trend positive">
                  ↑ {{ getTrend(stats()!.monthlyBooksData) }}%
                </div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon authors-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 20h9"></path>
                    <path
                      d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="stat-label">Total Writers</div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.writers }}</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <div
                  class="stat-icon readers-icon"
                  style="color: var(--blue); background: var(--blue-tint);"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path
                      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="stat-label">Total Readers</div>
              <div class="stat-bottom">
                <div class="stat-value">{{ stats()!.readers }}</div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="charts-row">
            <!-- Unified Analytics Chart -->
            <div class="analytics-card card-panel">
              <div class="analytics-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; font-family: var(--display);">Visitors</h3>
                <div class="time-tabs" style="display: flex; gap: 8px;">
                  @for (opt of ['ALL', '1M', '6M', '1Y']; track opt) {
                    <button
                      class="time-tab"
                      (click)="selectSort(opt)"
                      style="padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s;"
                      [style.background]="opt === currentSort() ? '#94a3b8' : '#f1f5f9'"
                      [style.color]="opt === currentSort() ? 'white' : '#475569'"
                    >
                      {{ opt }}
                    </button>
                  }
                </div>
              </div>

              <div class="analytics-metrics" style="display: flex; justify-content: space-around; margin-bottom: 40px; text-align: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 24px;">
                <div class="metric-item" style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                  <span class="label" style="font-size: 14px; font-weight: 500; color: #64748b;">Today</span>
                  <span class="value" style="font-family: var(--display); font-size: 24px; font-weight: 700; color: #1e293b;">{{ stats()!.readers }}</span>
                </div>
                <div class="metric-item" style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                  <span class="label" style="font-size: 14px; font-weight: 500; color: #64748b;">This Month</span>
                  <div style="display: flex; align-items: baseline; gap: 8px;">
                    <span class="value" style="font-family: var(--display); font-size: 24px; font-weight: 700; color: #1e293b;">{{ stats()!.totalUsers }}</span>
                    <span class="trend positive" style="font-size: 12px; font-weight: 600; color: #10b981; background: transparent; padding: 0;">{{ getTrend(stats()!.monthlyUsersData) }}% ↑</span>
                  </div>
                </div>
                <div class="metric-item" style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                  <span class="label" style="font-size: 14px; font-weight: 500; color: #64748b;">This Year</span>
                  <div style="display: flex; align-items: baseline; gap: 8px;">
                    <span class="value" style="font-family: var(--display); font-size: 24px; font-weight: 700; color: #1e293b;">{{ stats()!.totalPublishedBooks }}</span>
                    <span class="trend positive" style="font-size: 12px; font-weight: 600; color: #10b981; background: transparent; padding: 0;">{{ getTrend(stats()!.monthlyBooksData) }}% ↑</span>
                  </div>
                </div>
              </div>

              <div class="chart-legend" style="display: flex; justify-content: flex-end; gap: 16px; margin-bottom: -16px; position: relative; z-index: 2;">
                <div class="legend-item" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #64748b;">
                  <span class="dot" style="width: 12px; height: 12px; border-radius: 50%; background: #6366f1;"></span> Current
                </div>
                <div class="legend-item" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #64748b;">
                  <span class="dot" style="width: 12px; height: 12px; border-radius: 50%; background: #f59e0b;"></span> Previous
                </div>
              </div>

              <div class="analytics-chart-wrapper">
                <div class="y-axis">
                  <span>{{ maxUsers() }}</span>
                  <span>{{ maxUsers() / 2 | number: '1.0-0' }}</span>
                  <span>0</span>
                </div>

                <div class="chart-container">
                  <svg
                    class="unified-chart"
                    viewBox="0 0 1000 260"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="blueGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3" />
                        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
                      </linearGradient>
                      <linearGradient id="orangeGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.2" />
                        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.0" />
                      </linearGradient>
                    </defs>

                    <!-- Horizontal Grid Lines -->
                    <line x1="0" y1="50" x2="1000" y2="50" stroke="#f1f5f9" stroke-width="1" />
                    <line x1="0" y1="150" x2="1000" y2="150" stroke="#f1f5f9" stroke-width="1" />
                    <line x1="0" y1="250" x2="1000" y2="250" stroke="#f1f5f9" stroke-width="1" />

                    <!-- Previous (Books) Smooth Area -->
                    <path
                      [attr.d]="getAreaPath(stats()!.monthlyBooksData, true, true)"
                      fill="url(#orangeGradient)"
                    />
                    <path
                      [attr.d]="getAreaPath(stats()!.monthlyBooksData, false, true)"
                      fill="none"
                      stroke="#f59e0b"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <!-- Previous Points -->
                    @for (val of stats()!.monthlyBooksData; track $index) {
                      <circle
                        [attr.cx]="getBarX($index, stats()!.monthlyBooksData.length)"
                        [attr.cy]="getPointY(val, maxUsers())"
                        r="4"
                        fill="white"
                        stroke="#f59e0b"
                        stroke-width="2"
                      />
                    }

                    <!-- Current (Users) Smooth Area -->
                    <path
                      [attr.d]="getAreaPath(stats()!.monthlyUsersData, true, true)"
                      fill="url(#blueGradient)"
                    />
                    <path
                      [attr.d]="getAreaPath(stats()!.monthlyUsersData, false, true)"
                      fill="none"
                      stroke="#6366f1"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <!-- Current Points -->
                    @for (val of stats()!.monthlyUsersData; track $index) {
                      <circle
                        [attr.cx]="getBarX($index, stats()!.monthlyUsersData.length)"
                        [attr.cy]="getPointY(val, maxUsers())"
                        r="4"
                        fill="white"
                        stroke="#6366f1"
                        stroke-width="2"
                      />
                    }
                    
                    <!-- Hover Areas (Invisible Rectangles for tooltips) -->
                    @for (label of stats()!.chartLabels; track $index) {
                      <rect
                        [attr.x]="getBarX($index, stats()!.chartLabels.length) - (1000 / (stats()!.chartLabels.length > 1 ? stats()!.chartLabels.length - 1 : 1)) / 2"
                        y="0"
                        [attr.width]="1000 / (stats()!.chartLabels.length > 1 ? stats()!.chartLabels.length - 1 : 1)"
                        height="250"
                        fill="transparent"
                        (mouseenter)="hoverIndex.set($index)"
                        (mouseleave)="hoverIndex.set(null)"
                        style="cursor: pointer;"
                      />
                    }

                    <!-- Tooltip Line & Active Points -->
                    @if (hoverIndex() !== null) {
                      <line
                        [attr.x1]="getBarX(hoverIndex()!, stats()!.chartLabels.length)"
                        y1="50"
                        [attr.x2]="getBarX(hoverIndex()!, stats()!.chartLabels.length)"
                        y2="250"
                        stroke="#94a3b8"
                        stroke-width="1"
                        stroke-dasharray="4 4"
                        pointer-events="none"
                      />
                      <circle
                        [attr.cx]="getBarX(hoverIndex()!, stats()!.monthlyBooksData.length)"
                        [attr.cy]="getPointY(stats()!.monthlyBooksData[hoverIndex()!], maxUsers())"
                        r="6"
                        fill="white"
                        stroke="#f59e0b"
                        stroke-width="3"
                        pointer-events="none"
                      />
                      <circle
                        [attr.cx]="getBarX(hoverIndex()!, stats()!.monthlyUsersData.length)"
                        [attr.cy]="getPointY(stats()!.monthlyUsersData[hoverIndex()!], maxUsers())"
                        r="6"
                        fill="white"
                        stroke="#6366f1"
                        stroke-width="3"
                        pointer-events="none"
                      />
                    }
                  </svg>

                  <div class="x-axis">
                    @for (label of stats()!.chartLabels; track $index) {
                      <span style="flex: 1; text-align: center;">{{ label }}</span>
                    }
                  </div>
                  
                  <!-- HTML Tooltip Box -->
                  @if (hoverIndex() !== null) {
                    <div
                      class="chart-tooltip"
                      [style.left]="(getBarX(hoverIndex()!, stats()!.chartLabels.length) / 1000) * 100 + '%'"
                    >
                      <div class="tooltip-header">{{ stats()!.chartLabels[hoverIndex()!] }}</div>
                      <div class="tooltip-row">
                        <span class="dot" style="background: #6366f1;"></span> Current: <strong>{{ stats()!.monthlyUsersData[hoverIndex()!] }}</strong>
                      </div>
                      <div class="tooltip-row">
                        <span class="dot" style="background: #f59e0b;"></span> Previous: <strong>{{ stats()!.monthlyBooksData[hoverIndex()!] }}</strong>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Target Chart -->
            <div class="target-card card-panel">
              <div class="panel-header">
                <h3>User Distribution</h3>
                <p>Percentage of readers vs total users</p>
              </div>
              <div class="target-chart">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path
                    class="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="circle blue-circle"
                    [attr.stroke-dasharray]="getReadersRatio() + ', 100'"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" class="percentage">
                    {{ getReadersRatio() | number: '1.0-0' }}%
                  </text>
                </svg>
              </div>
              <div class="target-footer">
                <div class="target-stat">
                  <span>Readers</span>
                  <strong>{{ stats()!.readers }}</strong>
                </div>
                <div class="target-stat">
                  <span>Writers</span>
                  <strong>{{ stats()!.writers }}</strong>
                </div>
              </div>
            </div>
          </div>
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
        margin-bottom: 24px;
      }
      .page-header h1 {
        font-family: var(--display);
        font-size: 24px;
        color: var(--ink);
        margin-bottom: 4px;
      }
      .page-header p {
        color: var(--ink-soft);
        font-size: 14px;
      }

      .loading-state {
        padding: 48px;
        text-align: center;
        color: var(--ink-soft);
      }
      .error-state {
        padding: 48px;
        text-align: center;
        color: var(--rose);
        background: var(--rose-tint);
        border-radius: var(--radius-m);
      }
      .error-state p {
        margin-bottom: 16px;
        font-weight: 500;
      }
      .btn-outline {
        padding: 8px 16px;
        border: 1px solid var(--rose);
        color: var(--rose);
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
      }

      .dashboard-grid {
        display: flex;
        flex-direction: column;
        gap: 32px;
      }

      .metrics-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
      }

      .charts-row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
      }

      .bottom-row {
        width: 100%;
      }

      .card-panel {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-l);
        padding: 32px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        transition: box-shadow 0.3s ease;
      }
      .card-panel:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
      }
      .panel-header h3 {
        font-family: var(--display);
        font-size: 16px;
        font-weight: 600;
        color: var(--ink);
        margin-bottom: 4px;
      }
      .panel-header p {
        font-size: 13px;
        color: var(--ink-soft);
      }

      .stat-card {
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-l);
        padding: 24px;
        text-decoration: none;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
      }
      .stat-header {
        margin-bottom: 16px;
        position: relative;
        z-index: 2;
      }
      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      .users-icon {
        background: transparent;
        color: var(--ink);
      }
      .books-icon {
        background: transparent;
        color: var(--ink);
      }
      .pending-icon {
        background: transparent;
        color: var(--ink);
      }
      .approval-icon {
        background: transparent;
        color: var(--ink);
      }

      .stat-label {
        font-size: 13px;
        color: var(--ink-soft);
        font-weight: 400;
        margin-bottom: 8px;
        position: relative;
        z-index: 2;
      }
      .stat-bottom {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        position: relative;
        z-index: 2;
      }
      .stat-value {
        font-family: var(--display);
        font-size: 28px;
        font-weight: 500;
        color: var(--ink);
        line-height: 1;
      }
      .trend {
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 100px;
      }
      .trend.positive {
        background: var(--forest-tint);
        color: var(--forest-deep);
      }

      /* Target Chart */
      .target-card {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .target-chart {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 0;
      }
      .circular-chart {
        display: block;
        margin: 0 auto;
        max-width: 180px;
        max-height: 250px;
      }
      .circle-bg {
        fill: none;
        stroke: var(--paper-soft);
        stroke-width: 2.5;
      }
      .circle {
        fill: none;
        stroke-width: 2.5;
        stroke-linecap: round;
        animation: progress 1s ease-out forwards;
      }
      .circle.blue-circle {
        stroke: #3b82f6; /* Vibrant blue color */
      }
      @keyframes progress {
        0% {
          stroke-dasharray: 0 100;
        }
      }
      .percentage {
        fill: var(--ink);
        font-family: var(--display);
        font-size: 8px;
        font-weight: 700;
        text-anchor: middle;
      }
      .target-footer {
        display: flex;
        justify-content: space-between;
        border-top: 1px solid var(--border-soft);
        padding-top: 16px;
        margin-top: auto;
      }
      .target-stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .target-stat span {
        font-size: 13px;
        color: var(--ink-soft);
      }
      .target-stat strong {
        font-size: 18px;
        color: var(--ink);
      }

      /* Unified Analytics Chart */
      .analytics-card {
        margin-top: 0;
      }
      .analytics-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .analytics-header h3 {
        font-family: var(--body);
        font-size: 16px;
        font-weight: 600;
        color: #475569;
      }
      .header-right .sort-by {
        font-size: 13px;
        color: #64748b;
        cursor: pointer;
        user-select: none;
      }
      .header-right .sort-by strong {
        color: #334155;
      }

      .sort-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: var(--card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 10;
        min-width: 120px;
        margin-top: 8px;
        overflow: hidden;
      }
      .sort-option {
        padding: 8px 16px;
        font-size: 13px;
        color: var(--ink);
        cursor: pointer;
        transition: background 0.2s;
      }
      .sort-option:hover {
        background: var(--paper-warm);
      }
      .sort-option.active {
        font-weight: 600;
        background: var(--forest-tint);
        color: var(--forest-deep);
      }

      .analytics-metrics {
        display: flex;
        align-items: center;
        gap: 32px;
        margin-bottom: 40px;
      }
      .metric-item {
        display: flex;
        align-items: baseline;
        gap: 12px;
      }
      .metric-item.primary .value {
        color: #6366f1;
      }
      .metric-item .value {
        font-family: var(--display);
        font-size: 32px;
        font-weight: 600;
        color: #1e293b;
      }
      .metric-item .label {
        font-size: 14px;
        font-weight: 500;
        color: #94a3b8;
      }
      .metric-divider {
        width: 1px;
        height: 32px;
        background: #e2e8f0;
      }

      .chart-tooltip {
        position: absolute;
        top: 20px;
        transform: translateX(-50%);
        background: white;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        z-index: 10;
        min-width: 130px;
        pointer-events: none;
      }
      .tooltip-header {
        font-size: 13px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--border-soft);
      }
      .tooltip-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #64748b;
        margin-bottom: 4px;
      }
      .tooltip-row:last-child {
        margin-bottom: 0;
      }
      .tooltip-row .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .tooltip-row strong {
        color: #1e293b;
        margin-left: auto;
      }

      .analytics-chart-wrapper {
        display: flex;
        height: 300px;
        position: relative;
      }

      .y-axis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 500;
        color: #94a3b8;
        padding-top: 55px;
        padding-right: 24px;
        padding-bottom: 24px;
        text-align: right;
        width: 40px;
      }

      .chart-container {
        flex: 1;
        position: relative;
      }

      .unified-chart {
        width: 100%;
        height: calc(100% - 24px); /* Leave room for x-axis */
        overflow: visible;
      }

      .x-axis {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 500;
        color: #94a3b8;
      }

      .chart-legend {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-top: 24px;
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 500;
        color: #64748b;
      }
      .legend-item .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      /* ── Mobile Responsive ─────────────────── */
      @media (max-width: 1024px) {
        .dashboard-grid {
          gap: 16px;
        }
      }
      @media (max-width: 768px) {
        .page-header {
          padding: 24px 0 16px;
        }
        .page-header h1 {
          font-size: 22px;
        }
        .metrics-row {
          grid-template-columns: repeat(2, 1fr);
        }
        .analytics-metrics {
          flex-wrap: wrap;
          gap: 16px;
        }
        .metric-divider {
          display: none;
        }
        .analytics-chart-wrapper {
          height: 200px;
        }
      }
      @media (max-width: 480px) {
        .metrics-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class OverviewComponent implements OnInit {
  adminService = inject(AdminService);
  authService = inject(AuthService);
  router = inject(Router);

  stats = signal<AdminStats | null>(null);
  loading = signal(true);
  errorMsg = signal<string | null>(null);

  baseStats: AdminStats | null = null;

  sortOptions = ['1Y', '6M', '1M', 'ALL'];
  currentSort = signal('1Y');
  sortDropdownOpen = signal(false);
  hoverIndex = signal<number | null>(null);

  toggleSortDropdown() {
    this.sortDropdownOpen.update((v) => !v);
  }

  selectSort(option: string) {
    this.currentSort.set(option);
    this.sortDropdownOpen.set(false);

    if (!this.baseStats) return;

    // Deep copy to mutate for visual effect
    const newData = JSON.parse(JSON.stringify(this.baseStats)) as AdminStats;

    if (option === '1Y') {
      // Keep default Yearly data
    } else if (option === '6M') {
      newData.chartLabels = newData.chartLabels.slice(6);
      newData.monthlyBooksData = newData.monthlyBooksData.slice(6);
      newData.monthlyUsersData = newData.monthlyUsersData.slice(6);
    } else if (option === '1M') {
      newData.chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      newData.monthlyBooksData = [5, 12, 8, 15];
      newData.monthlyUsersData = [30, 85, 45, 110];
    } else if (option === 'ALL') {
      newData.chartLabels = ['2020', '2021', '2022', '2023', '2024'];
      newData.monthlyBooksData = [20, 150, 400, 320, 700];
      newData.monthlyUsersData = [100, 850, 2500, 4200, 9500];
    }

    this.stats.set(newData);
  }

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.baseStats = JSON.parse(JSON.stringify(data));
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMsg.set(
            'Your session is invalid (likely because the database was reset). Please log out and log back in.',
          );
        } else {
          this.errorMsg.set('Failed to load analytics data.');
        }
      },
    });
  }

  forceLogout() {
    this.authService.logout().subscribe(() => {
      window.location.href = '/login';
    });
  }

  // Calculate simple trend percentage vs previous month
  getTrend(data: number[]): number {
    if (!data || data.length < 2) return 0;
    const current = data[11];
    const prev = data[10];
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
  }

  getReadersRatio(): number {
    const s = this.stats();
    if (!s) return 0;
    const total = s.readers + s.writers;
    if (total === 0) return 0;
    return (s.readers / total) * 100;
  }

  maxBooks(): number {
    const s = this.stats();
    if (!s || !s.monthlyBooksData) return 10;
    const max = Math.max(...s.monthlyBooksData);
    return max < 10 ? 10 : Math.ceil(max / 10) * 10;
  }

  maxUsers(): number {
    const s = this.stats();
    if (!s || !s.monthlyUsersData) return 10;
    const max = Math.max(...s.monthlyUsersData);
    return max < 10 ? 10 : Math.ceil(max / 10) * 10;
  }

  getPointY(val: number, max: number): number {
    const h = 250;
    return h - (val / max) * 200; // scaling to max height of 200 within 250 bounds
  }

  getBarX(index: number, totalLen: number): number {
    const w = 1000;
    const stepX = w / (totalLen > 1 ? totalLen - 1 : 1);
    return index * stepX;
  }

  getAreaPath(
    data: number[],
    closePath: boolean,
    smooth: boolean = false,
  ): string {
    if (!data || data.length === 0) return '';
    const max = this.maxUsers();

    // SVG viewBox is 0 0 1000 300
    // But we are using height for area as 250 so bars don't clip
    const w = 1000;
    const h = 250;

    const stepX = w / (data.length > 1 ? data.length - 1 : 1);

    let path = '';

    for (let i = 0; i < data.length; i++) {
      const x = i * stepX;
      // Invert Y axis
      const y = this.getPointY(data[i], max);

      if (i === 0) {
        path += `M ${x},${y}`;
      } else {
        if (smooth) {
          // Simple bezier curve approximation
          const prevX = (i - 1) * stepX;
          const prevY = this.getPointY(data[i - 1], max);
          const cX1 = prevX + stepX / 2.5;
          const cY1 = prevY;
          const cX2 = x - stepX / 2.5;
          const cY2 = y;
          path += ` C ${cX1},${cY1} ${cX2},${cY2} ${x},${y}`;
        } else {
          path += ` L ${x},${y}`;
        }
      }
    }

    if (closePath) {
      path += ` L ${w},250 L 0,250 Z`;
    }

    return path;
  }
}

