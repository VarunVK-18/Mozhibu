import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AdminBook } from './admin.service';
import { environment } from '../../../environments/environment';
import { OfflineService } from './offline.service';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private api = inject(ApiService);
  private offlineService = inject(OfflineService);

  private fixCoverUrl(book: any): any {
    if (!book || !book.cover) return book;
    if (book.cover.startsWith('http') || book.cover.startsWith('data:'))
      return book;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return { ...book, cover: `${baseUrl}${book.cover}` };
  }

  getPublishedBooks(
    query: string = '',
    page: number = 1,
    limit: number = 20,
  ): Observable<any> {
    const qs = query
      ? `q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      : `page=${page}&limit=${limit}`;
    return this.api.get<any>(`/books?${qs}`).pipe(
      map((res) => ({
        ...res,
        books: res.books.map((b: any) => this.fixCoverUrl(b)),
      })),
    );
  }

  getBookById(id: string): Observable<AdminBook> {
    const url = `/books/${id}`;
    return this.api.get<AdminBook>(url).pipe(
      map((book: AdminBook) => this.fixCoverUrl(book)),
      catchError((error) => {
        // Fallback to cache if network fails (status 0 or 504)
        if (error.status === 0 || error.status === 504) {
          return from(
            this.offlineService.getCachedResponse(
              `${environment.apiUrl}${url}`,
            ),
          ).pipe(
            switchMap((cached) => {
              if (cached) return of(this.fixCoverUrl(cached));
              return throwError(() => error);
            }),
          );
        }
        return throwError(() => error);
      }),
    );
  }

  getBooks(
    sort: string = '',
    genre: string = '',
    isAudio: boolean = false,
    page: number = 1,
    limit: number = 20,
  ): Observable<any> {
    let params = [`page=${page}`, `limit=${limit}`];
    if (sort) params.push(`sort=${sort}`);
    if (genre) params.push(`genre=${encodeURIComponent(genre)}`);
    if (isAudio) params.push(`isAudio=true`);

    const qs = `?${params.join('&')}`;
    return this.api.get<any>(`/books${qs}`).pipe(
      map((res) => ({
        ...res,
        books: res.books.map((b: any) => this.fixCoverUrl(b)),
      })),
    );
  }

  getChapters(bookId: string): Observable<any[]> {
    const url = `/books/${bookId}/chapters`;
    return this.api.get<any[]>(url).pipe(
      catchError((error) => {
        if (error.status === 0 || error.status === 504) {
          return from(
            this.offlineService.getCachedResponse(
              `${environment.apiUrl}${url}`,
            ),
          ).pipe(
            switchMap((cached) => {
              if (cached) return of(cached);
              return throwError(() => error);
            }),
          );
        }
        return throwError(() => error);
      }),
    );
  }

  getReviews(
    bookId: string,
    page: number = 1,
    limit: number = 20,
  ): Observable<any> {
    return this.api.get(`/books/${bookId}/reviews?page=${page}&limit=${limit}`);
  }

  addReview(
    bookId: string,
    content: string,
    rating: number = 5,
  ): Observable<any> {
    return this.api.post(`/books/${bookId}/reviews`, { content, rating });
  }

  toggleCommentLike(bookId: string, reviewId: string): Observable<any> {
    return this.api.post(`/books/${bookId}/reviews/${reviewId}/like`, {});
  }

  toggleCommentDislike(bookId: string, reviewId: string): Observable<any> {
    return this.api.post(`/books/${bookId}/reviews/${reviewId}/dislike`, {});
  }

  replyToComment(
    bookId: string,
    reviewId: string,
    content: string,
  ): Observable<any> {
    return this.api.post(`/books/${bookId}/reviews/${reviewId}/reply`, {
      content,
    });
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

  uploadCover(file: File): Observable<{ coverUrl: string }> {
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
    return this.api
      .get(`/books/${bookId}/chapters/${chapterId}`)
      .pipe(map((chapter) => this.fixCoverUrl(chapter)));
  }

  updateChapter(bookId: string, chapterId: string, data: any): Observable<any> {
    return this.api.put(`/books/${bookId}/chapters/${chapterId}`, data);
  }

  deleteChapter(bookId: string, chapterId: string): Observable<any> {
    return this.api.delete(`/books/${bookId}/chapters/${chapterId}`);
  }

  getMyBooks(): Observable<any[]> {
    return this.api
      .get<any[]>('/books/me')
      .pipe(map((books: any[]) => books.map((b) => this.fixCoverUrl(b))));
  }

  updateBookStatus(bookId: string, completionStatus: string): Observable<any> {
    return this.api.put(`/books/${bookId}/status`, { completionStatus });
  }
}
