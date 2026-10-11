import { TrackSource } from '../models/search-track.model';
import { environment } from '../../environments/environment';

export function youtubeConfigured(): boolean {
  return environment.youtubeApiKey.trim().length > 0;
}

export function appleConfigured(): boolean {
  return environment.appleMusicDeveloperToken.trim().length > 0;
}

export function spotifyConfigured(): boolean {
  return environment.spotifyClientId.trim().length > 0;
}

export function configuredSources(): TrackSource[] {
  const sources: TrackSource[] = [];
  if (youtubeConfigured()) {
    sources.push('youtube');
  }
  if (appleConfigured()) {
    sources.push('apple');
  }
  if (spotifyConfigured()) {
    sources.push('spotify');
  }
  return sources;
}

export function spotifyRedirectUri(): string {
  return `${window.location.origin}/search`;
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remain = safe % 60;
  return `${minutes}:${remain.toString().padStart(2, '0')}`;
}

export function parseIsoDuration(value: string): string {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(value);
  if (!match) {
    return '0:00';
  }
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0) + hours * 60;
  const seconds = Number(match[3] ?? 0);
  return formatDuration(minutes * 60 + seconds);
}
