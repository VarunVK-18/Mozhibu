import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket?: Socket;
  private authService = inject(AuthService);

  public notificationReceived = new Subject<void>();

  connect() {
    if (this.socket) {
      this.socket.disconnect();
    }

    // Connect to backend (stripping /api from the end of the URL)
    const backendUrl = environment.apiUrl.replace(/\/api$/, '');
    this.socket = io(backendUrl);

    this.socket.on('connect', () => {
      const user = this.authService.user();
      if (user && user.id) {
        this.socket?.emit('authenticate', user.id);
      } else if (user && (user as any)._id) {
        this.socket?.emit('authenticate', (user as any)._id);
      }
    });

    this.socket.on('incoming_notification', () => {
      this.notificationReceived.next();
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }
}
