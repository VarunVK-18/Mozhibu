import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user();
  if (user) {
    if (user.status === 'suspended') {
      router.navigate(['/account-suspended']);
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};
