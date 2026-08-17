import { Injectable, signal, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { BookService } from './book.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

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
  content?: string;
}

export interface StoryComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  timestamp: string;
  text: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  replies: StoryComment[];
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
  accessType?: 'free' | 'premium';
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
  private authService = inject(AuthService);

  loadStory(id: string, resume: boolean = false) {
    const baseUrl = environment.apiUrl.replace('/api', '');
    this.bookService.getBookById(id).subscribe({
      next: (book: any) => {
        const currentUser = this.authService.user();
        const isLiked = currentUser && book.likes ? book.likes.includes(currentUser.id) : false;
        // To check bookmark accurately, we'd need user library. We'll default to false and let the toggle handle it
        
        const detail: StoryDetail = {
          id: book._id,
          title: book.title,
          subtitle: book.subtitle || '',
          coverImage: book.cover ? (book.cover.startsWith('http') ? book.cover : `${baseUrl}${book.cover}`) : 'assets/default-cover.png',
          author: {
            id: book.author._id,
            name: book.author.username,
            avatar: book.author.avatar ? (book.author.avatar.startsWith('http') ? book.author.avatar : `${baseUrl}${book.author.avatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(book.author.username)}&background=random&color=fff&size=100&length=1`,
            isFollowed: false
          },
          genres: [book.genre],
          readingTime: '30 min read',
          views: book.views || 0,
          likes: book.likesCount || 0,
          bookmarks: book.bookmarks || 0,
          rating: book.rating || 0,
          reviewCount: book.reviews?.length || 0,
          chapterCount: book.chapters?.length || 0,
          status: 'Ongoing',
          language: 'English',
          publishedDate: book.createdAt,
          updatedDate: book.updatedAt,
          synopsis: book.description || 'No synopsis available.',
          isLiked,
          isBookmarked: false,
          userProgress: {
            hasStarted: resume
          },
          accessType: book.accessType || 'free'
        };

        this.activeStory.set(detail);
      }
    });

    this.bookService.getChapters(id).subscribe(chapters => {
      const story = this.activeStory();
      const coverImage = story?.coverImage || 'assets/default-cover.png';
      this.storyEpisodes.set(chapters.map((c: any) => ({
        id: c._id,
        season: 1,
        episode: c.order,
        title: c.title,
        thumbnail: c.cover ? (c.cover.startsWith('http') ? c.cover : `${baseUrl}${c.cover}`) : coverImage,
        readingTime: '15 min',
        synopsis: (c.content || '').substring(0, 100) + '...',
        isRead: false,
        isUnlocked: !c.isLocked,
        content: c.content
      })));
    });

    this.bookService.getReviews(id).subscribe(reviews => {
      const currentUser = this.authService.user();
      
      const mapReview = (r: any): StoryComment => {
        const authorName = r.user?.username || 'Unknown';
        return {
          id: r._id,
          authorName,
          authorAvatar: r.user?.avatar ? (r.user.avatar.startsWith('http') ? r.user.avatar : `${environment.apiUrl.replace('/api', '')}${r.user.avatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&color=fff&size=100&length=1`,
          timestamp: new Date(r.createdAt).toLocaleDateString(),
        text: r.comment,
        likes: r.likes?.length || 0,
        dislikes: r.dislikes?.length || 0,
        isLiked: currentUser ? (r.likes || []).includes(currentUser.id) : false,
          isDisliked: currentUser ? (r.dislikes || []).includes(currentUser.id) : false,
          replies: r.replies ? r.replies.map((reply: any) => mapReview(reply)) : []
        };
      };

      this.storyComments.set(reviews.map(mapReview));
    });
  }

  toggleLike() {
    const story = this.activeStory();
    if (!story) return;
    
    // Optimistic UI update
    this.activeStory.update(s => {
      if (!s) return s;
      const isLiked = !s.isLiked;
      return { ...s, isLiked, likes: s.likes + (isLiked ? 1 : -1) };
    });

    this.bookService.toggleLike(story.id).subscribe({
      error: () => {
        // Revert on failure
        this.activeStory.update(s => {
          if (!s) return s;
          const isLiked = !s.isLiked;
          return { ...s, isLiked, likes: s.likes + (isLiked ? 1 : -1) };
        });
      }
    });
  }

  toggleBookmark() {
    const story = this.activeStory();
    if (!story) return;

    // Optimistic UI update
    this.activeStory.update(s => {
      if (!s) return s;
      const isBookmarked = !s.isBookmarked;
      return { ...s, isBookmarked, bookmarks: s.bookmarks + (isBookmarked ? 1 : -1) };
    });

    this.authService.toggleBookmark(story.id).subscribe({
      error: () => {
        // Revert on failure
        this.activeStory.update(s => {
          if (!s) return s;
          const isBookmarked = !s.isBookmarked;
          return { ...s, isBookmarked, bookmarks: s.bookmarks + (isBookmarked ? 1 : -1) };
        });
      }
    });
  }

  reportBook(reason: string) {
    const story = this.activeStory();
    if (!story) return;
    
    this.bookService.reportBook(story.id, reason).subscribe();
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

  addComment(text: string, user: any, rating: number = 5) {
    const story = this.activeStory();
    if (!story) return;

    const authorName = user?.username || 'You';
    const newComment: StoryComment = {
      id: Date.now().toString(),
      authorName,
      authorAvatar: user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${environment.apiUrl.replace('/api', '')}${user.avatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&color=fff&size=100&length=1`,
      timestamp: 'Just now',
      text,
      likes: 0,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
      replies: []
    };
    
    // Optimistic UI update
    this.storyComments.update(comments => [newComment, ...comments]);

    // Persist to backend
    this.bookService.addReview(story.id, text, rating).subscribe({
      next: (res) => {},
      error: (err) => {
        console.error('Failed to add comment', err);
        // Revert optimistic update on failure
        this.storyComments.update(comments => comments.filter(c => c.id !== newComment.id));
        alert(err.error?.msg || 'Failed to post comment. You may have already reviewed this story.');
      }
    });
  }

  toggleCommentLike(commentId: string) {
    const story = this.activeStory();
    if (!story) return;

    this.storyComments.update(comments => 
      comments.map(c => {
        if (c.id === commentId) {
          const wasLiked = c.isLiked;
          const wasDisliked = c.isDisliked;
          return {
            ...c,
            isLiked: !wasLiked,
            isDisliked: false,
            likes: c.likes + (wasLiked ? -1 : 1),
            dislikes: c.dislikes + (wasDisliked ? -1 : 0)
          };
        }
        return c;
      })
    );

    this.bookService.toggleCommentLike(story.id, commentId).subscribe();
  }

  toggleCommentDislike(commentId: string) {
    const story = this.activeStory();
    if (!story) return;

    this.storyComments.update(comments => 
      comments.map(c => {
        if (c.id === commentId) {
          const wasLiked = c.isLiked;
          const wasDisliked = c.isDisliked;
          return {
            ...c,
            isDisliked: !wasDisliked,
            isLiked: false,
            dislikes: c.dislikes + (wasDisliked ? -1 : 1),
            likes: c.likes + (wasLiked ? -1 : 0)
          };
        }
        return c;
      })
    );

    this.bookService.toggleCommentDislike(story.id, commentId).subscribe();
  }

  replyToComment(commentId: string, text: string, user: any) {
    const story = this.activeStory();
    if (!story) return;

    const authorName = user?.username || 'You';
    const newReply: StoryComment = {
      id: Date.now().toString(),
      authorName,
      authorAvatar: user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&color=fff&size=100&length=1`,
      timestamp: 'Just now',
      text,
      likes: 0,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
      replies: []
    };

    this.storyComments.update(comments => 
      comments.map(c => {
        if (c.id === commentId) {
          return { ...c, replies: [...c.replies, newReply] };
        }
        return c;
      })
    );

    this.bookService.replyToComment(story.id, commentId, text).subscribe();
  }
}
