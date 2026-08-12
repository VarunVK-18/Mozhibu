import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface SearchParams {
  q?: string;
  type?: string;
  genre?: string;
  language?: string;
  status?: string;
  sort?: string;
}

export interface SearchResult {
  type: string;
  results: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private api = inject(ApiService);

  search(params: SearchParams): Observable<SearchResult> {
    let queryParams = '?';
    Object.keys(params).forEach(key => {
      const val = (params as any)[key];
      if (val) {
        queryParams += `${key}=${encodeURIComponent(val)}&`;
      }
    });
    // Remove trailing '&' or '?'
    queryParams = queryParams.slice(0, -1);
    
    return this.api.get(`/search${queryParams}`);
  }
}
