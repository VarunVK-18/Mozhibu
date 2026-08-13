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

  addReview(bookId: string, content: string, rating: number = 5): Observable<any> {
    return this.api.post(`/books/${bookId}/reviews`, { content, rating });
  }

  toggleCommentLike(bookId: string, reviewId: string): Observable<any> {
    return this.api.post(`/books/${bookId}/reviews/${reviewId}/like`, {});
  }

  toggleCommentDislike(bookId: string, reviewId: string): Observable<any> {
    return this.api.post(`/books/${bookId}/reviews/${reviewId}/dislike`, {});
  }

  replyToComment(bookId: string, reviewId: string, content: string): Observable<any> {
    return this.api.post(`/books/${bookId}/reviews/${reviewId}/reply`, { content });
  }

  getCategories(): Observable<string[]> {
    return this.api.get('/books/categories');
  }

  toggleLike(bookId: string): Observable<any> {
    return this.api.post(`/books/${bookId}/like`, {});
  }

  reportBook(bookId: string, reason: string): Observable<any> {
    return this.api.post(`/books/${bookId}/report`, { reason });
  }

  createBook(data: any): Observable<any> {
    return this.api.post('/books', data);
  }

  uploadCover(file: File): Observable<{coverUrl: string}> {
    const formData = new FormData();
    formData.append('cover', file);
    return this.api.post('/books/cover', formData);
  }

  updateBook(id: string, data: any): Observable<any> {
    return this.api.put(`/books/${id}`, data);
  }

  createChapter(bookId: string, data: any): Observable<any> {
    return this.api.post(`/books/${bookId}/chapters`, data);
  }

  getChapter(bookId: string, chapterId: string): Observable<any> {
    return this.api.get(`/books/${bookId}/chapters/${chapterId}`);
  }

  updateChapter(bookId: string, chapterId: string, data: any): Observable<any> {
    return this.api.put(`/books/${bookId}/chapters/${chapterId}`, data);
  }

  getMyBooks(): Observable<any[]> {
    return this.api.get('/books/me');
  }

  updateBookStatus(bookId: string, completionStatus: string): Observable<any> {
    return this.api.put(`/books/${bookId}/status`, { completionStatus });
  }
}
