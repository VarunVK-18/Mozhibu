import { Component, HostListener, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Lang, LangOption } from '../../core/services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { AdminBook } from '../../core/services/admin.service';
import { NotificationService, NotificationItem } from '../../core/services/notification.service';
import { SocketService } from '../../core/services/socket.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { ApiService } from '../../core/services/api.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  langMenuOpen = signal(false);
  profileMenuOpen = signal(false);
  mobileMenuOpen = signal(false);
  searchOpen = signal(false);
  notificationsOpen = signal(false);
  engagementOpen = signal(false);
  showAuthorModal = signal(false);
  isHeaderHidden = signal(false);
  private lastScrollY = 0;
  
  notifications = signal<NotificationItem[]>([]);
  
  activityNotifications = computed(() => this.notifications().filter(n => ['like', 'comment', 'follower', 'following'].includes(n.type)));
  generalNotifications = computed(() => this.notifications().filter(n => ['new_chapter', 'competition', 'announcement', 'system'].includes(n.type)));
  
  unreadActivityCount = computed(() => this.activityNotifications().filter(n => !n.isRead).length);
  unreadGeneralCount = computed(() => this.generalNotifications().filter(n => !n.isRead).length);
  isPremium = signal(false);

  searchResults: AdminBook[] = [];
  searchQuery = '';

  private destroy$ = new Subject<void>();
  public langService = inject(LanguageService);
  public authService = inject(AuthService);
  public router = inject(Router);
  private bookService = inject(BookService);
  private notificationService = inject(NotificationService);
  private socketService = inject(SocketService);
  private subService = inject(SubscriptionService);
  private api = inject(ApiService);

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    if (query.trim().length > 0) {
      this.bookService.getPublishedBooks(query).subscribe(books => {
        this.searchResults = books;
      });
    } else {
      this.searchResults = [];
    }
  }
  getAvatarUrl(path: string | undefined): string {
    if (!path) return '';
    return this.api.getImageUrl(path);
  }

  onAvatarError(event: any, name?: string, isCover: boolean = false) {
    if (isCover) {
      event.target.src = this.api.getFallbackCover();
    } else {
      event.target.src = this.api.getFallbackAvatar(name);
    }
  }

  onWriteClick(event: Event) {
    event.preventDefault();
    const user = this.authService.user();
    
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    if (user.role === 'writer' || user.role === 'superadmin') {
      // Allow them into the Author Studio
      this.router.navigate(['/write']);
    } else {
      // Show modal instead of alert
      this.showAuthorModal.set(true);
    }
  }

  goToSettings() {
    this.showAuthorModal.set(false);
    this.router.navigate(['/settings']);
  }

  isNewRelease(createdAt: string): boolean {
    if (!createdAt) return false;
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 10;
  }

  get currentLang(): LangOption {
    return this.langService.getCurrentLangOption();
  }

  toggleLangMenu(): void {
    this.langMenuOpen.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleSearch(): void {
    this.searchOpen.update(v => !v);
    if (this.searchOpen()) {
      this.notificationsOpen.set(false);
      this.engagementOpen.set(false);
      this.profileMenuOpen.set(false);
      this.langMenuOpen.set(false);
    }
  }

  toggleNotifications(): void {
    this.notificationsOpen.update(v => !v);
    if (this.notificationsOpen()) {
      this.searchOpen.set(false);
      this.engagementOpen.set(false);
      this.profileMenuOpen.set(false);
      this.langMenuOpen.set(false);
    }
  }

  toggleEngagement(): void {
    this.engagementOpen.update(v => !v);
    if (this.engagementOpen()) {
      this.searchOpen.set(false);
      this.notificationsOpen.set(false);
      this.profileMenuOpen.set(false);
      this.langMenuOpen.set(false);
    }
  }

  selectLang(code: Lang) {
    if (this.langService.currentLang() !== code) {
      this.langService.setLanguage(code);
      this.langMenuOpen.set(false);
      
      // Smoothly reload the current route to fetch translated data
      const currentUrl = this.router.url;
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    } else {
      this.langMenuOpen.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.lang-dropdown-wrapper')) {
      this.langMenuOpen.set(false);
    }
    if (!target.closest('.search-wrapper') && !target.closest('.icon-btn[aria-label="Search"]')) {
      this.searchOpen.set(false);
    }
    if (!target.closest('.user-profile-wrapper')) {
      this.profileMenuOpen.set(false);
    }
    if (!target.closest('.notifications-wrapper') && !target.closest('.icon-btn[aria-label="Notifications"]')) {
      this.notificationsOpen.set(false);
    }
    if (!target.closest('.engagement-wrapper') && !target.closest('.icon-btn[aria-label="Engagement"]')) {
      this.engagementOpen.set(false);
    }
    if (!target.closest('.mobile-menu-container') && !target.closest('.hamburger-btn')) {
      this.mobileMenuOpen.set(false);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    
    // If scrolling down and past the header height, hide it
    if (currentScrollY > this.lastScrollY && currentScrollY > 80) {
      if (!this.isHeaderHidden()) {
        this.isHeaderHidden.set(true);
        // Close dropdowns when hiding header
        this.searchOpen.set(false);
        this.langMenuOpen.set(false);
        this.profileMenuOpen.set(false);
        this.notificationsOpen.set(false);
        this.engagementOpen.set(false);
      }
    } 
    // If scrolling up, show it
    else if (currentScrollY < this.lastScrollY) {
      if (this.isHeaderHidden()) {
        this.isHeaderHidden.set(false);
      }
    }
    
    // For Mobile or negative scrolling
    this.lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
  }

  constructor() {}

  ngOnInit() {
    if (this.authService.user()) {
      this.socketService.connect();
      this.fetchNotifications();
      
      this.socketService.notificationReceived
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.fetchNotifications();
        });
        
      this.subService.getMySubscription().subscribe({
        next: (sub) => {
          this.isPremium.set(sub?.active || false);
        },
        error: () => {}
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (notifs) => {
        this.notifications.set(notifs);
      },
      error: (err) => console.error('Failed to fetch notifications', err)
    });
  }

  handleNotificationClick(notification: NotificationItem) {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification._id).subscribe(() => {
        this.notifications.update(notifs => 
          notifs.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
      });
    }
    
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
      this.notificationsOpen.set(false);
    }
  }

  markAllAsRead(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.update(notifs => notifs.map(n => ({...n, isRead: true})));
    });
  }

  get camelCaseName(): string {
    const user = this.authService.user();
    if (!user || !user.username) return '';
    // Format username to camelCase (e.g. split by space and camelcase)
    const words = user.username.trim().split(/\s+/);
    if (words.length === 1) return words[0].toLowerCase();
    
    const first = words[0].toLowerCase();
    const rest = words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    return first + rest;
  }

  get firstInitial(): string {
    const user = this.authService.user();
    return (user && user.username) ? user.username.charAt(0).toUpperCase() : '';
  }

  onProfileClick(): void {
    if (!this.authService.user()) {
      this.router.navigate(['/login']);
    } else {
      this.profileMenuOpen.update(v => !v);
    }
  }

  onLogout(): void {
    if (confirm('Are you sure you want to log out?')) {
      this.authService.logout();
      this.isPremium.set(false);
      this.socketService.disconnect();
      this.profileMenuOpen.set(false);
      window.location.href = '/';
    }
  }

  requireAuth(event: Event, action?: () => void): void {
    event.preventDefault();
    if (!this.authService.user()) {
      this.router.navigate(['/login']);
    } else if (action) {
      action();
    }
  }
}
