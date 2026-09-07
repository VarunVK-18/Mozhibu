import {
  Directive,
  HostListener,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
} from '@angular/core';

@Directive({
  selector: '[appNoCopy]',
  standalone: true,
})
export class NoCopyDirective implements OnInit, OnDestroy {
  private toast: HTMLElement | null = null;
  private toastTimeout: any = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.setStyle(this.el.nativeElement, 'user-select', 'none');
    this.renderer.setStyle(this.el.nativeElement, '-webkit-user-select', 'none');
    this.renderer.setStyle(this.el.nativeElement, '-ms-user-select', 'none');
  }

  ngOnDestroy() {
    this.removeToast();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): boolean {
    event.preventDefault();
    event.stopPropagation();
    this.showToast();
    return false;
  }

  @HostListener('copy', ['$event'])
  onCopy(event: ClipboardEvent): boolean {
    event.preventDefault();
    event.stopPropagation();
    this.showToast();
    return false;
  }

  @HostListener('cut', ['$event'])
  onCut(event: ClipboardEvent): boolean {
    event.preventDefault();
    event.stopPropagation();
    this.showToast();
    return false;
  }

  @HostListener('selectstart', ['$event'])
  onSelectStart(event: Event): boolean {
    event.preventDefault();
    return false;
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): boolean {
    event.preventDefault();
    return false;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const isCtrl = event.ctrlKey || event.metaKey;
    if (isCtrl) {
      const blocked = ['c', 'x', 'a', 'u', 's', 'p'];
      if (blocked.includes(event.key.toLowerCase())) {
        event.preventDefault();
        event.stopPropagation();
        if (['c', 'x', 'a'].includes(event.key.toLowerCase())) {
          this.showToast();
        }
      }
    }
    if (event.key === 'PrintScreen') {
      event.preventDefault();
    }
  }

  private showToast() {
    if (this.toast) return;

    const toast = this.renderer.createElement('div');
    this.renderer.setStyle(toast, 'position', 'fixed');
    this.renderer.setStyle(toast, 'bottom', '80px');
    this.renderer.setStyle(toast, 'left', '50%');
    this.renderer.setStyle(toast, 'transform', 'translateX(-50%)');
    this.renderer.setStyle(toast, 'background', 'rgba(30,30,30,0.92)');
    this.renderer.setStyle(toast, 'color', '#fff');
    this.renderer.setStyle(toast, 'padding', '10px 20px');
    this.renderer.setStyle(toast, 'border-radius', '100px');
    this.renderer.setStyle(toast, 'font-size', '13px');
    this.renderer.setStyle(toast, 'font-family', 'var(--body, sans-serif)');
    this.renderer.setStyle(toast, 'z-index', '99999');
    this.renderer.setStyle(toast, 'pointer-events', 'none');
    this.renderer.setStyle(toast, 'box-shadow', '0 4px 16px rgba(0,0,0,0.3)');
    this.renderer.setStyle(toast, 'white-space', 'nowrap');
    toast.textContent = String.fromCodePoint(0x1F512) + ' Copying is disabled to protect author content.';

    this.renderer.appendChild(document.body, toast);
    this.toast = toast;

    this.toastTimeout = setTimeout(() => {
      this.removeToast();
    }, 2500);
  }

  private removeToast() {
    if (this.toast) {
      try {
        this.renderer.removeChild(document.body, this.toast);
      } catch {}
      this.toast = null;
    }
  }
}
