import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { AdminBook } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private api = inject(ApiService);

  getPublishedBooks(): Observable<AdminBook[]> {
    return this.api.get('/books');
  }

  getBookById(id: string): Observable<AdminBook> {
    return this.api.get(`/books/${id}`);
  }
}
