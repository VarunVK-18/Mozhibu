import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Skip showing loader for silent background requests if any
  if (req.headers.has('X-Skip-Loader')) {
    const headers = req.headers.delete('X-Skip-Loader');
    return next(req.clone({ headers }));
  }

  // We removed the global loadingService.show() here because it causes the 
  // full-screen splash loader to appear on background requests (like checking pen name availability).
  // Now, individual components are responsible for showing their own skeleton loaders or spinners.
  return next(req);
};
