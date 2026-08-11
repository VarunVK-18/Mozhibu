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
