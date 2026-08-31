import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import {
  SocialAuthService,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';

export function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup',
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
        <a routerLink="/" class="logo" style="display: flex; align-items: center; gap: 8px; text-decoration: none;">
          <img src="assets/logo.png" alt="Mozhibu Logo" style="height: 36px; object-fit: contain;" />
          <div style="display: flex; flex-direction: column; align-items: center;">
            <span style="font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: 700; color: #f5f5f5; line-height: 1.1; letter-spacing: 0.5px;">Mozhibu</span>
            <span style="display: flex; align-items: center; gap: 6px; font-size: 8.5px; color: #8b7355; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 1px; white-space: nowrap;">
              <span style="width: 16px; height: 1px; background: #8b7355;"></span>
              IT'S A NOVEL IDEA
              <span style="width: 16px; height: 1px; background: #8b7355;"></span>
            </span>
          </div>
        </a>
        <div class="tagline-container">
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
        <div style="max-width: 440px; width: 100%;">
          <a routerLink="/" style="display: inline-flex; align-items: center; gap: 6px; color: #666; text-decoration: none; font-size: 14px; font-weight: 500; margin-bottom: 16px; transition: color 0.2s;" onmouseover="this.style.color='#1e342c'" onmouseout="this.style.color='#666'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Home
          </a>
          <div class="signup-card" style="max-width: 100%;">
          <h2 style="text-align: center;">Create an account</h2>
          <p style="text-align: center;">Join Mozhibu today.</p>

          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
            
            <div class="form-row">
              <div class="form-group">
                <input
                  type="text"
                  formControlName="username"
                  class="form-control"
                  placeholder="Username"
                  (input)="onUsernameInput($event)"
                  (blur)="trimField('username')"
                />
                <div *ngIf="getErrorMessage('username')" class="field-error">
                  {{ getErrorMessage('username') }}
                </div>
              </div>
              <div class="form-group">
                <input
                  type="text"
                  formControlName="mobile"
                  class="form-control"
                  placeholder="Mobile Number"
                  maxlength="10"
                  (input)="onMobileInput($event)"
                />
                <div *ngIf="getErrorMessage('mobile')" class="field-error">
                  {{ getErrorMessage('mobile') }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <input
                type="email"
                formControlName="email"
                class="form-control"
                placeholder="Email Address"
                (blur)="trimField('email')"
              />
              <div *ngIf="getErrorMessage('email')" class="field-error">
                {{ getErrorMessage('email') }}
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <div class="input-wrapper">
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="password"
                    class="form-control"
                    placeholder="Password"
                    maxlength="16"
                    (input)="onPasswordInput($event)"
                  />
                  <button
                    type="button"
                    class="eye-btn"
                    (click)="togglePassword()"
                  >
                    <svg *ngIf="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg *ngIf="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </button>
                </div>
                <div *ngIf="getErrorMessage('password')" class="field-error">
                  {{ getErrorMessage('password') }}
                </div>
              </div>

              <div class="form-group">
                <div class="input-wrapper">
                  <input
                    [type]="showConfirmPassword ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    class="form-control"
                    placeholder="Confirm Password"
                    maxlength="16"
                  />
                  <button
                    type="button"
                    class="eye-btn"
                    (click)="toggleConfirmPassword()"
                  >
                    <svg *ngIf="!showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg *ngIf="showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </button>
                </div>
                <div *ngIf="getErrorMessage('confirmPassword')" class="field-error">
                  {{ getErrorMessage('confirmPassword') }}
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <select formControlName="preferredLanguage" class="form-control">
                  <option value="" disabled>Preferred Language</option>
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="hi">Hindi</option>
                  <option value="te">Telugu</option>
                  <option value="bn">Bengali</option>
                </select>
                <div *ngIf="getErrorMessage('preferredLanguage')" class="field-error">
                  {{ getErrorMessage('preferredLanguage') }}
                </div>
              </div>
              <div class="form-group">
                <select formControlName="favoriteGenres" class="form-control">
                  <option value="" disabled>Favorite Genre</option>
                  <option value="Action">Action</option>
                  <option value="Romance">Romance</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Horror">Horror</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Drama">Drama</option>
                </select>
                <div *ngIf="getErrorMessage('favoriteGenres')" class="field-error">
                  {{ getErrorMessage('favoriteGenres') }}
                </div>
              </div>
            </div>

            <div *ngIf="errorMessage && errorMessage !== 'Please fill out all mandatory details correctly.'" class="error-msg">
              {{ errorMessage }}
            </div>

            <div class="form-group" style="margin-top: 16px; margin-bottom: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer;">
                <input type="checkbox" formControlName="isAgeChecked" style="width: 16px; height: 16px; cursor: pointer;">
                I am above 18+
              </label>
            </div>

            <div class="form-group" *ngIf="signupForm.get('isAgeChecked')?.value" style="margin-bottom: 16px;">
              <label style="display: block; font-size: 13px; color: #666; margin-bottom: 4px;">Date of Birth</label>
              <input type="date" formControlName="dob" class="form-control" style="width: 100%;">
              <div *ngIf="ageError" class="field-error" style="margin-top: 4px; color: #e53935; font-size: 12px;">
                {{ ageError }}
              </div>
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="isLoading || !isAgeVerified">
              {{ isLoading ? 'Creating account...' : 'Create account' }}
            </button>

            <div class="divider">
              <span>OR</span>
            </div>

            <div class="social-login-wrapper" style="position: relative; width: 100%;">
              <!-- Overlay to block clicks when age not verified -->
              <div 
                *ngIf="!isAgeVerified" 
                style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 10; cursor: not-allowed;"
                (click)="onSocialLoginOverlayClick()"
                title="Please check the 18+ box and enter your date of birth first"
              ></div>

              <div class="social-login" style="display: flex; flex-direction: column; gap: 12px; align-items: center; width: 100%;">
                <div style="width: 200px; height: 32px; overflow: hidden; border-radius: 4px; background-color: white; position: relative;">
                  <div style="position: absolute; top: -4px; left: -4px; width: 208px; height: 40px;">
                    <asl-google-signin-button
                      type="standard"
                      size="large"
                      text="signup_with"
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
                  [disabled]="!isAgeVerified"
                  [style.opacity]="!isAgeVerified ? '0.5' : '1'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#1877f2">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.2 12h-1.8v8h-3.2v-8H8.5V9.5h1.7V7.6c0-2.3 1.4-3.6 3.5-3.6 1 0 1.8.1 2.1.1v2.4h-1.4c-1.1 0-1.3.5-1.3 1.3v1.7h2.7l-.4 2.5z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </form>

          <div class="login-link">
            Already have an account?
            <a [routerLink]="['/login']" [queryParams]="{ returnUrl: returnUrl }"
              >Log in</a
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
        min-height: 100vh;
        background: #faf9f5;
        font-family: 'Inter', Roboto, sans-serif;
      }
      .split-layout {
        display: flex;
        min-height: 100vh;
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
        align-items: center;
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
        align-items: center;
        justify-content: center;
        padding: 40px;
      }
      .signup-card {
        background: var(--card, #fff);
        padding: 40px 48px;
        border-radius: var(--radius-l, 12px);
        border: 1px solid var(--border-soft, #ebebeb);
        box-shadow: 0 10px 30px -10px rgba(43, 38, 32, 0.1);
        max-width: 460px;
        width: 100%;
      }
      .signup-card h2 {
        margin-bottom: 8px;
        font-family: var(--display, 'Merriweather', serif);
        font-size: 24px;
        text-align: center;
      }
      .signup-card p {
        color: var(--ink-soft, #666);
        margin-bottom: 24px;
        font-size: 14px;
        text-align: center;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .form-group {
        margin-bottom: 12px;
        position: relative;
      }
      .form-control {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid var(--border-soft, #dcdcdc);
        border-radius: var(--radius-s, 6px);
        font-family: var(--body, inherit);
        font-size: 13px;
        color: #111;
        transition: all 0.2s;
        box-sizing: border-box;
      }
      .form-control::placeholder {
        color: #bbb;
      }
      .form-control:focus {
        outline: none;
        border-color: var(--gold, #d4af37);
      }
      select.form-control {
        padding: 8px 0;
        color: #111;
      }
      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }
      .input-wrapper .form-control {
        padding-right: 60px;
      }
      .eye-btn {
        position: absolute;
        right: 8px;
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 4px;
        transition: color 0.2s;
      }
      .eye-btn:hover {
        color: #111;
      }
      .field-error, .validation-error {
        color: #d32f2f;
        font-size: 11px;
        margin-top: 2px;
      }
      .error-msg {
        color: #d32f2f;
        font-size: 12px;
        margin-bottom: 12px;
        padding: 8px;
        background: #fde8e8;
        border-radius: 4px;
      }
      .btn {
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 4px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-primary {
        background-color: #1e342c;
        color: white;
        margin-top: 4px;
      }
      .btn-primary:hover:not(:disabled) {
        background-color: #15251f;
      }
      .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .divider {
        display: flex;
        align-items: center;
        margin: 16px 0;
        color: #999;
      }
      .divider::before,
      .divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #e0e0e0;
      }
      .divider span {
        padding: 0 12px;
        font-size: 11px;
      }
      .social-login {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
      }
      .google-btn-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
      }
      .btn-social {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        background-color: white;
        color: #333;
        border: none;
        border-radius: 4px;
        padding: 8px;
        font-family: Roboto, sans-serif;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .btn-social:hover {
        background-color: #f8f9fa;
      }
      .login-link {
        margin-top: 16px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      .login-link a {
        color: #111;
        font-weight: 600;
        text-decoration: none;
        margin-left: 4px;
        border-bottom: 1px solid #111;
      }
      .login-link a:hover {
        color: #1e342c;
        border-bottom-color: #1e342c;
      }
      
      @media (max-width: 768px) {
        .split-layout {
          flex-direction: column;
        }
        .left-panel {
          display: none;
        }
        .right-panel {
          padding: 24px 16px;
        }
        .signup-card {
          padding: 32px 24px;
        }
      }
    `,
  ],
})
export class SignupComponent implements OnInit {
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
              'An error occurred during Google sign up.';
            alert('Error from backend: ' + this.errorMessage);
          },
        });
      } else if (user) {
        console.warn('User emitted but no idToken present!', user);
        alert('Google popup closed, but no ID token was received.');
      }
    });
  }

  signupForm: FormGroup = this.fb.group(
    {
      username: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z0-9_]{3,30}$/),
        ],
      ],
      mobile: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[6-9][0-9]{9}$/),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
          ),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s])[^\s]{8,16}$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
      preferredLanguage: ['', Validators.required],
      favoriteGenres: ['', Validators.required],
      role: ['reader', Validators.required],
      isAgeChecked: [false, Validators.requiredTrue],
      dob: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  errorMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  get isAgeVerified(): boolean {
    const isChecked = this.signupForm.get('isAgeChecked')?.value;
    const dobValue = this.signupForm.get('dob')?.value;
    if (!isChecked || !dobValue) return false;

    const dob = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age >= 18;
  }

  get ageError(): string {
    const isChecked = this.signupForm.get('isAgeChecked')?.value;
    const dobValue = this.signupForm.get('dob')?.value;
    if (isChecked && dobValue && !this.isAgeVerified) {
      return 'You must be at least 18 years old to sign up.';
    }
    return '';
  }

  onSocialLoginOverlayClick() {
    if (!this.signupForm.get('isAgeChecked')?.value) {
      this.errorMessage = 'Please check the "I am above 18+" box and enter your date of birth.';
    } else if (!this.signupForm.get('dob')?.value) {
      this.errorMessage = 'Please enter your date of birth to verify your age.';
    } else if (!this.isAgeVerified) {
      this.errorMessage = 'You must be at least 18 years old to sign up.';
    }
  }

  onUsernameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(/[^A-Za-z0-9_]/g, '');
    this.signupForm.patchValue({ username: value }, { emitEvent: false });
    input.value = value;
  }

  onMobileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(/[^0-9]/g, '').slice(0, 10);
    this.signupForm.patchValue({ mobile: value }, { emitEvent: false });
    input.value = value;
  }

  onPasswordInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(/\s/g, '');
    this.signupForm.patchValue({ password: value }, { emitEvent: false });
    input.value = value;
  }

  trimField(field: string) {
    const control = this.signupForm.get(field);
    if (control && typeof control.value === 'string') {
      control.setValue(control.value.trim());
    }
  }

  getErrorMessage(field: string): string {
    const control = this.signupForm.get(field);
    if (!control || !control.touched) return '';

    if (field === 'confirmPassword' && this.signupForm.hasError('passwordMismatch')) {
      return 'Passwords do not match.';
    }

    if (control.hasError('required')) {
      switch (field) {
        case 'username': return 'Username is required.';
        case 'mobile': return 'Mobile number is required.';
        case 'email': return 'Email address is required.';
        case 'password': return 'Password is required.';
        case 'confirmPassword': return 'Please confirm your password.';
        case 'preferredLanguage': return 'Please select a language.';
        case 'favoriteGenres': return 'Please select a genre.';
      }
    }

    if (control.hasError('pattern')) {
      switch (field) {
        case 'username': return 'Username must be 3–30 characters and contain only letters, numbers, or underscores.';
        case 'mobile': return 'Enter a valid 10-digit mobile number.';
        case 'email': return 'Enter a valid email address.';
        case 'password': return 'Password must be 8–16 characters, include 1 uppercase letter, 1 number, and 1 special character.';
      }
    }

    return '';
  }

  focusFirstInvalidField() {
    for (const key of Object.keys(this.signupForm.controls)) {
      if (this.signupForm.controls[key].invalid) {
        const invalidControl = document.querySelector(`[formControlName="${key}"]`);
        if (invalidControl) {
          (invalidControl as HTMLElement).focus();
          break;
        }
      }
    }
    
    if (this.signupForm.hasError('passwordMismatch')) {
      const confirmPasswordControl = document.querySelector(`[formControlName="confirmPassword"]`);
      if (confirmPasswordControl) {
        (confirmPasswordControl as HTMLElement).focus();
      }
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = { ...this.signupForm.value, authProvider: 'normal' };

    // Split favoriteGenres by comma if it's a string
    if (typeof formData.favoriteGenres === 'string') {
      formData.favoriteGenres = formData.favoriteGenres
        .split(',')
        .map((g: string) => g.trim())
        .filter(Boolean);
    }

    // Remove confirmPassword before sending to backend
    delete formData.confirmPassword;

    this.auth.register(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('--- REGISTRATION ERROR DEBUG ---');
        console.error(err);

        if (err.error && err.error.msg) {
          this.errorMessage = err.error.msg;
        } else if (err.message) {
          // This will capture connection refused or CORS errors
          this.errorMessage = 'Network/System Error: ' + err.message;
        } else {
          this.errorMessage = 'An error occurred during registration.';
        }
      },
    });
  }

  onFacebookLoginClick() {
    alert('Facebook Login UI added! Waiting for App ID to finish integration.');
  }
}
