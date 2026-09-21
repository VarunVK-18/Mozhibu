import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _loading = signal(false);
  private _initialLoadComplete = signal(false);
  private _activeRequests = 0;
  private _hideTimeout: any;

  // Use a computed signal so it remains reactive and callable in the template
  public loading = computed(() => {
    if (this._initialLoadComplete()) {
      return false;
    }
    return this._loading();
  });

  setInitialLoadComplete(status: boolean) {
    this._initialLoadComplete.set(status);
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
