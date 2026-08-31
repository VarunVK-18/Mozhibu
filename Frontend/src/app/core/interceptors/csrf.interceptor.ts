import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  // We only need to add this header for state-changing requests, 
  // but it's safe and standard to add it to all API requests.
  const secureReq = req.clone({
    headers: req.headers.set('X-Requested-With', 'XMLHttpRequest')
  });
  return next(secureReq);
};
