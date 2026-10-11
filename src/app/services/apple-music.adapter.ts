import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { SearchTrack } from '../models/search-track.model';
import { appleConfigured, formatDuration } from './platform-config';

interface AppleSong {
  id?: string;
  attributes?: {
    name?: string;
    artistName?: string;
    durationInMillis?: number;
    artwork?: { url?: string };
  };
}

interface MusicKitInstance {
  isAuthorized: boolean;
  storefrontId?: string;
  authorize(): Promise<string>;
  api: {
    music: (path: string, query?: Record<string, string | number>) => Promise<{ data?: { results?: { songs?: { data?: AppleSong[] } } } }>;
  };
  setQueue(options: { song: string }): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seekToTime(seconds: number): Promise<void>;
  volume: number;
  currentPlaybackTime: number;
  currentPlaybackDuration: number;
}

interface MusicKitStatic {
  configure(config: { developerToken: string; app: { name: string; build: string } }): Promise<void>;
  getInstance(): MusicKitInstance;
}

declare global {
  interface Window {
    MusicKit?: MusicKitStatic;
  }
}

@Injectable({ providedIn: 'root' })
export class AppleMusicAdapter {
  readonly enabled = appleConfigured();
  readonly connected = signal(false);
  private instancePromise: Promise<MusicKitInstance> | null = null;

  async search(query: string): Promise<SearchTrack[]> {
    if (!this.enabled) {
      return [];
    }
    const music = await this.instance();
    const storefront = music.storefrontId || 'us';
    const response = await music.api.music(`/v1/catalog/${storefront}/search`, {
      term: query,
      types: 'songs',
      limit: 8,
    });
    const songs = response.data?.results?.songs?.data ?? [];
    return songs
      .filter((song) => song.id)
      .map((song) => ({
        id: `apple-${song.id}`,
        source: 'apple' as const,
        title: song.attributes?.name ?? 'Apple Music song',
        artist: song.attributes?.artistName ?? 'Apple Music',
        coverUrl: artwork(song.attributes?.artwork?.url),
        duration: formatDuration((song.attributes?.durationInMillis ?? 0) / 1000),
        externalId: song.id!,
      }));
  }

  async connect(): Promise<void> {
    const music = await this.instance();
    await music.authorize();
    this.connected.set(music.isAuthorized);
  }

  async instance(): Promise<MusicKitInstance> {
    if (!this.instancePromise) {
      this.instancePromise = this.load();
    }
    return this.instancePromise;
  }

  private async load(): Promise<MusicKitInstance> {
    await loadScript('https://js-cdn.music.apple.com/musickit/v3/musickit.js');
    if (!window.MusicKit) {
      throw new Error('Apple Music could not be loaded');
    }
    await window.MusicKit.configure({
      developerToken: environment.appleMusicDeveloperToken,
      app: { name: 'SoundFlow', build: '1.0.0' },
    });
    const music = window.MusicKit.getInstance();
    this.connected.set(music.isAuthorized);
    return music;
  }
}

function artwork(url: string | undefined): string | null {
  if (!url) {
    return null;
  }
  return url.replace('{w}', '200').replace('{h}', '200');
}

function loadScript(src: string): Promise<void> {
  if (document.querySelector(`script[src="${src}"]`)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.body.appendChild(script);
  });
}
