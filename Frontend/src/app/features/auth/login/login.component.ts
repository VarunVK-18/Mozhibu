import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import {
  SocialAuthService,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GoogleSigninButtonModule,
  ],
  template: `
    <div class="split-layout">
      <!-- Left Panel -->
      <div class="left-panel">

        <!-- Spacer to push content down so it centers -->
        <div style="flex: 0.5;"></div>

        <div class="tagline-container">
          <a routerLink="/" class="logo" style="display: flex; align-items: center; gap: 8px; text-decoration: none; margin-bottom: 24px;">
            <img src="assets/logo.png" alt="Mozhibu Logo" style="height: 48px; object-fit: contain;" />
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-family: 'Times New Roman', Times, serif; font-size: 26px; font-weight: 700; color: #f5f5f5; line-height: 1.1; letter-spacing: 0.5px;">Mozhibu</span>
              <span style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: #8b7355; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; white-space: nowrap;">
                <span style="width: 20px; height: 1px; background: #8b7355;"></span>
                IT'S A NOVEL IDEA
                <span style="width: 20px; height: 1px; background: #8b7355;"></span>
              </span>
            </div>
          </a>
          <h1 class="tagline">Every reader<br>remembers the story<br>that <i>read them back.</i></h1>
        </div>
        <div class="footer">
          <div class="footer-line"></div>
          <div class="footer-content">
            <span>Stories in your language</span>
            <span>Est. 2023</span>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="right-panel">
        <div style="max-width: 400px; width: 100%; margin: auto;">
          <a routerLink="/" style="display: inline-flex; align-items: center; gap: 6px; color: #666; text-decoration: none; font-size: 14px; font-weight: 500; margin-bottom: 16px; transition: color 0.2s;" onmouseover="this.style.color='#1e342c'" onmouseout="this.style.color='#666'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Home
          </a>
          <div class="login-card" style="max-width: 100%;">
          <h2 style="text-align: center;">Sign In</h2>
          <p style="text-align: center;">Welcome back! Please enter your details.</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <input
                type="email"
                formControlName="email"
                class="form-control"
                placeholder="Email"
              />
              <div
                *ngIf="
                  loginForm.get('email')?.touched &&
                  loginForm.get('email')?.invalid
                "
                class="validation-error"
              >
                Please enter a valid email address.
              </div>
            </div>

            <div class="form-group">
              <div class="input-wrapper">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  class="form-control"
                  placeholder="Password"
                />
                <button type="button" class="eye-btn" (click)="togglePassword()">
                  <svg
                    *ngIf="!showPassword"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg
                    *ngIf="showPassword"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    ></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
              <div
                *ngIf="
                  loginForm.get('password')?.touched &&
                  loginForm.get('password')?.invalid
                "
                class="field-error"
              >
                Password is required.
              </div>
              <div class="forgot-link">
                <a routerLink="/forgot-password">Forgot password?</a>
              </div>
            </div>

            <div *ngIf="errorMessage" class="error-msg">
              {{ errorMessage }}
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="isLoading">
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
            
            <div class="divider">
              <span>OR</span>
            </div>

            <div class="social-login-wrapper" style="position: relative; width: 100%;">
              <div class="social-login" style="display: flex; flex-direction: column; gap: 12px; align-items: center; width: 100%;">
                <div style="width: 200px; height: 32px; overflow: hidden; border-radius: 4px; background-color: white; position: relative;">
                  <div style="position: absolute; top: -4px; left: -4px; width: 208px; height: 40px;">
                    <asl-google-signin-button
                      type="standard"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      theme="outline"
                      [width]="208"
                    ></asl-google-signin-button>
                  </div>
                </div>
                <button
                  type="button"
                  class="btn-social fb-btn"
                  style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; max-width: 200px; height: 32px; box-sizing: border-box; background-color: white; color: #333; border: none; outline: none; border-radius: 4px; padding: 0 10px; font-family: Roboto, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: none;"
                  (click)="onFacebookLoginClick()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#1877f2">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.2 12h-1.8v8h-3.2v-8H8.5V9.5h1.7V7.6c0-2.3 1.4-3.6 3.5-3.6 1 0 1.8.1 2.1.1v2.4h-1.4c-1.1 0-1.3.5-1.3 1.3v1.7h2.7l-.4 2.5z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </form>

          <div class="signup-link">
            Don't have an account?
            <a [routerLink]="['/signup']" [queryParams]="{ returnUrl: returnUrl }"
              >Sign up</a
            >
          </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
        background: #faf9f5;
        font-family: 'Inter', Roboto, sans-serif;
      }
      .split-layout {
        display: flex;
        height: 100vh;
        overflow: hidden;
      }
      .left-panel {
        flex: 1;
        background-color: #1e342c;
        color: #f5f5f5;
        padding: 40px 60px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .logo {
        font-size: 20px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }
      .logo b {
        font-weight: 700;
        margin-right: 4px;
      }
      .tagline-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
      }
      .tagline {
        font-family: 'Merriweather', Georgia, serif;
        font-size: 42px;
        line-height: 1.3;
        font-weight: 400;
        margin: 0;
      }
      .tagline i {
        font-style: italic;
      }
      .footer {
        width: 100%;
      }
      .footer-line {
        height: 1px;
        background-color: rgba(255, 255, 255, 0.2);
        margin-bottom: 16px;
      }
      .footer-content {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        opacity: 0.8;
      }
      .right-panel {
        flex: 1.2;
        background-color: var(--paper, #faf9f5);
        display: flex;
        flex-direction: column;
        padding: 40px;
        overflow-y: auto;
      }
      .login-card {
        background: var(--card, #fff);
        padding: 48px;
        border-radius: var(--radius-l, 12px);
        border: 1px solid var(--border-soft, #ebebeb);
        box-shadow: 0 10px 30px -10px rgba(43, 38, 32, 0.1);
        max-width: 400px;
        width: 100%;
      }
      .login-card h2 {
        margin-bottom: 8px;
        font-family: var(--display, 'Merriweather', serif);
        font-size: 24px;
        text-align: center;
      }
      .login-card p {
        color: var(--ink-soft, #666);
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
        border: 1px solid var(--border-soft, #dcdcdc);
        border-radius: var(--radius-s, 6px);
        font-family: var(--body, inherit);
        font-size: 14px;
        transition: all 0.2s;
        box-sizing: border-box;
      }
      .form-control:focus {
        outline: none;
        border-color: var(--gold, #d4af37);
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
        color: var(--ink-faint, #999);
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 0;
        transition: color 0.2s;
      }
      .eye-btn:hover {
        color: var(--ink, #111);
      }
      .forgot-link {
        text-align: right;
        margin-top: 6px;
        font-size: 12px;
      }
      .forgot-link a {
        color: var(--forest, #1e342c);
        text-decoration: none;
        font-weight: 500;
      }
      .forgot-link a:hover {
        text-decoration: underline;
      }
      .field-error {
        color: var(--rose, #d32f2f);
        font-size: 11px;
        margin-top: 6px;
        line-height: 1.3;
        display: block;
      }
      .error-msg {
        color: var(--rose, #d32f2f);
        font-size: 13px;
        margin-bottom: 16px;
        text-align: center;
        background: var(--rose-tint, #fde8e8);
        padding: 8px;
        border-radius: 4px;
      }
      .validation-error {
        color: var(--rose, #d32f2f);
        font-size: 12px;
        margin-top: 6px;
      }
      .btn {
        width: 100%;
        margin-top: 8px;
        padding: 12px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-primary {
        background-color: #1e342c;
        color: white;
      }
      .btn-primary:hover:not(:disabled) {
        background-color: #15251f;
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .signup-link {
        margin-top: 24px;
        text-align: center;
        font-size: 14px;
        color: var(--ink-soft, #666);
      }
      .signup-link a {
        color: var(--forest, #1e342c);
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
        color: var(--ink-faint, #999);
      }
      .divider::before,
      .divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--border-soft, #e0e0e0);
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
      
      @media (max-width: 768px) {
        .left-panel {
          display: none;
        }
        .right-panel {
          padding: 24px;
        }
        .mobile-logo {
          display: block;
        }
        .brand-small {
          display: none;
        }
      }
    `,
  ],
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
              sessionStorage.setItem(
                'pendingGoogleUser',
                JSON.stringify(res.googleData),
              );
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
            this.errorMessage =
              err.error?.msg ||
              err.message ||
              'An error occurred during Google sign in.';
            alert('Error from backend: ' + this.errorMessage);
          },
        });
      } else if (user) {
        console.warn('User emitted but no idToken present!', user);
        alert('Google popup closed, but no ID token was received.');
      }
    });
  }

  loginForm: FormGroup = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
    ],
    password: ['', Validators.required],
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
      },
    });
  }

  onFacebookLoginClick() {
    alert('Facebook Login UI added! Waiting for App ID to finish integration.');
  }
}
