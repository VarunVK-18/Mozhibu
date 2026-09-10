import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
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
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        if (error.error?.suspendedUntil) {
          router.navigate(['/suspended'], { queryParams: { until: error.error.suspendedUntil } });
        } else {
          router.navigate(['/suspended']);
        }
      }
      return throwError(() => error);
    })
  );
};
