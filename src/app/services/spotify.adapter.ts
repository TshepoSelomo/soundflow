import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { SearchTrack } from '../models/search-track.model';
import { formatDuration, spotifyConfigured, spotifyRedirectUri } from './platform-config';

interface SpotifyTrack {
  id?: string;
  name?: string;
  duration_ms?: number;
  artists?: { name?: string }[];
  album?: { images?: { url?: string }[] };
}

interface SpotifySession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const sessionKey = 'soundflow-spotify-session';
const verifierKey = 'soundflow-spotify-verifier';

@Injectable({ providedIn: 'root' })
export class SpotifyAdapter {
  readonly enabled = spotifyConfigured();
  readonly connected = signal(false);
  private session: SpotifySession | null = null;

  constructor() {
    this.session = readSession();
    this.connected.set(this.session !== null);
  }

  async connect(): Promise<void> {
    const verifier = randomString(64);
    sessionStorage.setItem(verifierKey, verifier);
    const challenge = await sha256(verifier);
    const params = new URLSearchParams({
      client_id: environment.spotifyClientId,
      response_type: 'code',
      redirect_uri: spotifyRedirectUri(),
      code_challenge_method: 'S256',
      code_challenge: challenge,
      scope: 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state',
    });
    window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
  }

  async completeAuth(code: string): Promise<void> {
    const verifier = sessionStorage.getItem(verifierKey);
    if (!verifier) {
      throw new Error('Spotify sign-in expired. Connect again.');
    }
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: spotifyRedirectUri(),
      client_id: environment.spotifyClientId,
      code_verifier: verifier,
    });
    const token = await requestToken(body);
    this.save(token);
    sessionStorage.removeItem(verifierKey);
  }

  async search(query: string): Promise<SearchTrack[]> {
    if (!this.enabled || !this.session) {
      return [];
    }
    const token = await this.token();
    const params = new URLSearchParams({ q: query, type: 'track', limit: '8' });
    const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Spotify search failed');
    }
    const body = (await response.json()) as { tracks?: { items?: SpotifyTrack[] } };
    return (body.tracks?.items ?? [])
      .filter((track) => track.id)
      .map((track) => ({
        id: `spotify-${track.id}`,
        source: 'spotify' as const,
        title: track.name ?? 'Spotify track',
        artist: track.artists?.map((artist) => artist.name).filter(Boolean).join(', ') || 'Spotify',
        coverUrl: track.album?.images?.[0]?.url ?? null,
        duration: formatDuration((track.duration_ms ?? 0) / 1000),
        externalId: track.id!,
      }));
  }

  async token(): Promise<string> {
    if (!this.session) {
      throw new Error('Connect Spotify to play this song');
    }
    if (Date.now() < this.session.expiresAt - 30_000) {
      return this.session.accessToken;
    }
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.session.refreshToken,
      client_id: environment.spotifyClientId,
    });
    this.save(await requestToken(body));
    return this.session.accessToken;
  }

  private save(token: SpotifyToken): void {
    const refreshToken = token.refresh_token || this.session?.refreshToken;
    if (!refreshToken) {
      throw new Error('Spotify did not return a refresh token');
    }
    this.session = {
      accessToken: token.access_token,
      refreshToken,
      expiresAt: Date.now() + token.expires_in * 1000,
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(this.session));
    this.connected.set(true);
  }
}

interface SpotifyToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

async function requestToken(body: URLSearchParams): Promise<SpotifyToken> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) {
    throw new Error('Spotify sign-in failed');
  }
  return (await response.json()) as SpotifyToken;
}

function readSession(): SpotifySession | null {
  const raw = sessionStorage.getItem(sessionKey);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SpotifySession;
  } catch {
    return null;
  }
}

function randomString(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return base64Url(new Uint8Array(digest));
}

function base64Url(bytes: Uint8Array): string {
  let text = '';
  bytes.forEach((byte) => {
    text += String.fromCharCode(byte);
  });
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
