import { Injectable, inject } from '@angular/core';
import { SearchTrack } from '../models/search-track.model';
import { AppleMusicAdapter } from './apple-music.adapter';
import { SpotifyAdapter } from './spotify.adapter';

interface YouTubePlayer {
  loadVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface SpotifyPlayer {
  connect(): Promise<boolean>;
  addListener(event: 'ready', callback: (data: { device_id: string }) => void): void;
  addListener(event: 'player_state_changed', callback: (state: SpotifyState | null) => void): void;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getCurrentState(): Promise<SpotifyState | null>;
}

interface SpotifyState {
  position: number;
  duration: number;
  paused: boolean;
}

interface PlaybackHooks {
  onEnded: () => void;
  onPlaying: (playing: boolean) => void;
}

declare global {
  interface Window {
    YT?: { Player: new (element: HTMLElement, options: unknown) => YouTubePlayer };
    onYouTubeIframeAPIReady?: () => void;
    Spotify?: { Player: new (options: unknown) => SpotifyPlayer };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

@Injectable({ providedIn: 'root' })
export class StreamingPlaybackService {
  private readonly apple = inject(AppleMusicAdapter);
  private readonly spotifyAuth = inject(SpotifyAdapter);
  private hooks: PlaybackHooks | null = null;
  private host: HTMLElement | null = null;
  private youtube: YouTubePlayer | null = null;
  private youtubeReady: Promise<void> | null = null;
  private pendingVideo: string | null = null;
  private spotifyPlayer: SpotifyPlayer | null = null;
  private spotifyDeviceId: string | null = null;
  private spotifyReady: Promise<void> | null = null;
  private spotifyState: SpotifyState | null = null;
  private active: SearchTrack['source'] | null = null;

  bind(hooks: PlaybackHooks): void {
    this.hooks = hooks;
  }

  setHost(element: HTMLElement): void {
    this.host = element;
    if (this.pendingVideo) {
      const videoId = this.pendingVideo;
      this.pendingVideo = null;
      void this.playYouTube(videoId);
    }
  }

  async play(track: SearchTrack): Promise<void> {
    this.stop();
    this.active = track.source;
    if (track.source === 'youtube') {
      await this.playYouTube(track.externalId);
      return;
    }
    if (track.source === 'apple') {
      await this.playApple(track.externalId);
      return;
    }
    if (track.source === 'spotify') {
      await this.playSpotify(track.externalId);
    }
  }

  pause(): void {
    if (this.active === 'youtube') {
      this.youtube?.pauseVideo();
    } else if (this.active === 'apple') {
      void this.apple.instance().then((music) => music.pause());
    } else if (this.active === 'spotify') {
      void this.spotifyPlayer?.pause();
    }
  }

  resume(): void {
    if (this.active === 'youtube') {
      this.youtube?.playVideo();
    } else if (this.active === 'apple') {
      void this.apple.instance().then((music) => music.play());
    } else if (this.active === 'spotify') {
      void this.spotifyPlayer?.resume();
    }
  }

  seek(seconds: number): void {
    if (this.active === 'youtube') {
      this.youtube?.seekTo(seconds, true);
    } else if (this.active === 'apple') {
      void this.apple.instance().then((music) => music.seekToTime(seconds));
    } else if (this.active === 'spotify') {
      void this.spotifyPlayer?.seek(seconds * 1000);
    }
  }

  setVolume(volume: number): void {
    if (this.active === 'youtube') {
      this.youtube?.setVolume(volume);
    } else if (this.active === 'apple') {
      void this.apple.instance().then((music) => {
        music.volume = volume / 100;
      });
    } else if (this.active === 'spotify') {
      void this.spotifyPlayer?.setVolume(volume / 100);
    }
  }

  snapshot(): { seconds: number; duration: number } {
    if (this.active === 'youtube' && this.youtube) {
      return {
        seconds: this.youtube.getCurrentTime?.() ?? 0,
        duration: this.youtube.getDuration?.() ?? 0,
      };
    }
    if (this.active === 'apple') {
      const music = window.MusicKit?.getInstance();
      return {
        seconds: music?.currentPlaybackTime ?? 0,
        duration: music?.currentPlaybackDuration ?? 0,
      };
    }
    if (this.active === 'spotify' && this.spotifyState) {
      return {
        seconds: this.spotifyState.position / 1000,
        duration: this.spotifyState.duration / 1000,
      };
    }
    return { seconds: 0, duration: 0 };
  }

  stop(): void {
    this.youtube?.pauseVideo();
    if (window.MusicKit) {
      window.MusicKit.getInstance().pause();
    }
    void this.spotifyPlayer?.pause();
    this.active = null;
  }

  private async playYouTube(videoId: string): Promise<void> {
    if (!this.host) {
      this.pendingVideo = videoId;
      return;
    }
    await this.loadYouTube();
    if (!this.youtube) {
      const mount = document.createElement('div');
      this.host.replaceChildren(mount);
      this.youtube = new window.YT!.Player(mount, {
        width: '104',
        height: '56',
        videoId,
        playerVars: { autoplay: 1, rel: 0, origin: window.location.origin },
        events: {
          onStateChange: (event: { data: number }) => {
            if (event.data === 1) {
              this.hooks?.onPlaying(true);
            } else if (event.data === 2) {
              this.hooks?.onPlaying(false);
            } else if (event.data === 0) {
              this.hooks?.onEnded();
            }
          },
        },
      });
      return;
    }
    this.youtube.loadVideoById(videoId);
  }

  private loadYouTube(): Promise<void> {
    if (window.YT?.Player) {
      return Promise.resolve();
    }
    if (this.youtubeReady) {
      return this.youtubeReady;
    }
    this.youtubeReady = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    });
    return this.youtubeReady;
  }

  private async playApple(songId: string): Promise<void> {
    const music = await this.apple.instance();
    if (!music.isAuthorized) {
      await this.apple.connect();
    }
    await music.setQueue({ song: songId });
    music.volume = 0.7;
    await music.play();
    this.hooks?.onPlaying(true);
  }

  private async playSpotify(trackId: string): Promise<void> {
    const token = await this.spotifyAuth.token();
    await this.ensureSpotify();
    if (!this.spotifyDeviceId) {
      throw new Error('Spotify player is not ready');
    }
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${this.spotifyDeviceId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
      },
    );
    if (!response.ok) {
      throw new Error('Spotify playback needs a Premium account');
    }
    this.hooks?.onPlaying(true);
  }

  private ensureSpotify(): Promise<void> {
    if (this.spotifyDeviceId) {
      return Promise.resolve();
    }
    if (this.spotifyReady) {
      return this.spotifyReady;
    }
    this.spotifyReady = new Promise((resolve, reject) => {
      const start = () => {
        if (!window.Spotify) {
          reject(new Error('Spotify player could not be loaded'));
          return;
        }
        this.spotifyPlayer = new window.Spotify.Player({
          name: 'SoundFlow',
          getOAuthToken: (callback: (value: string) => void) => {
            void this.spotifyAuth.token().then(callback);
          },
          volume: 0.7,
        });
        this.spotifyPlayer.addListener('ready', ({ device_id }) => {
          this.spotifyDeviceId = device_id;
          resolve();
        });
        this.spotifyPlayer.addListener('player_state_changed', (state) => {
          this.spotifyState = state;
          if (state) {
            this.hooks?.onPlaying(!state.paused);
          }
        });
        void this.spotifyPlayer.connect();
      };
      if (window.Spotify) {
        start();
        return;
      }
      window.onSpotifyWebPlaybackSDKReady = start;
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.onerror = () => reject(new Error('Spotify player could not be loaded'));
      document.body.appendChild(script);
    });
    return this.spotifyReady;
  }
}
