import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminBook } from './admin.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private api = inject(ApiService);

  private fixCoverUrl(book: any): any {
    if (!book || !book.cover) return book;
    if (book.cover.startsWith('http')) return book;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return { ...book, cover: `${baseUrl}${book.cover}` };
  }

  getPublishedBooks(query: string = ''): Observable<AdminBook[]> {
    const endpoint = query ? `/books?q=${encodeURIComponent(query)}` : '/books';
    return this.api.get<AdminBook[]>(endpoint).pipe(
      map((books: AdminBook[]) => books.map(b => this.fixCoverUrl(b)))
    );
  }

  getBookById(id: string): Observable<AdminBook> {
    return this.api.get<AdminBook>(`/books/${id}`).pipe(
      map((book: AdminBook) => this.fixCoverUrl(book))
    );
  }

  getBooks(sort: string = '', genre: string = '', isAudio: boolean = false): Observable<AdminBook[]> {
    let params = [];
    if (sort) params.push(`sort=${sort}`);
    if (genre) params.push(`genre=${encodeURIComponent(genre)}`);
    if (isAudio) params.push(`isAudio=true`);
    
    const qs = params.length > 0 ? `?${params.join('&')}` : '';
    return this.api.get<AdminBook[]>(`/books${qs}`).pipe(
      map((books: AdminBook[]) => books.map(b => this.fixCoverUrl(b)))
    );
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
    return this.api.get(`/books/${bookId}/chapters/${chapterId}`).pipe(
      map(chapter => this.fixCoverUrl(chapter))
    );
  }

  updateChapter(bookId: string, chapterId: string, data: any): Observable<any> {
    return this.api.put(`/books/${bookId}/chapters/${chapterId}`, data);
  }

  deleteChapter(bookId: string, chapterId: string): Observable<any> {
    return this.api.delete(`/books/${bookId}/chapters/${chapterId}`);
  }

  getMyBooks(): Observable<any[]> {
    return this.api.get<any[]>('/books/me').pipe(
      map((books: any[]) => books.map(b => this.fixCoverUrl(b)))
    );
  }

  updateBookStatus(bookId: string, completionStatus: string): Observable<any> {
    return this.api.put(`/books/${bookId}/status`, { completionStatus });
  }
}
