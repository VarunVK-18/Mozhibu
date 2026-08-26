import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    _id: string;
    username: string;
    avatar: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private api = inject(ApiService);

  getNotifications(): Observable<NotificationItem[]> {
    return this.api.get<NotificationItem[]>('/notifications');
  }

  markAsRead(id: string): Observable<any> {
    return this.api.put(`/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.api.put('/notifications/read-all', {});
  }

  clearAll(): Observable<any> {
    return this.api.delete('/notifications/clear-all');
  }
}
