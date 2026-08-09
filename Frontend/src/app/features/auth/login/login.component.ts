import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <h2>Login to Mozhibu</h2>
        <p>This is a simulated login page for testing.</p>
        <button class="btn btn-primary" (click)="onLogin()">Login as John Doe</button>
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
    }
    .login-card { 
      background: var(--card); 
      padding: 48px; 
      border-radius: var(--radius-l); 
      border: 1px solid var(--border-soft); 
      text-align: center; 
      box-shadow: 0 10px 30px -10px rgba(43, 38, 32, 0.1);
      max-width: 400px;
      width: 100%;
    }
    .login-card h2 { 
      margin-bottom: 12px; 
      font-family: var(--display);
      font-size: 24px;
    }
    .login-card p {
      color: var(--ink-soft);
      margin-bottom: 24px;
      font-size: 14px;
    }
    .login-card .btn {
      width: 100%;
    }
  `]
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  onLogin() {
    this.auth.login();
    this.router.navigate(['/']);
  }
}
