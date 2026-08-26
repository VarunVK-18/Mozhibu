import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface AuthorProfile {
  author: {
    _id: string;
    username: string;
    avatar?: string;
    followersCount: number;
    bio?: string;
    role: string;
    createdAt: string;
  };
  books: any[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private api = inject(ApiService);

  getAuthorProfile(id: string): Observable<AuthorProfile> {
    return this.api.get(`/users/author/${id}`);
  }

  followAuthor(id: string): Observable<any> {
    return this.api.post(`/users/follow/${id}`, {});
  }
}
