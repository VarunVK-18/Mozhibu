import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private langService = inject(LanguageService);
  
  // This automatically uses the URL from the correct environment file
  private baseUrl = environment.apiUrl;
  // The server root (without /api suffix) for serving static files
  readonly serverUrl = environment.apiUrl.replace(/\/api$/, '');

  /**
   * Converts a relative /uploads/... path stored in DB to a full URL.
   * If already a full URL or empty, returns it as-is.
   */
  getImageUrl(path: string | undefined | null): string {
    if (!path) return '';
    path = path.replace(/\\/g, '/');
    if (!path.startsWith('/') && !path.startsWith('http') && !path.startsWith('data:')) {
      path = '/' + path;
    }
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${this.serverUrl}${path}`;
  }

  getFallbackAvatar(name?: string): string {
    const initial = name ? name.charAt(0).toUpperCase() : 'U';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#333333"/><text x="50" y="55" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">${initial}</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  getFallbackCover(): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect width="400" height="600" fill="#3F6259"/><text x="200" y="300" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">Cover</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const currentLang = this.langService.currentLang();
    if (currentLang) {
      headers = headers.set('X-App-Language', currentLang);
    }
    return headers;
  }

  /**
   * Generic GET request
   * Example usage: this.apiService.get<User>('/users')
   */
  get<T>(endpoint: string): Observable<T> {
    // endpoint should start with a slash, e.g. '/users'
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders() });
  }

  /**
   * Generic POST request
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, { headers: this.getHeaders() });
  }

  /**
   * Generic PUT request
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, { headers: this.getHeaders() });
  }

  /**
   * Generic DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders() });
  }
}
