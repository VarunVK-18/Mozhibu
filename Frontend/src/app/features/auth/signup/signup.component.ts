import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GoogleSigninButtonModule],
  template: `
    <div class="signup-wrap">
      <div class="signup-card">
        <h2>Create an Account</h2>
        <p>Join Mozhibu today.</p>
        
        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          
          <div class="role-selector">
            <p class="role-label">What brings you to Mozhibu?</p>
            <div class="role-options">
              <label class="role-option" [class.selected]="signupForm.get('role')?.value === 'reader'">
                <input type="radio" formControlName="role" value="reader" />
                <span class="role-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.7402V4.67019C22 3.47019 21.02 2.58019 19.83 2.68019H19.77C17.67 2.86019 14.48 3.93019 12.7 5.05019L12.53 5.16019C12.24 5.34019 11.76 5.34019 11.47 5.16019L11.22 5.01019C9.44 3.90019 6.26 2.84019 4.16 2.67019C2.97 2.57019 2 3.47019 2 4.66019V16.7402C2 17.7002 2.78 18.6002 3.74 18.7202L4.03 18.7602C6.2 19.0502 9.55 20.1502 11.47 21.2002L11.51 21.2202C11.78 21.3702 12.21 21.3702 12.47 21.2202C14.39 20.1602 17.75 19.0502 19.93 18.7602L20.26 18.7202C21.22 18.6002 22 17.7002 22 16.7402Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path opacity="0.4" d="M12 5.49023V20.4902" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path opacity="0.4" d="M7.75 8.49023H5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path opacity="0.4" d="M8.5 11.4902H5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="role-title">I want to read</span>
                <span class="role-desc">Discover and read amazing stories</span>
              </label>
              <label class="role-option" [class.selected]="signupForm.get('role')?.value === 'writer'">
                <input type="radio" formControlName="role" value="writer" />
                <span class="role-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5502 3C6.69782 3.00694 4.6805 3.10152 3.39128 4.39073C2 5.78202 2 8.02125 2 12.4997C2 16.9782 2 19.2174 3.39128 20.6087C4.78257 22 7.0218 22 11.5003 22C15.9787 22 18.218 22 19.6093 20.6087C20.8985 19.3195 20.9931 17.3022 21 13.4498" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M11.0556 13C10.3322 3.86635 16.8023 1.27554 21.9805 2.16439C22.1896 5.19136 20.7085 6.32482 17.8879 6.84825C18.4326 7.41736 19.395 8.13354 19.2912 9.02879C19.2173 9.66586 18.7846 9.97843 17.9194 10.6036C16.0231 11.9736 13.8264 12.8375 11.0556 13Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 17C11 11.5 12.9604 9.63636 15 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="role-title">I want to publish</span>
                <span class="role-desc">Write and share my own books</span>
              </label>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Username</label>
              <input type="text" formControlName="username" class="form-control" placeholder="ravi123" (input)="onUsernameInput($event)" />
              <div *ngIf="signupForm.get('username')?.touched && signupForm.get('username')?.hasError('pattern')" class="field-error">
                Username can only contain letters and numbers.
              </div>
            </div>
            <div class="form-group">
              <label>Mobile</label>
              <input type="text" formControlName="mobile" class="form-control" placeholder="9876543210" />
              <div *ngIf="signupForm.get('mobile')?.touched && signupForm.get('mobile')?.hasError('pattern')" class="field-error">
                Mobile number must be exactly 10 digits.
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" class="form-control" placeholder="use@gmail.com" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" class="form-control" placeholder="••••••••" />
                <button type="button" class="eye-btn" (click)="togglePassword()">
                  <svg *ngIf="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg *ngIf="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
              <div *ngIf="signupForm.get('password')?.touched && signupForm.get('password')?.hasError('pattern')" class="field-error">
                Password must be 8-16 characters, have 1 uppercase, 1 number, and no emojis.
              </div>
            </div>
            
            <div class="form-group">
              <label>Confirm Password</label>
              <div class="input-wrapper">
                <input [type]="showConfirmPassword ? 'text' : 'password'" formControlName="confirmPassword" class="form-control" placeholder="••••••••" />
                <button type="button" class="eye-btn" (click)="toggleConfirmPassword()">
                  <svg *ngIf="!showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg *ngIf="showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
              <div *ngIf="signupForm.hasError('passwordMismatch') && signupForm.get('confirmPassword')?.touched" class="field-error">
                Passwords do not match.
              </div>
            </div>
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
              <select formControlName="favoriteGenres" class="form-control">
                <option value="" disabled>Select a genre</option>
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
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-msg">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="isLoading">
            {{ isLoading ? 'Creating account...' : 'Sign Up' }}
          </button>
          
          <div class="divider">
            <span>OR</span>
          </div>

          <div class="social-login">
            <asl-google-signin-button type="standard" size="large" text="signup_with" shape="rectangular" theme="outline"></asl-google-signin-button>
          </div>
        </form>
        
        <div class="login-link">
          Already have an account? <a [routerLink]="['/login']" [queryParams]="{ returnUrl: returnUrl }">Log in</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
      margin-bottom: 12px !important;
      text-align: left !important;
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
      background: #fff;
    }
    .role-option:hover {
      border-color: var(--border);
    }
    .role-option.selected {
      border-color: var(--forest);
      background: var(--forest-tint);
    }
    .role-option input {
      display: none;
    }
    .role-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 8px;
      color: var(--ink-soft);
    }
    .role-option.selected .role-icon {
      color: var(--forest-deep);
    }
    .role-title {
      font-family: var(--display);
      font-weight: 600;
      font-size: 15px;
      color: var(--ink);
      margin-bottom: 4px;
    }
    .role-desc {
      font-size: 11px;
      color: var(--ink-soft);
      line-height: 1.3;
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
    .eye-btn:hover {
      color: var(--ink);
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
    .btn {
      width: 100%;
      margin-top: 8px;
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
      .signup-wrap {
        padding: 24px 16px;
      }
      .signup-card {
        padding: 32px 24px;
      }
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
      .role-options {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  `]
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
            this.errorMessage = err.error?.msg || err.message || 'An error occurred during Google sign up.';
            alert('Error from backend: ' + this.errorMessage);
          }
        });
      } else if (user) {
        console.warn('User emitted but no idToken present!', user);
        alert('Google popup closed, but no ID token was received.');
      }
    });
  }

  // Regex: At least 8 chars, 1 uppercase, 1 number
  passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

  signupForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
    mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)[\x20-\x7E]{8,16}$/)]],
    confirmPassword: ['', Validators.required],
    preferredLanguage: ['', Validators.required],
    favoriteGenres: [''],
    role: ['reader', Validators.required]
  }, { validators: passwordMatchValidator });

  errorMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  onUsernameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Remove any non-alphanumeric characters
    value = value.replace(/[^a-zA-Z0-9\s]/g, '');

    // Convert to camelCase
    value = value.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');

    this.signupForm.patchValue({ username: value }, { emitEvent: false });
    // Update the input value directly so the user sees the change immediately
    input.value = value;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill out all mandatory details correctly.';
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = { ...this.signupForm.value, authProvider: 'normal' };
    
    // Split favoriteGenres by comma if it's a string
    if (typeof formData.favoriteGenres === 'string') {
      formData.favoriteGenres = formData.favoriteGenres.split(',').map((g: string) => g.trim()).filter(Boolean);
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
      }
    });
  }
}
