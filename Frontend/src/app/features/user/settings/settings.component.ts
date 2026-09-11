import { Component, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ThemeService } from '../../../core/services/theme.service';

import { Subject, of } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageCropperComponent],
  template: `
    <div class="settings-page">
      <div class="settings-container">
        <header class="page-header">
          <h1>Account Settings</h1>
          <p>Manage your profile and account preferences.</p>
        </header>

        <div class="settings-tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'profile'"
            (click)="setTab('profile')"
          >
            Edit Profile
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'account'"
            (click)="setTab('account')"
          >
            Account Settings
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'monetization'"
            (click)="setTab('monetization')"
          >
            Monetization
          </button>
        </div>

        <div class="settings-grid">
          <!-- Basic Profile Info -->
          <div class="settings-card" id="profile" *ngIf="activeTab() === 'profile'">
            <h3>Profile Information</h3>

            <div class="avatar-upload-section">
              <div
                class="avatar-preview"
                [style.backgroundImage]="getAvatarStyle()"
                (click)="!uploading() && fileInput.click()"
                [class.is-uploading]="uploading()"
              >
                <span *ngIf="!auth.user()?.avatar && !uploading()">{{
                  auth.user()?.username?.charAt(0)
                }}</span>
                
                <div class="spinner-overlay" *ngIf="uploading()">
                  <div class="spinner"></div>
                </div>

                <div class="upload-overlay" *ngIf="!uploading()">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
              </div>
              <input
                type="file"
                #fileInput
                accept="image/*"
                style="display: none;"
                (change)="onFileSelected($event)"
              />
              <div class="avatar-info">
                <h4>Profile Picture</h4>
                <p>Click the circle to upload a new avatar. Max size: 5MB.</p>
                <div class="avatar-actions">
                  <button
                    *ngIf="auth.user()?.avatar"
                    (click)="removeAvatar()"
                    class="btn-text"
                    [disabled]="uploading()"
                  >
                    Remove Picture
                  </button>
                </div>
                <div *ngIf="uploadError()" class="error-text">
                  {{ uploadError() }}
                </div>
                <div *ngIf="uploading()" class="uploading-text">
                  Uploading...
                </div>
              </div>
            </div>

            <!-- Avatar Cropper Modal -->
            <div class="cropper-modal" *ngIf="imageChangedEvent">
              <div class="cropper-content">
                <h3>Crop Profile Picture</h3>
                <image-cropper
                  [imageChangedEvent]="imageChangedEvent"
                  [maintainAspectRatio]="true"
                  [aspectRatio]="1 / 1"
                  [roundCropper]="true"
                  format="jpeg"
                  [canvasRotation]="canvasRotation"
                  (imageCropped)="imageCropped($event)"
                >
                </image-cropper>
                <div class="cropper-actions">
                  <button class="btn btn-ghost" (click)="cancelCrop()">
                    Cancel
                  </button>
                  <button class="btn btn-ghost" (click)="rotateImage()">
                    Rotate 90°
                  </button>
                  <button
                    class="btn btn-primary"
                    (click)="saveCroppedAvatar()"
                    [disabled]="!croppedBlob || uploading()"
                  >
                    <div *ngIf="uploading()" class="btn-loader"></div>
                    {{ uploading() ? 'Saving...' : 'Save Avatar' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="info-group">
              <label>Username</label>
              <div class="value">{{ auth.user()?.username }}</div>
            </div>

            <!-- Pen Name Field -->
            <div class="info-group">
              <label>Pen Name (Public Nickname)</label>
              <div class="input-with-validation" style="position: relative;">
                <input
                  type="text"
                  [ngModel]="penNameText()"
                  (ngModelChange)="penNameText.set($event); onPenNameChange($event)"
                  class="form-control"
                  placeholder="Pen Name"
                />
                
                <div class="validation-status" *ngIf="checkingPenName()" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; color: var(--text-secondary);">
                  <div class="spinner" style="display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(0,0,0,0.1); border-radius: 50%; border-top-color: currentColor; animation: spin 1s linear infinite;"></div> Checking...
                </div>
                
                <div class="validation-status available" *ngIf="penNameAvailable() === true && !checkingPenName() && penNameText() !== originalPenName()" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;">
                  <i class="fa fa-check-circle"></i> Available!
                </div>
                
                <div class="validation-status taken" *ngIf="penNameAvailable() === false && !checkingPenName() && penNameText() !== originalPenName()" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 2px 6px; border-radius: 4px;">
                  <i class="fa fa-times-circle"></i> Already taken
                </div>
              </div>
              <div *ngIf="penNameError()" style="margin-top: 6px; font-size: 0.82rem; color: #ef4444; display: flex; align-items: center; gap: 6px;">
                <i class="fa fa-exclamation-circle"></i> {{ penNameError() }}
              </div>
              <div *ngIf="penNameSuggestions().length > 0" style="margin-top: 8px;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">Try instead: </span>
                <span
                  *ngFor="let s of penNameSuggestions()"
                  (click)="selectSuggestion(s)"
                  style="display: inline-block; margin: 3px 4px; padding: 3px 10px; background: rgba(var(--primary-rgb), 0.1); color: var(--primary); border: 1px solid rgba(var(--primary-rgb), 0.25); border-radius: 20px; font-size: 0.82rem; cursor: pointer; transition: background 0.15s;"
                  onmouseenter="this.style.background='rgba(var(--primary-rgb), 0.2)'"
                  onmouseleave="this.style.background='rgba(var(--primary-rgb), 0.1)'"
                >{{ s }}</span>
              </div>
              <p class="field-hint" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Lowercase letters, numbers and _ only. No capitals or spaces.</p>
            </div>
            
            <!-- Legal Name Field -->
            <div class="info-group">
              <label>Authorized Legal Name <span class="private-badge" style="display: inline-flex; align-items: center; gap: 4px; background: rgba(16, 185, 129, 0.1); color: #10b981; font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; margin-left: 8px;"><i class="fa fa-lock"></i> Private</span></label>
              <input
                type="text"
                [(ngModel)]="legalNameText"
                class="form-control"
                placeholder="Authorized Legal Name"
              />
              <p class="field-hint" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">As per your ID card. This is required for monetization and payouts. Kept strictly confidential.</p>
            </div>
            <div class="info-group">
              <label>Email Address</label>
              <div class="value">{{ auth.user()?.email }}</div>
            </div>
            <div class="info-group">
              <label>Phone Number</label>
              <div class="value">{{ auth.user()?.mobile || 'Not provided' }}</div>
            </div>
            <div class="info-group">
              <label>Current Role</label>
              <div class="value role-badge" [ngClass]="auth.user()?.role">
                {{ auth.user()?.role }}
              </div>
            </div>

            <div class="info-group">
              <label>Date of Birth</label>
              <input
                type="date"
                [(ngModel)]="dobDate"
                class="form-control"
                [max]="maxDobDate"
              />
            </div>

            <div class="info-group">
              <label>Bio</label>
              <textarea
                [(ngModel)]="bioText"
                class="form-control"
                rows="4"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>

            <div *ngIf="profileUpdateError()" class="error-text">
              {{ profileUpdateError() }}
            </div>
            <div *ngIf="profileUpdateSuccess()" class="success-text">
              Profile updated successfully!
            </div>

            <div class="settings-actions">
              <button
                class="btn btn-primary btn-save-profile"
                (click)="saveProfile()"
                [disabled]="savingProfile()"
              >
                <div *ngIf="savingProfile()" class="btn-loader"></div>
                {{ savingProfile() ? 'Saving Profile...' : 'Save Profile Changes' }}
              </button>
            </div>
          </div>

          <!-- Account Controls & Upgrade -->
          <div class="settings-group" *ngIf="activeTab() === 'account'">
            <!-- Theme Preferences -->
            <div class="settings-card">
              <h3>Theme Preferences</h3>
              <p>Customize the appearance of the application.</p>
              
              <div class="theme-toggle-container" style="display: flex; align-items: center; gap: 16px; margin-top: 16px;">
                <span>Dark Mode</span>
                <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 24px;">
                  <input type="checkbox" [checked]="themeService.isDarkMode()" (change)="themeService.toggleTheme()" style="opacity: 0; width: 0; height: 0;">
                  <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 24px;">
                    <span style="position: absolute; content: ''; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: var(--card); transition: .4s; border-radius: 50%;"
                          [style.transform]="themeService.isDarkMode() ? 'translateX(26px)' : 'translateX(0)'"
                          [style.backgroundColor]="themeService.isDarkMode() ? 'var(--forest)' : 'white'"></span>
                  </span>
                </label>
              </div>
            </div>

            <!-- Author Status -->
            <div class="settings-card">
              <h3>Author Status</h3>
              
              @if (auth.user()?.role === 'writer' || auth.user()?.role === 'superadmin') {
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: var(--forest); font-weight: 500;">Author Studio Active</span>
                    <div class="info-icon custom-tooltip" style="color: var(--forest); cursor: help; position: relative;" data-tooltip="You already have author privileges! Head over to the Author Studio to publish and manage your books.">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9 12l2 2 4-4"></path></svg>
                    </div>
                  </div>
                  <button class="btn btn-outline" routerLink="/write" style="padding: 6px 12px; font-size: 13px;">
                    Go to Studio
                  </button>
                </div>
              } @else {
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span>{{ auth.user()?.authorStatus === 'pending' ? 'Request Pending' : 'Become an Author' }}</span>
                    <div class="info-icon custom-tooltip" style="color: var(--ink-soft); cursor: help; position: relative;" data-tooltip="Want to publish your own stories on Mozhibu? Upgrade your account to an Author for free and get access to the Author Studio.">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </div>
                  </div>
                  
                  <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 24px;" [style.opacity]="auth.user()?.authorStatus === 'pending' || loading() ? '0.6' : '1'">
                    <input type="checkbox" 
                           [checked]="auth.user()?.authorStatus === 'pending'" 
                           [disabled]="auth.user()?.authorStatus === 'pending' || loading()"
                           (change)="upgradeToAuthor()" 
                           style="opacity: 0; width: 0; height: 0;">
                    <span class="slider round" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 24px;" [style.cursor]="auth.user()?.authorStatus === 'pending' || loading() ? 'not-allowed' : 'pointer'">
                      <span style="position: absolute; content: ''; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"
                            [style.transform]="(auth.user()?.authorStatus === 'pending') ? 'translateX(26px)' : 'translateX(0)'"
                            [style.backgroundColor]="(auth.user()?.authorStatus === 'pending') ? 'var(--forest)' : 'white'"></span>
                    </span>
                  </label>
                </div>
                @if (errorMsg()) {
                  <div class="error-msg" style="margin-top: 12px; font-size: 12px; color: var(--rose);">{{ errorMsg() }}</div>
                }
              }
            </div>

            <!-- Security Settings -->
            <div class="settings-card security-settings">
              <h3>Security Settings</h3>
              <p class="section-desc">Update your password to keep your account secure.</p>
              
              <div class="form-group" style="margin-bottom: 12px; position: relative; max-width: 360px;">
                <input [type]="showOldPassword() ? 'text' : 'password'" placeholder="Old Password" class="form-control" [ngModel]="oldPassword()" (ngModelChange)="oldPassword.set($event)" style="padding-right: 40px; padding-top: 8px; padding-bottom: 8px;">
                <button (click)="showOldPassword.set(!showOldPassword())" style="position: absolute; right: 8px; top: 8px; background: none; border: none; cursor: pointer; color: var(--ink-soft);">
                  <svg *ngIf="!showOldPassword()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg *ngIf="showOldPassword()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
              <div class="form-group" style="margin-bottom: 12px; position: relative; max-width: 360px;">
                <input [type]="showNewPassword() ? 'text' : 'password'" placeholder="New Password" class="form-control" [ngModel]="newPassword()" (ngModelChange)="newPassword.set($event)" style="padding-right: 40px; padding-top: 8px; padding-bottom: 8px;">
                <button (click)="showNewPassword.set(!showNewPassword())" style="position: absolute; right: 8px; top: 8px; background: none; border: none; cursor: pointer; color: var(--ink-soft);">
                  <svg *ngIf="!showNewPassword()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg *ngIf="showNewPassword()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
              <div class="form-group" style="margin-bottom: 16px; position: relative; max-width: 360px;">
                <input [type]="showConfirmPassword() ? 'text' : 'password'" placeholder="Confirm New Password" class="form-control" [ngModel]="confirmPassword()" (ngModelChange)="confirmPassword.set($event)" style="padding-right: 40px; padding-top: 8px; padding-bottom: 8px;">
                <button (click)="showConfirmPassword.set(!showConfirmPassword())" style="position: absolute; right: 8px; top: 8px; background: none; border: none; cursor: pointer; color: var(--ink-soft);">
                  <svg *ngIf="!showConfirmPassword()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg *ngIf="showConfirmPassword()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
              
              <div *ngIf="passwordChangeError()" class="error-text" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px; background-color: #fee2e2; color: #b91c1c; border-radius: 6px; font-weight: 500; border: 1px solid #fecaca;">
                <span>{{ passwordChangeError() }}</span>
                <button *ngIf="showForgotPassword()" class="btn-read-more" style="color: #b91c1c; font-weight: 600; border: none; background: transparent; cursor: pointer; text-decoration: underline;" (click)="forgotPassword()">Forgot Password?</button>
              </div>
              
              <div *ngIf="passwordChangeSuccess()" class="success-text" style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px; background-color: #dcfce7; color: #15803d; border-radius: 6px; font-weight: 500; border: 1px solid #bbf7d0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                {{ passwordChangeSuccess() }}
              </div>
              
              <div class="settings-actions">
                <button class="btn btn-primary" [disabled]="passwordChangeLoading() || !oldPassword() || !newPassword() || !confirmPassword()" (click)="changePassword()">
                  {{ passwordChangeLoading() ? 'Updating...' : 'Update Password' }}
                </button>
              </div>
            </div>

            <!-- Account Status -->
            <div class="settings-card">
              <h3>Account Status</h3>
              
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>Deactivate Account</span>
                  <div class="info-icon custom-tooltip" style="color: var(--ink-soft); cursor: help; position: relative;" data-tooltip="Temporarily disable your account. Your profile and published stories will be hidden. You can reactivate anytime by logging back in.">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  </div>
                </div>
                <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 24px;">
                  <input type="checkbox" [checked]="false" (click)="deactivateAccount($event)" style="opacity: 0; width: 0; height: 0;">
                  <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 24px;">
                    <span style="position: absolute; content: ''; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; transform: translateX(0);"></span>
                  </span>
                </label>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-soft);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: #ef4444; font-weight: 500;">Delete Account</span>
                  <div class="info-icon custom-tooltip" style="color: #ef4444; cursor: help; position: relative;" data-tooltip="Permanently delete your account. All books, progress, bookmarks, and reviews will be permanently removed. This is irreversible.">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  </div>
                </div>
                <button class="btn btn-danger" (click)="deleteAccount()" [disabled]="deleting()" style="padding: 6px 12px; font-size: 13px;">
                  {{ deleting() ? 'Deleting...' : 'Delete' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Monetization Settings -->
        <div class="settings-group" *ngIf="activeTab() === 'monetization'">
          <div class="settings-card">
            <h3>Monetization & Payouts</h3>
            <p>Manage your earnings, payouts, and secure bank details.</p>

            <!-- Loading State -->
            <div *ngIf="earningsLoading()" style="padding: 32px; text-align: center;">
              <div class="spinner" style="margin: 0 auto; border-top-color: var(--forest);"></div>
              <p style="margin-top: 16px; color: var(--ink-soft);">Loading earnings data...</p>
            </div>

            <!-- Earnings Dashboard -->
            <div *ngIf="!earningsLoading() && earningsSummary()" class="earnings-dashboard" style="margin-top: 24px;">
              <!-- Overview Cards -->
              <div class="earnings-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
                <div class="earning-card" style="background: var(--paper-warm); padding: 20px; border-radius: 12px; border: 1px solid var(--border-soft);">
                  <div style="font-size: 13px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Pending Balance</div>
                  <div style="font-size: 28px; font-family: var(--display); color: var(--ink); font-weight: 600;">{{ earningsSummary()?.totalPendingDisplay }}</div>
                  <div style="font-size: 12px; color: var(--forest); margin-top: 4px;">Available for withdrawal</div>
                </div>
                <div class="earning-card" style="background: var(--paper-warm); padding: 20px; border-radius: 12px; border: 1px solid var(--border-soft);">
                  <div style="font-size: 13px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Requested Payouts</div>
                  <div style="font-size: 28px; font-family: var(--display); color: var(--ink); font-weight: 600;">{{ earningsSummary()?.totalRequestedDisplay }}</div>
                  <div style="font-size: 12px; color: #d97706; margin-top: 4px;">Processing by admin</div>
                </div>
                <div class="earning-card" style="background: var(--forest-tint); padding: 20px; border-radius: 12px; border: 1px solid var(--forest);">
                  <div style="font-size: 13px; color: var(--forest-deep); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Total Paid</div>
                  <div style="font-size: 28px; font-family: var(--display); color: var(--forest-deep); font-weight: 600;">{{ earningsSummary()?.totalPaidDisplay }}</div>
                  <div style="font-size: 12px; color: var(--forest-deep); margin-top: 4px; opacity: 0.8;">Lifetime earnings</div>
                </div>
              </div>

              <!-- Withdrawal Action -->
              <div class="withdrawal-section" style="background: var(--paper); border: 1px solid var(--border-soft); border-radius: 12px; padding: 24px; margin-bottom: 40px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px;">
                  <div style="flex: 1; min-width: 250px;">
                    <h4 style="font-family: var(--display); font-size: 16px; margin-bottom: 8px;">Request Withdrawal</h4>
                    <p style="font-size: 14px; color: var(--ink-soft); margin-bottom: 16px;">
                      You can request a withdrawal once your pending balance reaches the minimum threshold of ₹{{ earningsSummary()?.minPayoutInPaise / 100 }}.
                    </p>
                    
                    <!-- Progress Bar -->
                    <div style="height: 8px; background: var(--border-soft); border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                      <div style="height: 100%; background: var(--forest); transition: width 0.3s;" 
                           [style.width.%]="(earningsSummary()?.totalPendingInPaise / earningsSummary()?.minPayoutInPaise) * 100 > 100 ? 100 : (earningsSummary()?.totalPendingInPaise / earningsSummary()?.minPayoutInPaise) * 100">
                      </div>
                    </div>
                    <div style="font-size: 12px; color: var(--ink-soft); text-align: right;">
                      {{ earningsSummary()?.totalPendingInPaise >= earningsSummary()?.minPayoutInPaise ? 'Threshold met!' : '₹' + (earningsSummary()?.totalPendingInPaise / 100).toFixed(2) + ' / ₹' + (earningsSummary()?.minPayoutInPaise / 100) }}
                    </div>
                  </div>
                  
                  <div>
                    <button class="btn btn-primary" 
                            style="padding: 12px 24px;"
                            [disabled]="earningsSummary()?.totalPendingInPaise < earningsSummary()?.minPayoutInPaise || withdrawLoading()"
                            (click)="requestWithdrawal()">
                      <div *ngIf="withdrawLoading()" class="btn-loader"></div>
                      {{ withdrawLoading() ? 'Requesting...' : 'Withdraw Funds' }}
                    </button>
                  </div>
                </div>
                
                <div *ngIf="withdrawError()" class="error-text" style="margin-top: 16px; padding: 12px; background: var(--rose-tint); border-radius: 6px;">
                  {{ withdrawError() }}
                </div>
                <div *ngIf="withdrawSuccess()" class="success-text" style="margin-top: 16px; padding: 12px; background: #dcfce7; color: #15803d; border-radius: 6px;">
                  Withdrawal requested successfully! Our team will process it shortly.
                </div>
              </div>

              <!-- Transaction History -->
              <h4 style="font-family: var(--display); font-size: 18px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-soft);">Transaction History</h4>
              
              <div *ngIf="earningsHistory().length === 0" style="padding: 32px 0; text-align: center; color: var(--ink-soft);">
                No earnings history yet. Keep writing and publishing!
              </div>
              
              <div *ngIf="earningsHistory().length > 0" class="history-table-container" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border-soft); color: var(--ink-soft);">
                      <th style="padding: 12px 8px; font-weight: 500;">Period</th>
                      <th style="padding: 12px 8px; font-weight: 500;">Source</th>
                      <th style="padding: 12px 8px; font-weight: 500;">Reads / Score</th>
                      <th style="padding: 12px 8px; font-weight: 500;">Amount</th>
                      <th style="padding: 12px 8px; font-weight: 500;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let record of earningsHistory()" style="border-bottom: 1px solid var(--border-soft);">
                      <td style="padding: 16px 8px;">{{ record.month }}/{{ record.year }}</td>
                      <td style="padding: 16px 8px;">
                        <span class="source-badge" [ngClass]="record.source || 'author'">
                          {{ record.source === 'reader' ? '📖 Reading' : '✍️ Writing' }}
                        </span>
                      </td>
                      <td style="padding: 16px 8px; color: var(--ink-soft);">{{ record.qualifiedReads || record.engagementScore || 0 }}</td>
                      <td style="padding: 16px 8px; font-weight: 600;">{{ record.earningsDisplay }}</td>
                      <td style="padding: 16px 8px;">
                        <span class="status-badge" [ngClass]="record.status">
                          {{ record.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div style="margin: 40px 0; border-top: 1px solid var(--border-soft);"></div>
            <h4 style="font-family: var(--display); font-size: 18px; margin-bottom: 16px;">Bank Details</h4>
            <p style="font-size: 14px; color: var(--ink-soft); margin-bottom: 24px;">Provide your bank details below where your earnings will be transferred.</p>
            
            <div class="info-group" style="margin-top: 16px;">
              <label>Account Holder Name</label>
              <input
                type="text"
                class="form-control"
                [ngModel]="monetizationAccountName()"
                (ngModelChange)="monetizationAccountName.set($event)"
                placeholder="Name as it appears on your bank account"
              />
            </div>
            <div class="info-group">
              <label>Bank Name</label>
              <input
                type="text"
                class="form-control"
                [ngModel]="monetizationBankName()"
                (ngModelChange)="monetizationBankName.set($event)"
                placeholder="e.g., State Bank of India"
              />
            </div>
            <div class="info-group">
              <label>Account Number</label>
              <input
                type="text"
                class="form-control"
                [ngModel]="monetizationAccountNumber()"
                (ngModelChange)="monetizationAccountNumber.set($event)"
                placeholder="Your secure account number"
              />
              <p style="font-size: 11px; color: var(--ink-soft); margin-top: 4px;">* Encrypted and masked for your security</p>
            </div>
            <div class="info-group">
              <label>IFSC Code</label>
              <input
                type="text"
                class="form-control"
                [ngModel]="monetizationIfscCode()"
                (ngModelChange)="monetizationIfscCode.set($event)"
                placeholder="Bank branch IFSC code"
                style="text-transform: uppercase;"
              />
            </div>

            <div *ngIf="monetizationError()" class="error-text">
              {{ monetizationError() }}
            </div>
            <div *ngIf="monetizationSuccess()" class="success-text">
              Monetization details securely saved!
            </div>

            <div class="settings-actions">
              <button
                class="btn btn-primary"
                (click)="saveMonetization()"
                [disabled]="monetizationSaving()"
              >
                <div *ngIf="monetizationSaving()" class="btn-loader"></div>
                {{ monetizationSaving() ? 'Saving Securely...' : 'Save Monetization Settings' }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [
    `
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
      
      .status-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
      }
      .status-badge.pending {
        background: #f1f5f9;
        color: #475569;
      }
      .status-badge.requested {
        background: #fef3c7;
        color: #b45309;
      }
      .status-badge.paid {
        background: #dcfce7;
        color: #15803d;
      }
      .status-badge.rolled_over {
        background: #f3e8ff;
        color: #7e22ce;
      }
      
      .custom-tooltip:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-8px);
        background: var(--ink);
        color: var(--paper);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        white-space: normal;
        width: 250px;
        text-align: center;
        z-index: 100;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        pointer-events: none;
      }
      .custom-tooltip:hover::before {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: var(--ink);
        z-index: 100;
      }

      .settings-tabs {
        display: flex;
        gap: 32px;
        border-bottom: 1px solid var(--border-soft);
        margin-bottom: 32px;
      }

      .tab-btn {
        padding: 12px 0;
        font-family: var(--display);
        font-size: 16px;
        font-weight: 600;
        color: var(--ink-soft);
        position: relative;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: color 0.2s;
      }

      .tab-btn:hover {
        color: var(--ink);
      }

      .tab-btn.active {
        color: var(--forest-deep);
      }

      .tab-btn.active::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 2px;
        background: var(--forest);
        border-radius: 2px 2px 0 0;
      }

      .settings-grid {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .settings-group {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .settings-card {
        background: var(--card);
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
        background: rgba(0, 0, 0, 0.5);
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
      .avatar-preview.is-uploading {
        cursor: not-allowed;
      }
      .spinner-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        border-radius: 50%;
      }
      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .status-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
      }
      .status-badge.pending { background: #f1f5f9; color: #475569; }
      .status-badge.requested { background: #fef3c7; color: #b45309; }
      .status-badge.paid { background: #dcfce7; color: #15803d; }
      .status-badge.rolled_over { background: #f3e8ff; color: #7e22ce; }

      .source-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
      }
      .source-badge.reader { background: #eff6ff; color: #1d4ed8; }
      .source-badge.author { background: #f0fdf4; color: #15803d; }
      .avatar-actions {
        margin-top: 8px;
      }
      .btn-text {
        background: none;
        border: none;
        color: var(--error);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        padding: 0;
        text-decoration: underline;
      }
      .btn-text:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .cropper-modal {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cropper-content {
        background: var(--surface);
        border-radius: 16px;
        padding: 24px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .cropper-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
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
      .error-text {
        color: var(--rose);
        font-size: 12px;
        margin-top: 4px;
      }
      .uploading-text {
        color: var(--forest);
        font-size: 12px;
        margin-top: 4px;
        font-weight: 600;
      }

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
      .role-badge.reader {
        background: var(--paper-warm);
        color: var(--ink);
      }
      .role-badge.writer {
        background: var(--forest-tint);
        color: var(--forest-deep);
      }
      .role-badge.superadmin {
        background: var(--gold-tint);
        color: var(--ink);
      }

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

      .success-text {
        color: var(--forest);
        font-size: 13px;
        margin-top: 8px;
      }

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
      .author-pending h3 {
        border: none;
        padding: 0;
        margin-bottom: 12px;
        color: #b45309;
      }
      .author-pending p {
        color: #92400e;
        margin-bottom: 24px;
        max-width: 500px;
        line-height: 1.5;
      }

      .author-active {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .author-active h3 {
        border: none;
        padding: 0;
        margin-bottom: 12px;
      }
      .author-active p {
        color: var(--ink-soft);
        margin-bottom: 24px;
        max-width: 500px;
        line-height: 1.5;
      }

      .error-msg {
        color: var(--rose);
        background: var(--rose-tint);
        padding: 8px 16px;
        border-radius: 4px;
        margin-bottom: 16px;
        font-size: 13px;
      }
      
      .btn-save-profile {
        width: 100%;
        padding: 16px;
        font-size: 16px;
        border-radius: 12px;
        margin-top: 24px;
        justify-content: center;
        background: var(--forest-deep);
      }
      .btn-save-profile:hover {
        background: var(--forest);
      }


      .danger-zone {
        border: 1px solid #fca5a5 !important;
        background: #fff5f5;
      }
      .danger-zone h3 {
        color: #991b1b !important;
        border-bottom: 1px solid #fee2e2 !important;
      }
      .section-desc {
        font-size: 14px;
        color: var(--ink-soft);
        margin-bottom: 24px;
        opacity: 0.8;
        text-align: left;
      }
      .control-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        gap: 24px;
      }
      .control-row.border-top {
        border-top: 1px solid #fee2e2;
        margin-top: 16px;
        padding-top: 24px;
      }
      .control-text {
        flex: 1;
        text-align: left;
      }
      .control-text h4 {
        font-family: var(--display);
        font-size: 16px;
        font-weight: 600;
        color: var(--ink);
        margin-bottom: 4px;
      }
      .control-text p {
        font-size: 13px;
        color: var(--ink-soft);
        line-height: 1.4;
        margin: 0;
      }
      .btn-warning {
        background: #d97706;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
        white-space: nowrap;
        transition: background 0.2s;
      }
      .btn-warning:hover:not(:disabled) {
        background: #b45309;
      }
      .btn-danger {
        background: #dc2626;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
        white-space: nowrap;
        transition: background 0.2s;
      }
      .btn-danger:hover:not(:disabled) {
        background: #b91c1c;
      }
      @media (max-width: 768px) {
        .settings-page {
          padding: 24px 16px;
        }
        .settings-tabs {
          overflow-x: auto;
          white-space: nowrap;
          justify-content: flex-start;
          padding-bottom: 8px;
        }
        .settings-card {
          padding: 24px 16px;
        }
        .avatar-upload-section {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .avatar-actions {
          justify-content: center;
        }
        .form-row {
          flex-direction: column;
          gap: 16px;
        }
        .control-row {
          flex-direction: column;
          align-items: stretch;
          text-align: center;
        }
        .control-row button {
          width: 100%;
          margin-top: 16px;
        }
        .upgrade-btn {
          padding: 12px 16px;
          font-size: 14px;
        white-space: normal;
        height: auto;
      }
    }
    `
  ],
})
export class SettingsComponent implements OnInit {
  public auth = inject(AuthService);
  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  private confirmService = inject(ConfirmService);
  public themeService = inject(ThemeService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  activeTab = signal<'profile' | 'account' | 'monetization'>('profile');

  loading = signal(false);
  deactivating = signal(false);
  deleting = signal(false);
  errorMsg = signal<string | null>(null);
  uploading = signal(false);
  uploadError = signal<string | null>(null);

  bioText = signal<string>('');
  penNameText = signal<string>('');
  originalPenName = signal<string>('');
  legalNameText = signal<string>('');
  dobDate = signal('');
  maxDobDate = new Date().toISOString().split('T')[0];
  savingProfile = signal(false);
  profileUpdateError = signal<string | null>(null);
  profileUpdateSuccess = signal(false);

  checkingPenName = signal<boolean>(false);
  penNameAvailable = signal<boolean | null>(null);
  penNameError = signal<string | null>(null);
  penNameSuggestions = signal<string[]>([]);
  private penNameSubject = new Subject<string>();

  oldPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordChangeLoading = signal(false);
  passwordChangeError = signal<string | null>(null);
  passwordChangeSuccess = signal<string | null>(null);
  showForgotPassword = signal(false);

  monetizationAccountName = signal('');
  monetizationBankName = signal('');
  monetizationAccountNumber = signal('');
  monetizationIfscCode = signal('');
  monetizationSaving = signal(false);
  monetizationError = signal<string | null>(null);
  monetizationSuccess = signal(false);

  earningsSummary = signal<any>(null);
  earningsHistory = signal<any[]>([]);
  earningsLoading = signal(true);
  withdrawLoading = signal(false);
  withdrawSuccess = signal(false);
  withdrawError = signal<string | null>(null);

  ngOnInit() {
    // If not logged in, redirect to login
    if (!this.auth.user()) {
      this.router.navigate(['/login']);
    } else {
      this.bioText.set(this.auth.user()?.bio || '');
      this.penNameText.set(this.auth.user()?.penName || '');
      this.originalPenName.set(this.auth.user()?.penName || '');
      this.legalNameText.set(this.auth.user()?.legalName || '');
      if (this.auth.user()?.dob) {
        // Format to YYYY-MM-DD for the date input
        const d = new Date(this.auth.user()!.dob as string);
        this.dobDate.set(d.toISOString().split('T')[0]);
      }
      if (this.auth.user()?.monetization) {
        const mon = this.auth.user()!.monetization!;
        this.monetizationAccountName.set(mon.accountName || '');
        this.monetizationBankName.set(mon.bankName || '');
        this.monetizationAccountNumber.set(mon.accountNumber || '');
        this.monetizationIfscCode.set(mon.ifscCode || '');
      }
    }

    this.penNameSubject.pipe(
      debounceTime(400),
      switchMap((name) => {
        if (!name || name === this.originalPenName() || name.length < 3) {
          this.checkingPenName.set(false);
          this.penNameAvailable.set(null);
          return of(null);
        }
        this.checkingPenName.set(true);
        const userId = this.auth.user()?.id || '';
        return this.api.get<{ available: boolean }>(`/auth/check-penname?name=${name}&excludeUserId=${userId}`).pipe(
          catchError(() => of({ available: false }))
        );
      })
    ).subscribe((res) => {
      this.checkingPenName.set(false);
      if (res !== null) {
        this.penNameAvailable.set(res.available);
        if (!res.available) {
          this.generatePenNameSuggestions(this.penNameText());
        } else {
          this.penNameSuggestions.set([]);
        }
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params['tab'] === 'account') {
        this.activeTab.set('account');
      } else if (params['tab'] === 'monetization') {
        this.activeTab.set('monetization');
        this.loadEarnings();
      } else {
        this.activeTab.set('profile');
      }
    });
  }

  loadEarnings() {
    this.earningsLoading.set(true);
    this.auth.getEarnings().subscribe({
      next: (res) => {
        this.earningsSummary.set(res.summary);
        this.earningsHistory.set(res.earnings || []);
        this.earningsLoading.set(false);
      },
      error: () => {
        this.earningsLoading.set(false);
      }
    });
  }

  setTab(tab: 'profile' | 'account' | 'monetization') {
    this.activeTab.set(tab);
    if (tab === 'monetization' && !this.earningsSummary()) {
      this.loadEarnings();
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
    });
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
        this.errorMsg.set(
          err.error?.msg || 'Failed to upgrade account. Please try again.',
        );
      },
    });
  }

  onPenNameChange(name: string) {
    this.penNameError.set(null);
    this.penNameAvailable.set(null);
    this.checkingPenName.set(false);

    // If unchanged, reset silently
    if (name === this.originalPenName()) return;

    // Rule: no capital letters
    if (/[A-Z]/.test(name)) {
      this.penNameError.set('No capital letters allowed. Use lowercase only (e.g. varun or varun18).');
      return;
    }

    // Rule: no special characters, symbols, spaces, emojis — only lowercase letters, numbers and underscore
    if (/[^a-z0-9_]/.test(name)) {
      this.penNameError.set('Only lowercase letters, numbers, and underscore (_) are allowed. No spaces or other symbols.');
      return;
    }

    // Rule: cannot be only numbers — must have at least one letter
    if (/^[0-9_]+$/.test(name)) {
      this.penNameError.set('Pen name must have at least one letter (e.g. varun or varun_18).');
      return;
    }

    if (name.length >= 3) {
      this.checkingPenName.set(true);
      this.penNameSuggestions.set([]);
      this.penNameSubject.next(name);
    }
  }

  generatePenNameSuggestions(base: string) {
    const year = new Date().getFullYear().toString().slice(-2); // e.g. "26"
    const rand2 = Math.floor(Math.random() * 90 + 10).toString(); // e.g. "42"
    const rand3 = Math.floor(Math.random() * 900 + 100).toString(); // e.g. "183"
    const candidates = [
      `${base}${rand2}`,
      `${base}_${rand2}`,
      `${base}${rand3}`,
      `${base}_${year}`,
      `${base}${year}`,
    ];
    // Deduplicate and limit to 4
    this.penNameSuggestions.set([...new Set(candidates)].slice(0, 4));
  }

  selectSuggestion(name: string) {
    this.penNameText.set(name);
    this.onPenNameChange(name);
  }

  saveProfile() {
    this.savingProfile.set(true);
    this.profileUpdateError.set(null);
    this.profileUpdateSuccess.set(false);

    const payload: any = {
      bio: this.bioText(),
      dob: this.dobDate() ? new Date(this.dobDate()) : undefined,
      penName: this.penNameText(),
      legalName: this.legalNameText(),
    };
    if (this.penNameText() && this.penNameText() !== this.originalPenName()) {
      // Basic client-side check, backend will strictly validate uniqueness
      if (this.penNameAvailable() === false) {
        this.profileUpdateError.set("The chosen pen name is already taken.");
        this.savingProfile.set(false);
        return;
      }
      payload.penName = this.penNameText();
    }

    this.auth.updateProfile(payload).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.profileUpdateSuccess.set(true);
        setTimeout(() => this.profileUpdateSuccess.set(false), 3000);
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.profileUpdateError.set(
          err.error?.msg || 'Failed to update profile.',
        );
      },
    });
  }

  saveMonetization() {
    this.monetizationSaving.set(true);
    this.monetizationError.set(null);
    this.monetizationSuccess.set(false);

    const payload = {
      accountName: this.monetizationAccountName(),
      bankName: this.monetizationBankName(),
      accountNumber: this.monetizationAccountNumber(),
      ifscCode: this.monetizationIfscCode()
    };

    this.auth.updateMonetization(payload).subscribe({
      next: () => {
        this.monetizationSaving.set(false);
        this.monetizationSuccess.set(true);
        // Do not update local user session manually for security reasons here.
        // Re-fetching full profile if strictly needed, or just let it be since they just entered it.
        // It's masked in DB anyway.
        setTimeout(() => {
          this.monetizationSuccess.set(false);
        }, 3000);
      },
      error: (err) => {
        this.monetizationSaving.set(false);
        this.monetizationError.set(err.error?.msg || 'Failed to update monetization details.');
      }
    });
  }

  requestWithdrawal() {
    // Check if bank details are set
    if (!this.monetizationAccountName() || !this.monetizationAccountNumber() || !this.monetizationIfscCode()) {
      this.withdrawError.set('Please fill out and save your bank details first.');
      return;
    }

    this.withdrawLoading.set(true);
    this.withdrawError.set(null);
    this.withdrawSuccess.set(false);

    this.auth.requestWithdrawal().subscribe({
      next: () => {
        this.withdrawLoading.set(false);
        this.withdrawSuccess.set(true);
        this.loadEarnings(); // Refresh balances
        setTimeout(() => this.withdrawSuccess.set(false), 4000);
      },
      error: (err) => {
        this.withdrawLoading.set(false);
        this.withdrawError.set(err.error?.msg || 'Failed to request withdrawal.');
      }
    });
  }

  changePassword() {
    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordChangeError.set("New passwords don't match.");
      return;
    }
    this.passwordChangeLoading.set(true);
    this.passwordChangeError.set(null);
    this.passwordChangeSuccess.set(null);
    this.showForgotPassword.set(false);

    this.auth.changePassword({ oldPassword: this.oldPassword(), newPassword: this.newPassword() }).subscribe({
      next: (res) => {
        this.passwordChangeLoading.set(false);
        this.passwordChangeSuccess.set(res.msg || 'Password updated successfully!');
        this.oldPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
        setTimeout(() => this.passwordChangeSuccess.set(null), 3000);
      },
      error: (err) => {
        this.passwordChangeLoading.set(false);
        const msg = err.error?.msg || 'Failed to update password.';
        this.passwordChangeError.set(msg);
        if (msg.toLowerCase().includes('incorrect old password')) {
          this.showForgotPassword.set(true);
        }
      }
    });
  }

  forgotPassword() {
    const email = prompt("Please enter your email to receive a password reset link:", this.auth.user()?.email || '');
    if (email) {
      this.auth.forgotPassword(email).subscribe({
        next: (res) => {
          alert(res.msg || 'Password reset link sent.');
        },
        error: (err) => {
          alert(err.error?.msg || 'Failed to send reset link.');
        }
      });
    }
  }

  getAvatarUrl(path: string | undefined): string {
    if (!path) return '';
    return this.api.getImageUrl(path);
  }

  getAvatarStyle(): SafeStyle {
    const avatar = this.auth.user()?.avatar;
    if (!avatar) return this.sanitizer.bypassSecurityTrustStyle('none');
    return this.sanitizer.bypassSecurityTrustStyle(
      `url(${this.getAvatarUrl(avatar)})`,
    );
  }

  imageChangedEvent: any = '';
  croppedBlob: Blob | null = null;
  canvasRotation: number = 0;

  rotateImage() {
    this.canvasRotation++;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.uploadError.set('Please select an image file.');
        return;
      }
      this.imageChangedEvent = event;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedBlob = event.blob || null;
  }

  cancelCrop() {
    this.imageChangedEvent = '';
    this.croppedBlob = null;
    this.canvasRotation = 0;
  }

  saveCroppedAvatar() {
    if (this.croppedBlob) {
      this.uploading.set(true);
      this.uploadError.set(null);
      const file = new File([this.croppedBlob], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      this.auth.uploadAvatar(file).subscribe({
        next: (res) => {
          this.uploading.set(false);
          this.cancelCrop();
        },
        error: (err) => {
          this.uploading.set(false);
          this.uploadError.set(err.error?.msg || 'Failed to upload image.');
        },
      });
    }
  }

  removeAvatar() {
    this.confirmService
      .confirm(
        'Remove Avatar',
        'Are you sure you want to remove your profile picture?',
        true,
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.uploading.set(true);
          this.auth
            .updateProfile({ bio: this.bioText(), avatar: null })
            .subscribe({
              next: () => {
                this.uploading.set(false);
              },
              error: (err) => {
                this.uploading.set(false);
                this.uploadError.set('Failed to remove avatar');
              },
            });
        }
      });
  }

  deactivateAccount(event?: Event) {
    if (event) {
      event.preventDefault(); // Prevents the toggle switch from changing state until confirmed
    }
    
    this.confirmService
      .confirm(
        'Deactivate Account',
        'Are you sure you want to deactivate your account? This will temporarily hide your profile and all your books. You can reactivate anytime by logging back in.',
        true,
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.deactivating.set(true);
          this.auth.deactivateAccount().subscribe({
            next: () => {
              this.deactivating.set(false);
              alert('Account deactivated successfully.');
              this.auth.logout().subscribe(() => {
                this.router.navigate(['/']);
              });
            },
            error: (err) => {
              this.deactivating.set(false);
              alert(err.error?.msg || 'Failed to deactivate account.');
            },
          });
        }
      });
  }

  deleteAccount() {
    this.confirmService
      .confirm(
        'Delete Account',
        'WARNING: Are you absolutely sure you want to permanently delete your account? All your books, chapters, reading history, bookmarks, and reviews will be permanently removed. This action CANNOT be undone!',
        true,
        'Yes, Delete Permanentely',
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.confirmService
            .confirm(
              'Final Warning',
              'This is your final warning: Do you really want to delete your account permanently?',
              true,
              'I Understand, Delete It',
            )
            .subscribe((finalConfirm) => {
              if (finalConfirm) {
                this.deleting.set(true);
                this.auth.deleteAccount().subscribe({
                  next: () => {
                    this.deleting.set(false);
                    alert('Account permanently deleted.');
                    this.auth.logout().subscribe(() => {
                      this.router.navigate(['/']);
                    });
                  },
                  error: (err) => {
                    this.deleting.set(false);
                    alert(err.error?.msg || 'Failed to delete account.');
                  },
                });
              }
            });
        }
      });
  }
}

