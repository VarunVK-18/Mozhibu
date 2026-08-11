import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { AdminBook } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private api = inject(ApiService);

  getPublishedBooks(query: string = ''): Observable<AdminBook[]> {
    const endpoint = query ? `/books?q=${encodeURIComponent(query)}` : '/books';
    return this.api.get(endpoint);
  }

  getBookById(id: string): Observable<AdminBook> {
    return this.api.get(`/books/${id}`);
  }

  getBooks(sort: string = '', genre: string = '', isAudio: boolean = false): Observable<AdminBook[]> {
    let params = [];
    if (sort) params.push(`sort=${sort}`);
    if (genre) params.push(`genre=${encodeURIComponent(genre)}`);
    if (isAudio) params.push(`isAudio=true`);
    
    const qs = params.length > 0 ? `?${params.join('&')}` : '';
    return this.api.get(`/books${qs}`);
  }

  getChapters(bookId: string): Observable<any[]> {
    return this.api.get(`/books/${bookId}/chapters`);
  }

  getReviews(bookId: string): Observable<any[]> {
    return this.api.get(`/books/${bookId}/reviews`);
  }

  getCategories(): Observable<string[]> {
    return this.api.get('/books/categories');
  }
}
