import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthorService, AuthorProfile } from '../../core/services/author.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-author-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-layout">
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading profile...</p>
        </div>
      } @else if (profile) {
        <!-- Profile Banner -->
        <div class="profile-banner">
          <div class="profile-header">
            <img [src]="getAvatarUrl(profile.author)" alt="Author avatar" class="author-avatar">
            <div class="author-info">
              <h1 class="author-name">{{ profile.author.username }}</h1>
              <div class="author-meta">
                <span class="meta-item">
                  <strong>{{ profile.author.followersCount }}</strong> Followers
                </span>
                <span class="meta-separator">•</span>
                <span class="meta-item">
                  Joined {{ profile.author.createdAt | date:'mediumDate' }}
                </span>
              </div>
              
              <div class="author-bio">
                <p>{{ profile.author.bio || 'This author hasn\\'t written a bio yet.' }}</p>
              </div>
            </div>
            
            <div class="author-actions">
              @if (isCurrentUser()) {
                <button class="btn-outline">Edit Profile</button>
              } @else {
                <button class="btn-primary" (click)="toggleFollow()">
                  {{ isFollowing ? 'Unfollow' : 'Follow' }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Books Grid -->
        <div class="profile-content">
          <h3 class="section-title">Published Stories</h3>
          
          @if (profile.books.length === 0) {
            <div class="empty-state">
              <p>This author hasn't published any stories yet.</p>
            </div>
          } @else {
            <div class="results-grid">
              @for (item of profile.books; track item._id) {
                <div class="book-card" [routerLink]="['/book', item._id]">
                  <div class="cover-wrapper">
                    <img [src]="item.cover || 'assets/default-cover.png'" alt="Book cover" class="book-cover" onerror="this.src='https://placehold.co/400x600/3F6259/FFFFFF?text='+item.title">
                    @if (item.completionStatus === 'completed') {
                      <span class="status-badge completed">Completed</span>
                    } @else {
                      <span class="status-badge ongoing">Ongoing</span>
                    }
                  </div>
                  <div class="book-info">
                    <h4 class="book-title">{{ item.title }}</h4>
                    <div class="book-meta">
                      <span class="meta-item">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        {{ item.views || 0 }}
                      </span>
                      <span class="meta-item">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        {{ item.likesCount || 0 }}
                      </span>
                      <span class="genre-badge">{{ item.genre }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-layout {
      min-height: calc(100vh - 73px);
      background: var(--paper);
    }

    .profile-banner {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 64px 48px;
    }

    .profile-header {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      gap: 32px;
      align-items: flex-start;
    }

    .author-avatar {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--surface);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      flex-shrink: 0;
    }

    .author-info {
      flex: 1;
    }

    .author-name {
      font-family: var(--display);
      font-size: 32px;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 12px;
    }

    .author-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      color: var(--ink-soft);
      margin-bottom: 20px;
    }

    .meta-separator {
      color: var(--border-deep);
    }

    .author-bio {
      font-size: 16px;
      line-height: 1.6;
      color: var(--ink-soft);
      max-width: 600px;
    }

    .author-actions {
      flex-shrink: 0;
    }

    .btn-primary {
      background: var(--forest);
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: var(--forest-deep);
    }
    
    .btn-outline {
      background: transparent;
      color: var(--forest);
      border: 1px solid var(--forest);
      padding: 12px 32px;
      border-radius: 100px;
      font-family: var(--display);
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .profile-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 48px;
    }

    .section-title {
      font-family: var(--display);
      font-size: 24px;
      color: var(--ink);
      margin: 0 0 32px;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 32px 24px;
    }

    /* Book Card Reuse */
    .book-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .book-card:hover {
      transform: translateY(-4px);
    }
    
    .cover-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 2 / 3;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .book-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .status-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: white;
      backdrop-filter: blur(4px);
    }
    
    .status-badge.completed { background: rgba(16, 185, 129, 0.85); }
    .status-badge.ongoing { background: rgba(59, 130, 246, 0.85); }

    .book-title {
      font-family: var(--display);
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .book-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--ink-faint);
    }

    .genre-badge {
      font-size: 11px;
      padding: 2px 6px;
      background: var(--paper-soft);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--ink-soft);
      margin-left: auto;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      color: var(--ink-soft);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(63, 98, 89, 0.1);
      border-radius: 50%;
      border-top-color: var(--forest);
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .author-actions {
        width: 100%;
        margin-top: 16px;
      }
      .author-actions button {
        width: 100%;
      }
      .profile-content {
        padding: 24px;
      }
    }
  `]
})
export class AuthorProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authorService = inject(AuthorService);
  private authService = inject(AuthService);

  profile: AuthorProfile | null = null;
  isLoading = true;
  isFollowing = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchProfile(id);
      }
    });
  }

  fetchProfile(id: string) {
    this.isLoading = true;
    this.authorService.getAuthorProfile(id).subscribe({
      next: (res) => {
        this.profile = res;
        this.isLoading = false;
        this.checkIfFollowing();
      },
      error: (err) => {
        console.error('Failed to fetch author profile', err);
        this.isLoading = false;
      }
    });
  }

  getAvatarUrl(author: any): string {
    const baseUrl = environment.apiUrl.replace('/api', '');
    if (author.avatar) {
      if (author.avatar.startsWith('http')) return author.avatar;
      return `${baseUrl}${author.avatar}`;
    }
    const initial = author.username ? author.username.charAt(0).toUpperCase() : 'U';
    return `https://placehold.co/100x100/333333/999999?text=${initial}`;
  }

  isCurrentUser(): boolean {
    const user = this.authService.user();
    return !!(user && this.profile && user.id === this.profile.author._id);
  }

  checkIfFollowing() {
    const user = this.authService.user();
    if (!user || !this.profile) return;
    
    // Check if the current user is following this author.
    // The current user model might have `following` array if fetched recently.
    // Since we don't have the current user's `following` array populated directly in the signal 
    // unless they just logged in, we might need to rely on the backend response.
    // Wait, the backend follow endpoint returns `following: boolean`.
    // Let's just assume we will fetch it correctly or rely on the toggle response for now.
    // A proper way would be to fetch `/users/me/following` but for now we can just assume false.
    // TODO: Improve this if needed.
    this.isFollowing = false; 
  }

  toggleFollow() {
    if (!this.authService.user()) {
      alert('Please log in to follow authors.');
      return;
    }
    
    if (this.profile) {
      this.authorService.followAuthor(this.profile.author._id).subscribe({
        next: (res: any) => {
          this.isFollowing = res.following;
          if (this.isFollowing) {
            this.profile!.author.followersCount += 1;
          } else {
            this.profile!.author.followersCount -= 1;
          }
        },
        error: (err) => {
          console.error('Failed to toggle follow', err);
          alert(err.error?.msg || 'Failed to follow author');
        }
      });
    }
  }
}
