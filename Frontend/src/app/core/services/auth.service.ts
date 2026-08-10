import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  mobile: string;
  role?: string;
  authorStatus?: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  user = signal<User | null>(null);

  constructor() {
    // Check if user exists in local storage on startup
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      this.user.set(JSON.parse(storedUser));
    }
  }

  register(userData: any): Observable<any> {
    return this.api.post('/auth/register', userData).pipe(
      tap((res: any) => this.handleAuthResponse(res))
    );
  }

  login(credentials: any): Observable<any> {
    return this.api.post('/auth/login', credentials).pipe(
      tap((res: any) => this.handleAuthResponse(res))
    );
  }

  upgradeRole(): Observable<any> {
    return this.api.put('/users/upgrade-role', {}).pipe(
      tap((res: any) => this.handleAuthResponse(res))
    );
  }

  logout() {
    this.user.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  private handleAuthResponse(res: any) {
    if (res && res.token && res.user) {
      this.user.set(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
  }
}
