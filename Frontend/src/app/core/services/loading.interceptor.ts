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

  loadingService.show();
  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    }),
  );
};
