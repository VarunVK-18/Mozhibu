import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GoogleSigninButtonModule],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <h2>Sign In to Mozhibu</h2>
        <p>Welcome back! Please enter your details.</p>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <input type="email" formControlName="email" class="form-control" placeholder="Email" />
            <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid" class="validation-error">
              Please enter a valid email address (e.g. name&#64;domain.com).
            </div>
          </div>
          
          <div class="form-group">
            <div class="input-wrapper">
              <input [type]="showPassword ? 'text' : 'password'" formControlName="password" class="form-control" placeholder="Password" />
              <button type="button" class="eye-btn" (click)="togglePassword()">
                <svg *ngIf="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg *ngIf="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
            <div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid" class="field-error">
              Password is required.
            </div>
            <div class="forgot-link">
              <a routerLink="/forgot-password">Forgot Password?</a>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-msg">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
          <div class="divider">
            <span>OR</span>
          </div>

          <div class="social-login">
            <asl-google-signin-button type="standard" size="large" text="signin_with" shape="rectangular" theme="outline"></asl-google-signin-button>
          </div>
        </form>
        
        <div class="signup-link">
          Don't have an account? <a [routerLink]="['/signup']" [queryParams]="{ returnUrl: returnUrl }">Sign up</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap { 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: calc(100vh - 150px);
      background: var(--paper);
      padding: 40px 20px;
    }
    .login-card { 
      background: var(--card); 
      padding: 48px; 
      border-radius: var(--radius-l); 
      border: 1px solid var(--border-soft); 
      box-shadow: 0 10px 30px -10px rgba(43, 38, 32, 0.1);
      max-width: 400px;
      width: 100%;
    }
    .login-card h2 { 
      margin-bottom: 8px; 
      font-family: var(--display);
      font-size: 24px;
      text-align: center;
    }
    .login-card p {
      color: var(--ink-soft);
      margin-bottom: 24px;
      font-size: 14px;
      text-align: center;
    }
    .form-group {
      margin-bottom: 20px;
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
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-wrapper .form-control {
      padding-right: 40px;
    }
    .eye-btn {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: var(--ink-faint);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0;
      transition: color 0.2s;
    }
    .forgot-link {
      text-align: right;
      margin-top: 6px;
      font-size: 12px;
    }
    .forgot-link a {
      color: var(--forest);
      text-decoration: none;
      font-weight: 500;
    }
    .forgot-link a:hover {
      text-decoration: underline;
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
    .validation-error {
      color: var(--rose);
      font-size: 12px;
      margin-top: 6px;
    }
    .btn {
      width: 100%;
      margin-top: 8px;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .signup-link {
      margin-top: 24px;
      text-align: center;
      font-size: 14px;
      color: var(--ink-soft);
    }
    .signup-link a {
      color: var(--forest);
      font-weight: 600;
      text-decoration: none;
    }
    .signup-link a:hover {
      text-decoration: underline;
    }
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 24px 0;
      color: var(--ink-faint);
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--border-soft);
    }
    .divider span {
      padding: 0 10px;
      font-size: 12px;
      font-weight: 500;
    }
    .social-login {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }
    @media (max-width: 600px) {
      .login-wrap {
        padding: 24px 16px;
      }
      .login-card {
        padding: 32px 24px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  socialAuthService = inject(SocialAuthService);

  returnUrl = '/';

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.socialAuthService.authState.subscribe((user) => {
      console.log('Google Auth State Emitted:', user);
      if (user && user.idToken) {
        this.isLoading = true;
        this.auth.loginWithGoogle(user.idToken).subscribe({
          next: (res) => {
            console.log('Backend response:', res);
            this.isLoading = false;
            if (res.isNewUser) {
              sessionStorage.setItem('pendingGoogleUser', JSON.stringify(res.googleData));
              this.router.navigate(['/complete-profile']);
            } else if (res.user && res.user.role === 'superadmin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigateByUrl(this.returnUrl);
            }
          },
          error: (err) => {
            console.error('Backend Error:', err);
            this.isLoading = false;
            this.errorMessage = err.error?.msg || err.message || 'An error occurred during Google sign in.';
            alert('Error from backend: ' + this.errorMessage);
          }
        });
      } else if (user) {
        console.warn('User emitted but no idToken present!', user);
        alert('Google popup closed, but no ID token was received.');
      }
    });
  }

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
    password: ['', Validators.required]
  });

  errorMessage = '';
  isLoading = false;
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.user && res.user.role === 'superadmin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (err) => {
        this.isLoading = false;
        // The backend returns { msg: '...' } for 400 errors
        if (err.error && err.error.msg) {
          this.errorMessage = err.error.msg;
        } else {
          this.errorMessage = 'An error occurred during sign in.';
        }
      }
    });
  }
}
