export type TrackSource = 'soundflow' | 'youtube' | 'apple' | 'spotify';

export interface SearchTrack {
  id: string;
  source: TrackSource;
  title: string;
  artist: string;
  coverUrl: string | null;
  duration: string;
  externalId: string;
}

export function sourceLabel(source: TrackSource): string {
  switch (source) {
    case 'soundflow':
      return 'SoundFlow';
    case 'youtube':
      return 'YouTube';
    case 'apple':
      return 'Apple Music';
    case 'spotify':
      return 'Spotify';
  }
}
