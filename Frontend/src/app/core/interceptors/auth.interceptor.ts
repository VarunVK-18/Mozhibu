import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

  let headers = req.headers;
  if (token && !headers.has('Authorization')) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const authReq = req.clone({
    headers,
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/google') &&
        error.status === 403 &&
        (error.error?.code === 'ACCOUNT_SUSPENDED' ||
          error.error?.status === 'suspended' ||
          (typeof error.error?.msg === 'string' &&
            error.error.msg.toLowerCase().includes('account has been suspended')))
      ) {
        authService.markSuspended(error.error?.suspendedUntil);
      }
      return throwError(() => error);
    })
  );
};
