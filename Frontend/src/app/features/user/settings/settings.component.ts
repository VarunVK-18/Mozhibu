import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="settings-container">
        <header class="page-header">
          <h1>Account Settings</h1>
          <p>Manage your profile and account preferences.</p>
        </header>

        <div class="settings-grid">
          
          <!-- Basic Profile Info -->
          <div class="settings-card">
            <h3>Profile Information</h3>
            
            <div class="avatar-upload-section">
              <div class="avatar-preview" 
                   [style.backgroundImage]="auth.user()?.avatar ? 'url(' + getAvatarUrl(auth.user()?.avatar) + ')' : 'none'"
                   (click)="fileInput.click()">
                <span *ngIf="!auth.user()?.avatar">{{ auth.user()?.username?.charAt(0) }}</span>
                <div class="upload-overlay">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
              </div>
              <input type="file" #fileInput accept="image/*" style="display: none;" (change)="onFileSelected($event)">
              <div class="avatar-info">
                <h4>Profile Picture</h4>
                <p>Click the circle to upload a new avatar. Max size: 5MB.</p>
                <div *ngIf="uploadError()" class="error-text">{{ uploadError() }}</div>
                <div *ngIf="uploading()" class="uploading-text">Uploading...</div>
              </div>
            </div>

            <div class="info-group">
              <label>Username</label>
              <div class="value">{{ auth.user()?.username }}</div>
            </div>
            <div class="info-group">
              <label>Email Address</label>
              <div class="value">{{ auth.user()?.email }}</div>
            </div>
            <div class="info-group">
              <label>Current Role</label>
              <div class="value role-badge" [ngClass]="auth.user()?.role">
                {{ auth.user()?.role }}
              </div>
            </div>
            
            <div class="info-group">
              <label>Bio</label>
              <textarea 
                [(ngModel)]="bioText" 
                class="form-control" 
                rows="4" 
                placeholder="Tell us about yourself..."></textarea>
            </div>
            
            <div *ngIf="profileUpdateError()" class="error-text">{{ profileUpdateError() }}</div>
            <div *ngIf="profileUpdateSuccess()" class="success-text">Profile updated successfully!</div>
            
            <div class="settings-actions">
              <button class="btn btn-primary" (click)="saveProfile()" [disabled]="savingProfile()">
                {{ savingProfile() ? 'Saving...' : 'Save Profile' }}
              </button>
            </div>
          </div>

          <!-- Become an Author Section -->
          @if (auth.user()?.role === 'reader' && auth.user()?.authorStatus !== 'pending') {
            <div class="settings-card author-upgrade">
              <div class="upgrade-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.5502 3C6.69782 3.00694 4.6805 3.10152 3.39128 4.39073C2 5.78202 2 8.02125 2 12.4997C2 16.9782 2 19.2174 3.39128 20.6087C4.78257 22 7.0218 22 11.5003 22C15.9787 22 18.218 22 19.6093 20.6087C20.8985 19.3195 20.9931 17.3022 21 13.4498" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M11.0556 13C10.3322 3.86635 16.8023 1.27554 21.9805 2.16439C22.1896 5.19136 20.7085 6.32482 17.8879 6.84825C18.4326 7.41736 19.395 8.13354 19.2912 9.02879C19.2173 9.66586 18.7846 9.97843 17.9194 10.6036C16.0231 11.9736 13.8264 12.8375 11.0556 13Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 17C11 11.5 12.9604 9.63636 15 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3>Become an Author</h3>
              <p>Want to publish your own stories on Mozhibu? Upgrade your account to an Author for free and get access to the Author Studio.</p>
              
              @if (errorMsg()) {
                <div class="error-msg">{{ errorMsg() }}</div>
              }
              
              <button (click)="upgradeToAuthor()" class="btn btn-primary upgrade-btn" [disabled]="loading()">
                {{ loading() ? 'Requesting...' : 'Request Author Status' }}
              </button>
            </div>
          } @else if (auth.user()?.role === 'reader' && auth.user()?.authorStatus === 'pending') {
            <div class="settings-card author-pending">
              <div class="upgrade-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3>Request Pending</h3>
              <p>Your request to become an author is currently pending admin approval. You will gain access to the Author Studio once approved.</p>
              <button class="btn btn-outline upgrade-btn" disabled>Request Pending Admin Approval</button>
            </div>
          } @else if (auth.user()?.role === 'writer' || auth.user()?.role === 'superadmin') {
            <div class="settings-card author-active">
              <div class="upgrade-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>Author Studio Active</h3>
              <p>You already have author privileges! Head over to the Author Studio to publish and manage your books.</p>
              <button class="btn btn-outline" disabled>Go to Studio (Coming Soon)</button>
            </div>
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      background: var(--paper);
      min-height: calc(100vh - 80px);
      padding: 48px 24px;
    }
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 32px;
    }
    .page-header h1 {
      font-family: var(--display);
      font-size: 28px;
      color: var(--ink);
      margin-bottom: 8px;
    }
    .page-header p {
      color: var(--ink-soft);
      font-size: 15px;
    }
    
    .settings-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .settings-card {
      background: #fff;
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-l);
      padding: 32px;
    }
    .settings-card h3 {
      font-family: var(--display);
      font-size: 18px;
      color: var(--ink);
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-soft);
    }
    
    .avatar-upload-section {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 1px dashed var(--border-soft);
    }
    .avatar-preview {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background-color: var(--forest-tint);
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--display);
      font-weight: 700;
      font-size: 32px;
      color: var(--forest-deep);
      position: relative;
      cursor: pointer;
      overflow: hidden;
      border: 2px solid var(--border-soft);
    }
    .upload-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .avatar-preview:hover .upload-overlay {
      opacity: 1;
    }
    .avatar-info h4 {
      font-family: var(--display);
      font-size: 16px;
      margin-bottom: 4px;
    }
    .avatar-info p {
      font-size: 13px;
      color: var(--ink-soft);
    }
    .error-text { color: var(--rose); font-size: 12px; margin-top: 4px; }
    .uploading-text { color: var(--forest); font-size: 12px; margin-top: 4px; font-weight: 600; }

    .info-group {
      margin-bottom: 16px;
    }
    .info-group label {
      display: block;
      font-size: 12px;
      color: var(--ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .info-group .value {
      font-size: 15px;
      color: var(--ink);
      font-weight: 500;
    }
    
    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    .role-badge.reader { background: var(--paper-warm); color: var(--ink); }
    .role-badge.writer { background: var(--forest-tint); color: var(--forest-deep); }
    .role-badge.superadmin { background: var(--gold-tint); color: var(--ink); }
    
    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      background: var(--paper);
      font-family: inherit;
      font-size: 15px;
      color: var(--ink);
      resize: vertical;
      transition: border-color 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--forest);
    }
    
    .settings-actions {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }
    
    .success-text { color: var(--forest); font-size: 13px; margin-top: 8px; }

    .author-upgrade {
      background: var(--forest-tint);
      border-color: var(--forest);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .author-upgrade h3 {
      border: none;
      margin-bottom: 12px;
      padding: 0;
      color: var(--forest-deep);
    }
    .author-upgrade p {
      color: var(--forest-deep);
      opacity: 0.8;
      margin-bottom: 24px;
      max-width: 500px;
      line-height: 1.5;
    }
    .upgrade-icon {
      font-size: 28px;
      margin-bottom: 16px;
    }
    .upgrade-btn {
      padding: 12px 32px;
      font-size: 15px;
      background: var(--forest);
      color: #fff;
    }
    .upgrade-btn:hover:not(:disabled) {
      background: var(--forest-deep);
    }
    
    .author-pending {
      background: #fef3c7;
      border-color: #f59e0b;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .author-pending h3 { border: none; padding: 0; margin-bottom: 12px; color: #b45309; }
    .author-pending p { color: #92400e; margin-bottom: 24px; max-width: 500px; line-height: 1.5; }
    
    .author-active {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .author-active h3 { border: none; padding: 0; margin-bottom: 12px; }
    .author-active p { color: var(--ink-soft); margin-bottom: 24px; max-width: 500px; line-height: 1.5; }
    
    .error-msg {
      color: var(--rose);
      background: var(--rose-tint);
      padding: 8px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 13px;
    }

    @media (max-width: 480px) {
      .settings-page {
        padding: 24px 16px;
      }
      .settings-card {
        padding: 24px 16px;
      }
      .upgrade-btn {
        padding: 12px 16px;
        font-size: 14px;
        width: 100%;
        white-space: normal;
        height: auto;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  uploading = signal(false);
  uploadError = signal<string | null>(null);
  
  bioText = signal<string>('');
  savingProfile = signal(false);
  profileUpdateError = signal<string | null>(null);
  profileUpdateSuccess = signal(false);

  ngOnInit() {
    // If not logged in, redirect to login
    if (!this.auth.user()) {
      this.router.navigate(['/login']);
    } else {
      this.bioText.set(this.auth.user()?.bio || '');
    }
  }

  upgradeToAuthor() {
    this.loading.set(true);
    this.errorMsg.set(null);
    
    this.auth.upgradeRole().subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.msg || 'Failed to upgrade account. Please try again.');
      }
    });
  }
  
  saveProfile() {
    this.savingProfile.set(true);
    this.profileUpdateError.set(null);
    this.profileUpdateSuccess.set(false);
    
    this.auth.updateProfile({ bio: this.bioText() }).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.profileUpdateSuccess.set(true);
        setTimeout(() => this.profileUpdateSuccess.set(false), 3000);
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.profileUpdateError.set(err.error?.msg || 'Failed to update profile.');
      }
    });
  }

  getAvatarUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Base URL is typically localhost:5000 in dev
    // We should ideally get this from environment, but for now we hardcode or rely on proxy
    return `http://localhost:5000${path}`;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploading.set(true);
      this.uploadError.set(null);

      this.auth.uploadAvatar(file).subscribe({
        next: (res) => {
          this.uploading.set(false);
        },
        error: (err) => {
          this.uploading.set(false);
          this.uploadError.set(err.error?.msg || 'Failed to upload image. Make sure it is an image under 5MB.');
        }
      });
    }
  }
}
