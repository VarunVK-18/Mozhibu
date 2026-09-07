import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

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

  notifications = signal<NotificationItem[]>([]);
  unreadCount = computed(
    () => this.notifications().filter((n) => !n.isRead).length,
  );

  constructor() {
    // Restore cached notifications immediately on boot/login
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem('cached_notifications');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            this.notifications.set(parsed);
          }
        } catch (e) {
          console.error('[NotificationService] Failed to parse cached notifications', e);
        }
      }
    }
  }

  loadNotifications(): void {
    this.getNotifications().subscribe({
      next: (notifs) => {
        this.notifications.set(notifs || []);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('cached_notifications', JSON.stringify(notifs || []));
        }
      },
      error: (err) => {
        console.warn('[NotificationService] Failed to fetch latest notifications:', err);
      },
    });
  }

  getNotifications(): Observable<NotificationItem[]> {
    return this.api.get<NotificationItem[]>('/notifications').pipe(
      tap((notifs) => {
        if (Array.isArray(notifs)) {
          this.notifications.set(notifs);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('cached_notifications', JSON.stringify(notifs));
          }
        }
      })
    );
  }

  markAsRead(id: string): Observable<any> {
    // Optimistic update
    this.notifications.update((list) =>
      list.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    this.saveCache();
    return this.api.put(`/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    // Optimistic update
    this.notifications.update((list) =>
      list.map((n) => ({ ...n, isRead: true })),
    );
    this.saveCache();
    return this.api.put('/notifications/read-all', {});
  }

  clearAll(): Observable<any> {
    this.notifications.set([]);
    this.saveCache();
    return this.api.delete('/notifications/clear-all');
  }

  clearCache(): void {
    this.notifications.set([]);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('cached_notifications');
    }
  }

  private saveCache(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cached_notifications', JSON.stringify(this.notifications()));
    }
  }
}
