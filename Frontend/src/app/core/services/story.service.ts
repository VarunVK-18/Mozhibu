import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

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

  loadMockStory(id: string) {
    // Generate mock story detail
    const mockDetail: StoryDetail = {
      id,
      title: 'The Silent Echo',
      subtitle: 'A journey through the forgotten realms.',
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      author: {
        id: 'a1',
        name: 'Elara Vance',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        isFollowed: false
      },
      genres: ['Fantasy', 'Mystery', 'Adventure'],
      readingTime: '42 min read',
      views: 112500,
      likes: 15400,
      bookmarks: 8200,
      rating: 4.8,
      reviewCount: 3420,
      chapterCount: 24,
      status: 'Ongoing',
      language: 'English',
      publishedDate: 'Oct 12, 2024',
      updatedDate: 'Just now',
      synopsis: `In a world where memories can be physically extracted and sold, a young archivist discovers a memory that doesn't belong to anyone on record. As she delves deeper into the origins of this mysterious fragment, she uncovers a conspiracy that threatens the very fabric of society. To find the truth, she must team up with an underground collective of "memory runners" and risk losing her own past in the process.\n\nThe Silent Echo explores the themes of identity, truth, and what makes us who we are.`,
      isLiked: false,
      isBookmarked: false,
      userProgress: {
        hasStarted: false
      }
    };
    
    // Generate Netflix-style episodes
    const mockEpisodes: StoryEpisode[] = [
      { id: 'e1', season: 1, episode: 1, title: 'The Glass Archive', thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&q=80', readingTime: '15 min', synopsis: 'Elara discovers a memory that breaks all the rules.', isRead: true, isUnlocked: true },
      { id: 'e2', season: 1, episode: 2, title: 'Shadows in the Market', thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&q=80', readingTime: '18 min', synopsis: 'A meeting with the memory runners goes terribly wrong.', isRead: false, isUnlocked: true },
      { id: 'e3', season: 1, episode: 3, title: 'Echoes of the Past', thumbnail: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&q=80', readingTime: '22 min', synopsis: 'To understand the fragment, Elara must experience it herself.', isRead: false, isUnlocked: false },
      { id: 'e4', season: 1, episode: 4, title: 'The Architect', thumbnail: 'https://images.unsplash.com/photo-1505664173622-1816f58f7e1a?w=300&q=80', readingTime: '20 min', synopsis: 'A mysterious figure from the past emerges with answers.', isRead: false, isUnlocked: false },
    ];

    // Generate mock comments
    const mockComments: StoryComment[] = [
      { id: 'c1', authorName: 'Jamie D.', authorAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80', timestamp: '2 hours ago', text: 'This story hooked me from the very first chapter! The world-building is incredible.', likes: 45 },
      { id: 'c2', authorName: 'Alex Rivers', authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80', timestamp: '5 hours ago', text: 'I cannot wait for the next update. The cliffhanger on chapter 2 is brutal.', likes: 12 },
      { id: 'c3', authorName: 'Sam Chen', authorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&q=80', timestamp: '1 day ago', text: 'Does anyone else think the Architect is actually her father?', likes: 89 },
    ];

    this.activeStory.set(mockDetail);
    this.storyEpisodes.set(mockEpisodes);
    this.storyComments.set(mockComments);
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
