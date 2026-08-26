import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDestructive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  private confirmSubject: Subject<boolean> | null = null;

  public state = signal<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDestructive: false,
  });

  /**
   * Opens a confirmation modal.
   * @param title Title of the modal
   * @param message Message to display
   * @param isDestructive If true, the confirm button will be styled as destructive (red)
   * @param confirmText Text for the confirm button
   * @param cancelText Text for the cancel button
   * @returns An Observable that emits true if confirmed, false if cancelled
   */
  confirm(
    title: string,
    message: string,
    isDestructive = false,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  ): Observable<boolean> {
    // If a modal is already open, cancel the previous one
    if (this.confirmSubject) {
      this.confirmSubject.next(false);
      this.confirmSubject.complete();
    }

    this.confirmSubject = new Subject<boolean>();

    this.state.set({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      isDestructive,
    });

    return this.confirmSubject.asObservable();
  }

  resolve(result: boolean) {
    if (this.confirmSubject) {
      this.confirmSubject.next(result);
      this.confirmSubject.complete();
      this.confirmSubject = null;
    }

    this.state.update((s) => ({ ...s, isOpen: false }));
  }
}
