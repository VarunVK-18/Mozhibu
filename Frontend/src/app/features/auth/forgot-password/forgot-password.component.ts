import { Component, inject } from '@angular/core';
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
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrap">
      <div class="auth-card">
        <h2>Forgot Password</h2>
        <p>Enter your email and we will send you a reset link.</p>

        <div *ngIf="successMessage" class="success-msg">
          {{ successMessage }}
        </div>

        <form
          *ngIf="!successMessage"
          [formGroup]="forgotForm"
          (ngSubmit)="onSubmit()"
        >
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              formControlName="email"
              class="form-control"
              placeholder="your@email.com"
            />
            <div
              *ngIf="
                forgotForm.get('email')?.touched &&
                forgotForm.get('email')?.invalid
              "
              class="field-error"
            >
              Please enter a valid email address.
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-msg">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="isLoading || forgotForm.invalid"
          >
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>

        <div class="login-link">
          Remembered your password? <a routerLink="/login">Log in</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 150px);
        background: var(--paper);
        padding: 40px 20px;
      }
      .auth-card {
        background: var(--card);
        padding: 40px 48px;
        border-radius: var(--radius-l);
        border: 1px solid var(--border-soft);
        box-shadow: 0 10px 30px -10px rgba(43, 38, 32, 0.1);
        max-width: 480px;
        width: 100%;
      }
      .auth-card h2 {
        margin-bottom: 8px;
        font-family: var(--display);
        font-size: 24px;
        text-align: center;
      }
      .auth-card p {
        color: var(--ink-soft);
        margin-bottom: 24px;
        font-size: 14px;
        text-align: center;
      }
      .form-group {
        margin-bottom: 20px;
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
        transition: all 0.2s;
      }
      .form-control:focus {
        outline: none;
        border-color: var(--gold);
      }
      .field-error {
        color: var(--rose);
        font-size: 11px;
        margin-top: 6px;
        line-height: 1.3;
        display: block;
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
      .success-msg {
        color: var(--forest);
        font-size: 13px;
        margin-bottom: 16px;
        text-align: center;
        background: var(--forest-tint);
        padding: 16px;
        border-radius: 4px;
        font-weight: 500;
      }
      .btn {
        width: 100%;
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .login-link {
        margin-top: 24px;
        text-align: center;
        font-size: 14px;
        color: var(--ink-soft);
      }
      .login-link a {
        color: var(--forest);
        font-weight: 600;
        text-decoration: none;
      }
      .login-link a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class ForgotPasswordComponent {
  auth = inject(AuthService);
  fb = inject(FormBuilder);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage =
          res.msg ||
          'Password reset link has been generated. Please check the backend server console!';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.msg || 'An error occurred. Please try again.';
      },
    });
  }
}
