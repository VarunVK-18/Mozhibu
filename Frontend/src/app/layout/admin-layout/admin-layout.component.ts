import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <a routerLink="/admin" class="logo">
            <img src="assets/logo.png" alt="Mozhibu logo" class="logo-img">
            <span class="logo-text">Mozhibu</span>
          </a>
          <button class="collapse-btn" (click)="toggleSidebar()">
            <svg *ngIf="!sidebarCollapsed()" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg *ngIf="sidebarCollapsed()" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <h4 class="nav-section-title">Dashboard</h4>
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              <span class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              </span>
              <span class="label">Overview</span>
            </a>
          </div>

          <div class="nav-section">
            <h4 class="nav-section-title">Content Management</h4>
            <a routerLink="/admin/books" routerLinkActive="active" class="nav-item">
              <span class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </span>
              <span class="label">Books</span>
            </a>
          </div>

          <div class="nav-section">
            <h4 class="nav-section-title">User Management</h4>
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
              <span class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </span>
              <span class="label">Users</span>
            </a>
            <a routerLink="/admin/authors" routerLinkActive="active" class="nav-item">
              <span class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </span>
              <span class="label">Authors</span>
            </a>
            <a routerLink="/admin/author-approvals" routerLinkActive="active" class="nav-item">
              <span class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
              <span class="label">Author Approvals</span>
            </a>
          </div>

          <div class="nav-section">
            <h4 class="nav-section-title">Communication</h4>
            <a routerLink="/admin/broadcast" routerLinkActive="active" class="nav-item">
              <span class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              </span>
              <span class="label">Broadcast</span>
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" class="return-link">
            <span class="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </span>
            <span class="label">Main Site</span>
          </a>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="main-wrapper">
        <!-- Topbar -->
        <header class="admin-topbar">
          <div class="topbar-left">
            <h2 class="page-title">Superadmin Portal</h2>
          </div>
          
          <div class="topbar-right">
            <div class="user-profile-wrapper">
              <div class="user-profile" (click)="toggleMenu()">
                <div class="user-info">
                  <span class="user-name">{{ user?.username }}</span>
                  <span class="user-role">Super Admin</span>
                </div>
                <div class="avatar">{{ user?.username?.charAt(0)?.toUpperCase() }}</div>
              </div>
              
              <div class="profile-dropdown" [class.open]="menuOpen()">
                <div class="dropdown-header">
                  <strong>{{ user?.username }}</strong>
                  <div class="detail-text">{{ user?.email }}</div>
                </div>
                <button class="profile-option" (click)="logout()">
                  <span class="icon" style="margin-right: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  </span> Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <main class="admin-main">
          <div class="main-content">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: var(--paper); /* Soft off-white background */
      font-family: var(--body);
      overflow: hidden;
    }
    
    /* Sidebar */
    .admin-sidebar {
      width: 260px;
      background: #FFFFFF;
      border-right: 1px solid var(--border-soft);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      z-index: 100;
    }
    .admin-sidebar.collapsed { width: 80px; }
    
    .sidebar-header {
      height: 72px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-soft);
    }
    .admin-sidebar.collapsed .sidebar-header { 
      justify-content: center; 
      padding: 0; 
      flex-direction: column;
      gap: 4px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      font-family: var(--display);
      font-size: 22px;
      font-weight: 700;
      color: var(--ink);
      white-space: nowrap;
      overflow: hidden;
    }
    .logo-img { width: 32px; height: 32px; object-fit: contain; flex-shrink: 0; transition: margin 0.3s ease; }
    
    .admin-sidebar.collapsed .logo {
      gap: 0;
    }
    
    .logo-text, .label, .nav-section-title {
      opacity: 1;
      transition: opacity 0.2s ease, max-width 0.3s ease;
      white-space: nowrap;
      display: inline-block;
      max-width: 200px; /* Arbitrary max to allow smooth transition */
    }

    .admin-sidebar.collapsed .logo-text,
    .admin-sidebar.collapsed .label {
      opacity: 0;
      max-width: 0;
      pointer-events: none;
    }
    .admin-sidebar.collapsed .nav-section-title {
      opacity: 0;
      max-width: 0;
      margin: 0;
      padding: 0;
    }
    
    .collapse-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-s);
      color: var(--ink-soft);
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .collapse-btn:hover { background: var(--paper-warm); color: var(--ink); }
    
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .nav-section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-faint);
      margin-bottom: 12px;
      padding-left: 12px;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-m);
      text-decoration: none;
      color: var(--ink-soft);
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
    }
    .nav-item .icon { font-size: 18px; flex-shrink: 0; }
    .nav-item:hover { background: var(--paper-warm); color: var(--ink); }
    .nav-item.active {
      background: var(--forest-tint);
      color: var(--forest-deep);
      font-weight: 600;
    }
    
    .sidebar-footer {
      padding: 20px 16px;
      border-top: 1px solid var(--border-soft);
    }
    .return-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: var(--radius-m);
      text-decoration: none;
      color: var(--ink-soft);
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s;
      white-space: nowrap;
      overflow: hidden;
    }
    .return-link .icon { flex-shrink: 0; }
    .return-link:hover { background: var(--paper-warm); color: var(--ink); }

    /* Main Wrapper */
    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    
    /* Topbar */
    .admin-topbar {
      height: 72px;
      background: #FFFFFF;
      border-bottom: 1px solid var(--border-soft);
      padding: 0 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    
    .page-title {
      font-family: var(--display);
      font-size: 20px;
      font-weight: 600;
      color: var(--ink);
    }
    
    /* User Profile */
    .user-profile-wrapper { position: relative; }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      padding: 6px 16px;
      border-radius: 100px;
      transition: background 0.2s;
    }
    .user-profile:hover { background: var(--paper-warm); }
    
    .user-info { display: flex; flex-direction: column; align-items: flex-end; }
    .user-name { font-weight: 600; font-size: 14px; color: var(--ink); }
    .user-role { font-size: 12px; color: var(--ink-soft); }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--forest);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--display);
      font-weight: 600;
      font-size: 16px;
    }
    
    .profile-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: #FFFFFF;
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-m);
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      min-width: 220px;
      display: none;
      z-index: 100;
      overflow: hidden;
    }
    .profile-dropdown.open { display: block; }
    
    .dropdown-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-soft);
      background: var(--paper-warm);
    }
    .dropdown-header strong { display: block; font-family: var(--display); font-size: 15px; margin-bottom: 4px; color: var(--ink); }
    .detail-text { font-size: 13px; color: var(--ink-soft); }
    
    .profile-option {
      width: 100%;
      padding: 12px 16px;
      text-align: left;
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 500;
      color: var(--rose);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: background 0.2s;
    }
    .profile-option:hover { background: var(--rose-tint); }

    /* Content Area */
    .admin-main {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
    }
    .main-content {
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);

  menuOpen = signal(false);
  sidebarCollapsed = signal(false);

  get user() {
    return this.authService.user();
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-profile-wrapper')) {
      this.menuOpen.set(false);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
