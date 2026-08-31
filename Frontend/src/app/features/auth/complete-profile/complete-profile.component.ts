import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="signup-wrap">
      <div class="signup-card">
        <h2>Complete Your Profile</h2>
        <p>Just a few more details to finish setting up your account.</p>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="role-selector">
            <p class="role-label">What brings you to Mozhibu?</p>
            <div class="role-options">
              <label
                class="role-option"
                [class.selected]="profileForm.get('role')?.value === 'reader'"
              >
                <input type="radio" formControlName="role" value="reader" />
                <span class="role-title">I want to read</span>
              </label>
              <label
                class="role-option"
                [class.selected]="profileForm.get('role')?.value === 'writer'"
              >
                <input type="radio" formControlName="role" value="writer" />
                <span class="role-title">I want to publish</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Mobile</label>
            <input
              type="text"
              formControlName="mobile"
              class="form-control"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Preferred Language</label>
              <select formControlName="preferredLanguage" class="form-control">
                <option value="" disabled>Select language</option>
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
                <option value="bn">Bengali</option>
              </select>
            </div>
            <div class="form-group">
              <label>Favorite Genres (Optional)</label>
              <input
                type="text"
                formControlName="favoriteGenres"
                class="form-control"
                placeholder="e.g. Romance, Sci-Fi"
              />
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-msg">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="isLoading">
            {{ isLoading ? 'Completing...' : 'Complete Setup' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .signup-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 150px);
        background: var(--paper);
        padding: 40px 20px;
      }
      .signup-card {
        background: var(--card);
        padding: 40px 48px;
        border-radius: var(--radius-l);
        border: 1px solid var(--border-soft);
        box-shadow: 0 10px 30px -10px rgba(43, 38, 32, 0.1);
        max-width: 600px;
        width: 100%;
      }
      .signup-card h2 {
        margin-bottom: 8px;
        font-family: var(--display);
        font-size: 24px;
        text-align: center;
      }
      .signup-card p {
        color: var(--ink-soft);
        margin-bottom: 24px;
        font-size: 14px;
        text-align: center;
      }

      .role-selector {
        margin-bottom: 24px;
      }
      .role-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--ink);
        margin-bottom: 12px;
      }
      .role-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .role-option {
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-m);
        padding: 16px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: all 0.2s;
        background: var(--card);
      }
      .role-option.selected {
        border-color: var(--forest);
        background: var(--forest-tint);
      }
      .role-option input {
        display: none;
      }
      .role-title {
        font-family: var(--display);
        font-weight: 600;
        font-size: 15px;
        color: var(--ink);
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 500;
        color: var(--ink);
      }
      .form-control {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-s);
        font-family: var(--body);
        font-size: 14px;
      }
      .error-msg {
        color: var(--rose);
        font-size: 13px;
        margin-bottom: 16px;
        text-align: center;
        background: var(--rose-tint);
        padding: 8px;
        border-radius: 4px;
      }
      .btn {
        width: 100%;
        margin-top: 8px;
      }
    `,
  ],
})
export class CompleteProfileComponent implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  googleData: any = null;
  errorMessage = '';
  isLoading = false;

  profileForm: FormGroup = this.fb.group({
    mobile: ['', Validators.required],
    preferredLanguage: ['', Validators.required],
    favoriteGenres: [''],
    role: ['reader', Validators.required],
  });

  ngOnInit() {
    // Check if we have google data in state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['googleData']) {
      this.googleData = navigation.extras.state['googleData'];
    } else {
      // Fallback, check local storage or redirect to login
      const storedData = sessionStorage.getItem('pendingGoogleUser');
      if (storedData) {
        this.googleData = JSON.parse(storedData);
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Please fill out all mandatory details correctly.';
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = {
      ...this.profileForm.value,
      email: this.googleData.email,
      name: this.googleData.name,
      picture: this.googleData.picture,
    };

    if (typeof formData.favoriteGenres === 'string') {
      formData.favoriteGenres = formData.favoriteGenres
        .split(',')
        .map((g: string) => g.trim())
        .filter(Boolean);
    }

    this.auth.completeGoogleProfile(formData).subscribe({
      next: () => {
        this.isLoading = false;
        sessionStorage.removeItem('pendingGoogleUser');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.msg ||
          err.message ||
          'An error occurred during registration.';
      },
    });
  }
}

