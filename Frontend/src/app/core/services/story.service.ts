import { Injectable, signal, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { BookService } from './book.service';

export interface StoryEpisode {
  id: string;
  season: number;
  episode: number;
  title: string;
  thumbnail: string;
  readingTime: string;
  synopsis: string;
  isRead: boolean;
  isUnlocked: boolean;
}

export interface StoryComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  timestamp: string;
  text: string;
  likes: number;
}

export interface StoryDetail {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isFollowed: boolean;
  };
  genres: string[];
  readingTime: string;
  views: number;
  likes: number;
  bookmarks: number;
  rating: number;
  reviewCount: number;
  chapterCount: number;
  status: 'Ongoing' | 'Completed';
  language: string;
  publishedDate: string;
  updatedDate: string;
  synopsis: string;
  isLiked: boolean;
  isBookmarked: boolean;
  userProgress: {
    hasStarted: boolean;
    lastChapterId?: string;
    lastChapterNumber?: number;
    percentComplete?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  // Shared mock state
  private activeStory = signal<StoryDetail | null>(null);
  private storyEpisodes = signal<StoryEpisode[]>([]);
  private storyComments = signal<StoryComment[]>([]);

  getActiveStory() {
    return this.activeStory.asReadonly();
  }

  getEpisodes() {
    return this.storyEpisodes.asReadonly();
  }

  getComments() {
    return this.storyComments.asReadonly();
  }

  private bookService = inject(BookService);

  loadStory(id: string, resume: boolean = false) {
    this.bookService.getBookById(id).subscribe({
      next: (book: any) => {
        const detail: StoryDetail = {
          id: book._id,
          title: book.title,
          subtitle: book.subtitle || '',
          coverImage: book.cover || 'assets/placeholder.jpg',
          author: {
            id: book.author._id,
            name: book.author.username,
            avatar: book.author.avatar || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100',
            isFollowed: false
          },
          genres: [book.genre],
          readingTime: '30 min read',
          views: book.views || 0,
          likes: book.likes || 0,
          bookmarks: book.bookmarks || 0,
          rating: book.rating || 0,
          reviewCount: book.reviews?.length || 0,
          chapterCount: book.chapters?.length || 0,
          status: 'Ongoing',
          language: 'English',
          publishedDate: book.createdAt,
          updatedDate: book.updatedAt,
          synopsis: book.synopsis || 'No synopsis available.',
          isLiked: false,
          isBookmarked: false,
          userProgress: { hasStarted: resume }
        };
        this.activeStory.set(detail);
      }
    });

    this.bookService.getChapters(id).subscribe(chapters => {
      this.storyEpisodes.set(chapters.map((c: any) => ({
        id: c._id,
        season: 1,
        episode: c.order,
        title: c.title,
        thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&q=80',
        readingTime: '15 min',
        synopsis: c.content.substring(0, 100) + '...',
        isRead: false,
        isUnlocked: true
      })));
    });

    this.bookService.getReviews(id).subscribe(reviews => {
      this.storyComments.set(reviews.map((r: any) => ({
        id: r._id,
        authorName: r.user?.username || 'Unknown',
        authorAvatar: r.user?.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80',
        timestamp: new Date(r.createdAt).toLocaleDateString(),
        text: r.comment,
        likes: r.rating
      })));
    });
  }

  // Optimistic UI updates
  toggleLike() {
    this.activeStory.update(s => {
      if (!s) return s;
      const isLiked = !s.isLiked;
      return { ...s, isLiked, likes: s.likes + (isLiked ? 1 : -1) };
    });
  }

  toggleBookmark() {
    this.activeStory.update(s => {
      if (!s) return s;
      const isBookmarked = !s.isBookmarked;
      return { ...s, isBookmarked, bookmarks: s.bookmarks + (isBookmarked ? 1 : -1) };
    });
  }

  toggleFollow() {
    this.activeStory.update(s => {
      if (!s) return s;
      return { ...s, author: { ...s.author, isFollowed: !s.author.isFollowed } };
    });
  }

  startReading() {
    this.activeStory.update(s => {
      if (!s) return s;
      return { ...s, userProgress: { hasStarted: true, lastChapterNumber: 1, percentComplete: 0 } };
    });
  }

  addComment(text: string, user: any) {
    const newComment: StoryComment = {
      id: Date.now().toString(),
      authorName: user?.username || 'You',
      authorAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&q=80',
      timestamp: 'Just now',
      text,
      likes: 0
    };
    this.storyComments.update(comments => [newComment, ...comments]);
  }
}
