import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _loading = signal(false);
  private _activeRequests = 0;
  private _hideTimeout: any;

  get loading() {
    return this._loading.asReadonly();
  }

  show() {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }
    if (this._activeRequests === 0) {
      this._loading.set(true);
    }
    this._activeRequests++;
  }

  hide() {
    this._activeRequests--;
    if (this._activeRequests <= 0) {
      this._activeRequests = 0;
      this._hideTimeout = setTimeout(() => {
        this._loading.set(false);
      }, 500); // Wait 500ms before hiding to prevent flicker between requests/renders
    }
  }
}
