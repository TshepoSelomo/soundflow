import { Injectable, inject } from '@angular/core';
import { SearchTrack } from '../models/search-track.model';
import { AppleMusicAdapter } from './apple-music.adapter';
import { SoundflowDataService } from './soundflow-data.service';
import { SpotifyAdapter } from './spotify.adapter';
import { YouTubeSearchAdapter } from './youtube-search.adapter';

export interface CatalogSearchResults {
  local: SearchTrack[];
  youtube: SearchTrack[];
  apple: SearchTrack[];
  spotify: SearchTrack[];
}

@Injectable({ providedIn: 'root' })
export class CatalogSearchService {
  private readonly data = inject(SoundflowDataService);
  private readonly youtube = inject(YouTubeSearchAdapter);
  private readonly apple = inject(AppleMusicAdapter);
  private readonly spotify = inject(SpotifyAdapter);

  async search(query: string): Promise<CatalogSearchResults> {
    const term = query.trim().toLowerCase();
    const [youtube, apple, spotify] = await Promise.all([
      this.safe(this.youtube.search(query)),
      this.safe(this.apple.search(query)),
      this.safe(this.spotify.search(query)),
    ]);
    return {
      local: this.local(term),
      youtube,
      apple,
      spotify,
    };
  }

  private local(term: string): SearchTrack[] {
    if (!term) {
      return [];
    }
    return this.data
      .songs()
      .filter((song) => {
        const artist = this.data.profileById(song.artistId)?.fullName ?? '';
        return `${song.title} ${artist}`.toLowerCase().includes(term);
      })
      .map((song) => ({
        id: song.id,
        source: 'soundflow' as const,
        title: song.title,
        artist: this.data.profileById(song.artistId)?.fullName ?? 'Artist',
        coverUrl: song.coverUrl,
        duration: song.duration,
        externalId: song.id,
      }));
  }

  private async safe(request: Promise<SearchTrack[]>): Promise<SearchTrack[]> {
    try {
      return await request;
    } catch {
      return [];
    }
  }
}
