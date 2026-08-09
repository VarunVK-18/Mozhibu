import { Injectable, signal } from '@angular/core';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = signal<User | null>(null);

  login() {
    this.user.set({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    });
  }

  logout() {
    this.user.set(null);
  }
}
