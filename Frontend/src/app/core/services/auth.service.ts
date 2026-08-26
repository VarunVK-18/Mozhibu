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
  followersCount?: number;
  bio?: string;
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
      // Fetch latest user data from backend to prevent stale local storage (e.g. missing avatar)
      this.api.get<User>('/users/me').subscribe({
        next: (latestUser: User) => {
          this.user.set({ ...this.user()!, ...latestUser, id: latestUser.id || (latestUser as any)._id });
          localStorage.setItem('user', JSON.stringify(this.user()));
        },
        error: () => {
          // If token is invalid or expired
          // this.logout();
        }
      });
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

  loginWithGoogle(token: string): Observable<any> {
    return this.api.post('/auth/google', { token }).pipe(
      tap((res: any) => {
        if (!res.isNewUser) {
          this.handleAuthResponse(res);
        }
      })
    );
  }

  completeGoogleProfile(userData: any): Observable<any> {
    return this.api.post('/auth/complete-profile', userData).pipe(
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

  getLibrary(): Observable<any[]> {
    return this.api.get('/users/me/library');
  }

  getFollowing(): Observable<any[]> {
    return this.api.get('/users/me/following');
  }

  getFollowers(): Observable<any[]> {
    return this.api.get('/users/me/followers');
  }

  getAuthors(): Observable<any[]> {
    return this.api.get('/users/authors');
  }

  followAuthor(authorId: string): Observable<any> {
    return this.api.post(`/users/follow/${authorId}`, {});
  }

  toggleBookmark(bookId: string): Observable<any> {
    return this.api.post(`/users/me/bookmarks/${bookId}`, {});
  }

  getReadingProgress(): Observable<any[]> {
    return this.api.get('/users/me/progress');
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.api.post('/users/me/avatar', formData).pipe(
      tap((res: any) => {
        if (res && res.avatar) {
          const currentUser = this.user();
          if (currentUser) {
            const updatedUser = { ...currentUser, avatar: res.avatar };
            this.user.set(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      })
    );
  }
  updateProfile(data: { bio?: string, avatar?: string | null }): Observable<any> {
    return this.api.put('/users/me/profile', data).pipe(
      tap((res: any) => {
        if (res && res.user) {
          const currentUser = this.user();
          if (currentUser) {
            const updatedUser = { ...currentUser, ...res.user };
            this.user.set(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.api.post('/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.api.post('/auth/reset-password', { token, password });
  }

  updateReadingProgress(bookId: string, chapterId?: string, progressPercentage?: number): Observable<any> {
    return this.api.post('/users/me/progress', { bookId, chapterId, progressPercentage });
  }

  deactivateAccount(): Observable<any> {
    return this.api.put('/users/me/deactivate', {});
  }

  deleteAccount(): Observable<any> {
    return this.api.delete('/users/me');
  }

  private handleAuthResponse(res: any) {
    if (res && res.token && res.user) {
      this.user.set(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
  }
}
