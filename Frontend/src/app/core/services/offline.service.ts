import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface DownloadProgress {
  total: number;
  completed: number;
  isDownloading: boolean;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  private cacheName = 'mozhibu-downloads-v1';

  public downloadProgress = signal<DownloadProgress>({
    total: 0,
    completed: 0,
    isDownloading: false,
    status: '',
  });

  // Keep track of downloaded chapters in memory for fast lookup
  private downloadedChaptersCache = new Set<string>();

  constructor() {
    this.initCache();
  }

  private async initCache() {
    if (!('caches' in window)) return;
    try {
      const cache = await caches.open(this.cacheName);
      const keys = await cache.keys();
      // Fast lookup: extract chapter IDs from URLs
      keys.forEach((req) => {
        const url = req.url;
        // e.g., /api/books/123/chapters/456
        const match = url.match(/\/chapters\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          this.downloadedChaptersCache.add(match[1]);
        }
      });
    } catch (e) {
      console.error('Failed to init cache', e);
    }
  }

  isChapterDownloaded(chapterId: string): boolean {
    return this.downloadedChaptersCache.has(chapterId);
  }

  async downloadBatch(bookId: string, chapters: any[]) {
    if (!('caches' in window)) {
      alert('Your browser does not support offline downloads.');
      return;
    }

    this.downloadProgress.set({
      total: chapters.length,
      completed: 0,
      isDownloading: true,
      status: `Downloading 0 of ${chapters.length} chapters...`,
    });

    try {
      const cache = await caches.open(this.cacheName);
      const baseUrl = environment.apiUrl;

      // Also cache book details just in case
      await this.cacheUrl(cache, `${baseUrl}/books/${bookId}`);

      let completed = 0;
      for (const chapter of chapters) {
        // Fetch and cache each chapter
        const chapterUrl = `${baseUrl}/books/${bookId}/chapters/${chapter.id}`;
        await this.cacheUrl(cache, chapterUrl);

        this.downloadedChaptersCache.add(chapter.id);

        completed++;
        this.downloadProgress.set({
          total: chapters.length,
          completed,
          isDownloading: true,
          status: `Downloading ${completed} of ${chapters.length} chapters...`,
        });
      }

      this.downloadProgress.update((s) => ({
        ...s,
        isDownloading: false,
        status: 'Download Complete!',
      }));

      // Clear status after 3 seconds
      setTimeout(() => {
        this.downloadProgress.update((s) => ({ ...s, status: '' }));
      }, 3000);
    } catch (error) {
      console.error('Download batch failed', error);
      this.downloadProgress.update((s) => ({
        ...s,
        isDownloading: false,
        status: 'Download failed. Please try again.',
      }));
    }
  }

  private async cacheUrl(cache: Cache, url: string) {
    try {
      // Add token if exists
      const token = localStorage.getItem('token');
      const headers = new Headers();
      if (token) {
        headers.append('x-auth-token', token);
      }

      const response = await fetch(url, { headers });
      if (response.ok) {
        await cache.put(url, response.clone());
      }
    } catch (e) {
      console.warn(`Failed to cache ${url}`, e);
    }
  }

  async getCachedResponse(url: string): Promise<any> {
    if (!('caches' in window)) return null;
    try {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(url);
      if (response) {
        return await response.json();
      }
    } catch (e) {
      console.error('Cache read error', e);
    }
    return null;
  }
}
