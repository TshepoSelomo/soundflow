import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SearchTrack } from '../models/search-track.model';
import { parseIsoDuration, youtubeConfigured } from './platform-config';

interface YouTubeSearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: { medium?: { url?: string } };
  };
}

interface YouTubeVideoItem {
  id?: string;
  contentDetails?: { duration?: string };
}

@Injectable({ providedIn: 'root' })
export class YouTubeSearchAdapter {
  readonly enabled = youtubeConfigured();

  async search(query: string): Promise<SearchTrack[]> {
    if (!this.enabled) {
      return [];
    }
    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      videoCategoryId: '10',
      maxResults: '8',
      q: query,
      key: environment.youtubeApiKey,
    });
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!response.ok) {
      throw new Error('YouTube search failed');
    }
    const body = (await response.json()) as { items?: YouTubeSearchItem[] };
    const items = (body.items ?? []).filter((item) => item.id?.videoId);
    const durations = await this.durations(items.map((item) => item.id!.videoId!));
    return items.map((item) => {
      const videoId = item.id!.videoId!;
      return {
        id: `youtube-${videoId}`,
        source: 'youtube',
        title: item.snippet?.title ?? 'YouTube video',
        artist: item.snippet?.channelTitle ?? 'YouTube',
        coverUrl: item.snippet?.thumbnails?.medium?.url ?? null,
        duration: durations.get(videoId) ?? '0:00',
        externalId: videoId,
      };
    });
  }

  private async durations(ids: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (ids.length === 0) {
      return map;
    }
    const params = new URLSearchParams({
      part: 'contentDetails',
      id: ids.join(','),
      key: environment.youtubeApiKey,
    });
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
    if (!response.ok) {
      return map;
    }
    const body = (await response.json()) as { items?: YouTubeVideoItem[] };
    for (const item of body.items ?? []) {
      if (item.id && item.contentDetails?.duration) {
        map.set(item.id, parseIsoDuration(item.contentDetails.duration));
      }
    }
    return map;
  }
}
