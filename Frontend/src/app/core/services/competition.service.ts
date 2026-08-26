import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface CompetitionConfig {
  isActive: boolean;
  tag: string;
  title: string;
  description: string;
  endDate: string;
  buttonText: string;
  buttonLink: string;
  winnerBookId?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private api = inject(ApiService);

  getActiveCompetition(): Observable<CompetitionConfig> {
    return this.api.get('/competitions/active');
  }
}
