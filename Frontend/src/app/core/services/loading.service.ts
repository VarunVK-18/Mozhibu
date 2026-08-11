import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _loading = signal(false);
  private _activeRequests = 0;

  get loading() {
    return this._loading.asReadonly();
  }

  show() {
    if (this._activeRequests === 0) {
      this._loading.set(true);
    }
    this._activeRequests++;
  }

  hide() {
    this._activeRequests--;
    if (this._activeRequests <= 0) {
      this._activeRequests = 0;
      this._loading.set(false);
    }
  }
}
