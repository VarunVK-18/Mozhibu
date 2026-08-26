import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../../core/services/auth.service';

interface Author {
  id: string;
  initials: string;
  name: string;
  followers: string;
  color: string;
  following: boolean;
}

const COLORS = ['#3F6259', '#AE6274', '#8A7B5C', '#5E6B7A', '#B08655'];

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.css'],
})
export class AuthorsComponent implements OnInit {
  authService = inject(AuthService);
  authors = signal<Author[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.authService.getAuthors().subscribe({
      next: (data) => {
        const mapped = data.slice(0, 5).map((a: any, i: number) => {
          const name = a.username || 'Unknown';
          const initials = name.substring(0, 2).toUpperCase();
          const followers = a.followersCount
            ? `${(a.followersCount / 1000).toFixed(1)}K`
            : '0';
          return {
            id: a._id,
            initials,
            name,
            followers,
            color: COLORS[i % COLORS.length],
            following: false,
          };
        });
        this.authors.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load authors', err);
        this.isLoading.set(false);
      },
    });
  }

  toggleFollow(index: number): void {
    const author = this.authors()[index];
    if (!author) return;

    // Toggle locally for instant feedback
    this.authors.update((list) =>
      list.map((a, i) => (i === index ? { ...a, following: !a.following } : a)),
    );

    // Call API if logged in
    if (this.authService.user()) {
      this.authService.followAuthor(author.id).subscribe({
        error: () => {
          // Revert if API fails
          this.authors.update((list) =>
            list.map((a, i) =>
              i === index ? { ...a, following: !a.following } : a,
            ),
          );
        },
      });
    }
  }
}
