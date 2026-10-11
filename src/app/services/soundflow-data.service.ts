import { Injectable, computed, signal } from '@angular/core';
import {
  Album,
  Comment,
  CommentNode,
  EventArtist,
  MusicEvent,
  Profile,
  Song,
} from '../models/soundflow.models';
import { todayIso } from '../utils/format';

const COVER_1 = '/assets/album-1-BqGu_ho9.jpg';
const COVER_2 = '/assets/album-2-2b7p392b.jpg';
const COVER_3 = '/assets/album-3-CK_L7T_w.jpg';
const HERO = '/assets/hero-bg-Bo16FAa4.jpg';

@Injectable({ providedIn: 'root' })
export class SoundflowDataService {
  readonly guestId = 'guest';

  private readonly profilesState = signal<Profile[]>([
    {
      userId: 'guest',
      fullName: 'Guest',
      email: 'guest@soundflow.local',
      avatarUrl: '/assets/logo-D9mZYfi1.png',
      genre: 'Indie',
      bio: 'Previewing SoundFlow without an account.',
      role: 'artist',
      followers: 128,
    },
    {
      userId: 'luna',
      fullName: 'Luna Nova',
      email: 'luna@soundflow.local',
      avatarUrl: COVER_1,
      genre: 'Electronic',
      bio: 'Late-night synths and neon pulses from Cape Town.',
      role: 'artist',
      followers: 2400000,
    },
    {
      userId: 'sky',
      fullName: 'Skyward',
      email: 'sky@soundflow.local',
      avatarUrl: COVER_2,
      genre: 'Synthwave',
      bio: 'Night drives, chrome skies, and analog drums.',
      role: 'artist',
      followers: 1800000,
    },
    {
      userId: 'tidal',
      fullName: 'Tidal',
      email: 'tidal@soundflow.local',
      avatarUrl: COVER_3,
      genre: 'Ambient',
      bio: 'Slow tides and deep-blue instrumentals.',
      role: 'artist',
      followers: 980000,
    },
    {
      userId: 'amahle',
      fullName: 'Amahle Events',
      email: 'amahle@soundflow.local',
      avatarUrl: null,
      genre: null,
      bio: 'Live music nights across the city.',
      role: 'organiser',
      followers: 0,
    },
  ]);

  private readonly albumsState = signal<Album[]>([
    { id: 'neon', title: 'Neon Pulse', artistId: 'luna', coverUrl: COVER_1, year: '2025' },
    { id: 'drive', title: 'Night Drive', artistId: 'sky', coverUrl: COVER_2, year: '2024' },
    { id: 'blue', title: 'Deep Blue', artistId: 'tidal', coverUrl: COVER_3, year: '2026' },
    { id: 'first', title: 'First Light', artistId: 'guest', coverUrl: COVER_1, year: '2026' },
  ]);

  private readonly songsState = signal<Song[]>([
    { id: 's1', title: 'Midnight Dreams', artistId: 'luna', albumId: 'neon', coverUrl: COVER_1, duration: '3:42', plays: 2400000, description: '' },
    { id: 's2', title: 'City Lights', artistId: 'luna', albumId: 'neon', coverUrl: COVER_1, duration: '4:15', plays: 1800000, description: '' },
    { id: 's3', title: 'Starfall', artistId: 'luna', albumId: 'neon', coverUrl: COVER_1, duration: '3:20', plays: 1500000, description: '' },
    { id: 's4', title: 'Electric Horizon', artistId: 'sky', albumId: 'drive', coverUrl: COVER_2, duration: '3:58', plays: 3100000, description: '' },
    { id: 's5', title: 'Retrowave', artistId: 'sky', albumId: 'drive', coverUrl: COVER_2, duration: '4:30', plays: 2200000, description: '' },
    { id: 's6', title: 'Ocean Breeze', artistId: 'tidal', albumId: 'blue', coverUrl: COVER_3, duration: '5:02', plays: 980000, description: '' },
    { id: 's7', title: 'Open Window', artistId: 'guest', albumId: 'first', coverUrl: COVER_1, duration: '3:11', plays: 4200, description: 'A first demo.' },
    { id: 's8', title: 'Late Train', artistId: 'guest', albumId: null, coverUrl: null, duration: '2:48', plays: 860, description: 'Single' },
  ]);

  private readonly eventsState = signal<MusicEvent[]>([
    {
      id: 'e1',
      title: 'Neon Room',
      description: 'A late set of electronic and synthwave artists.',
      date: '2026-11-14',
      time: '19:00',
      venue: 'The Waiting Room',
      coverUrl: HERO,
      organiserId: 'amahle',
      status: 'upcoming',
    },
    {
      id: 'e2',
      title: 'Deep Blue Night',
      description: 'Ambient performances by the water.',
      date: '2026-12-02',
      time: '20:30',
      venue: 'Kalk Bay Theatre',
      coverUrl: COVER_3,
      organiserId: 'amahle',
      status: 'upcoming',
    },
    {
      id: 'e3',
      title: 'First Light Session',
      description: 'An intimate listening session for new local tracks.',
      date: '2026-11-28',
      time: '18:00',
      venue: 'Soundflow Studio',
      coverUrl: COVER_1,
      organiserId: 'guest',
      status: 'upcoming',
    },
  ]);

  private readonly lineupState = signal<EventArtist[]>([
    { id: 'l1', eventId: 'e1', artistId: 'luna', status: 'accepted' },
    { id: 'l2', eventId: 'e1', artistId: 'guest', status: 'invited' },
    { id: 'l3', eventId: 'e2', artistId: 'guest', status: 'accepted' },
    { id: 'l4', eventId: 'e2', artistId: 'tidal', status: 'accepted' },
    { id: 'l5', eventId: 'e3', artistId: 'luna', status: 'invited' },
  ]);

  private readonly commentsState = signal<Comment[]>([
    {
      id: 'c1',
      userId: 'sky',
      content: 'This chorus is huge.',
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      parentId: null,
      songId: 's1',
      eventId: null,
      artistId: null,
    },
  ]);

  private readonly followingState = signal<string[]>(['luna']);
  private readonly likedState = signal<string[]>([]);

  readonly profiles = this.profilesState.asReadonly();
  readonly albums = this.albumsState.asReadonly();
  readonly songs = this.songsState.asReadonly();
  readonly events = this.eventsState.asReadonly();

  readonly guest = computed(
    () => this.profilesState().find((profile) => profile.userId === this.guestId)!,
  );

  readonly artists = computed(() =>
    this.profilesState().filter((profile) => profile.role === 'artist'),
  );

  readonly upcomingEvents = computed(() =>
    this.eventsState()
      .filter((event) => event.status === 'upcoming' && event.date >= todayIso())
      .sort((a, b) => a.date.localeCompare(b.date)),
  );

  profileById(id: string): Profile | undefined {
    return this.profilesState().find((profile) => profile.userId === id);
  }

  albumById(id: string | null): Album | undefined {
    if (!id) {
      return undefined;
    }
    return this.albumsState().find((album) => album.id === id);
  }

  eventById(id: string): MusicEvent | undefined {
    return this.eventsState().find((event) => event.id === id);
  }

  songsForArtist(artistId: string): Song[] {
    return this.songsState()
      .filter((song) => song.artistId === artistId)
      .sort((a, b) => b.plays - a.plays);
  }

  songsForAlbum(albumId: string): Song[] {
    return this.songsState().filter((song) => song.albumId === albumId);
  }

  mySongs(): Song[] {
    return this.songsState().filter((song) => song.artistId === this.guestId);
  }

  myAlbums(): Album[] {
    return this.albumsState().filter((album) => album.artistId === this.guestId);
  }

  myEvents(): MusicEvent[] {
    return this.eventsState()
      .filter((event) => event.organiserId === this.guestId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  invitations(): EventArtist[] {
    return this.lineupState().filter(
      (row) => row.artistId === this.guestId && row.status === 'invited',
    );
  }

  calendar(): EventArtist[] {
    return this.lineupState().filter(
      (row) => row.artistId === this.guestId && row.status === 'accepted',
    );
  }

  lineupFor(eventId: string): EventArtist[] {
    return this.lineupState().filter(
      (row) => row.eventId === eventId && (row.status === 'accepted' || row.status === 'invited'),
    );
  }

  performancesFor(artistId: string): EventArtist[] {
    return this.lineupState().filter(
      (row) => row.artistId === artistId && row.status === 'accepted',
    );
  }

  isFollowing(artistId: string): boolean {
    return this.followingState().includes(artistId);
  }

  isLiked(songId: string): boolean {
    return this.likedState().includes(songId);
  }

  toggleLike(songId: string): void {
    this.likedState.update((ids) =>
      ids.includes(songId) ? ids.filter((id) => id !== songId) : [...ids, songId],
    );
  }

  toggleFollow(artistId: string): boolean {
    const following = this.isFollowing(artistId);
    this.followingState.update((ids) =>
      following ? ids.filter((id) => id !== artistId) : [...ids, artistId],
    );
    this.profilesState.update((profiles) =>
      profiles.map((profile) =>
        profile.userId === artistId
          ? { ...profile, followers: Math.max(0, profile.followers + (following ? -1 : 1)) }
          : profile,
      ),
    );
    return !following;
  }

  updateGuestName(fullName: string): void {
    this.profilesState.update((profiles) =>
      profiles.map((profile) =>
        profile.userId === this.guestId ? { ...profile, fullName } : profile,
      ),
    );
  }

  uploadTrack(input: {
    title: string;
    description: string;
    albumTitle: string | null;
    coverUrl: string | null;
    duration: string;
  }): void {
    let albumId: string | null = null;
    if (input.albumTitle) {
      albumId = `album-${Date.now()}`;
      this.albumsState.update((albums) => [
        {
          id: albumId!,
          title: input.albumTitle!,
          artistId: this.guestId,
          coverUrl: input.coverUrl,
          year: String(new Date().getFullYear()),
        },
        ...albums,
      ]);
    }
    this.songsState.update((songs) => [
      {
        id: `song-${Date.now()}`,
        title: input.title,
        artistId: this.guestId,
        albumId,
        coverUrl: input.coverUrl,
        duration: input.duration,
        plays: 0,
        description: input.description,
      },
      ...songs,
    ]);
  }

  deleteSong(id: string): void {
    this.songsState.update((songs) => songs.filter((song) => song.id !== id));
  }

  deleteAlbum(id: string): void {
    this.albumsState.update((albums) => albums.filter((album) => album.id !== id));
    this.songsState.update((songs) =>
      songs.map((song) => (song.albumId === id ? { ...song, albumId: null } : song)),
    );
  }

  respondToInvite(id: string, status: 'accepted' | 'declined'): void {
    this.lineupState.update((rows) =>
      rows.map((row) => (row.id === id ? { ...row, status } : row)),
    );
  }

  createEvent(input: {
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    coverUrl: string | null;
    artistIds: string[];
  }): void {
    const id = `event-${Date.now()}`;
    this.eventsState.update((events) => [
      {
        id,
        title: input.title,
        description: input.description,
        date: input.date,
        time: input.time,
        venue: input.venue,
        coverUrl: input.coverUrl,
        organiserId: this.guestId,
        status: 'upcoming',
      },
      ...events,
    ]);
    if (input.artistIds.length > 0) {
      this.lineupState.update((rows) => [
        ...rows,
        ...input.artistIds.map((artistId, index) => ({
          id: `${id}-${index}`,
          eventId: id,
          artistId,
          status: 'invited' as const,
        })),
      ]);
    }
  }

  cancelEvent(id: string): void {
    this.eventsState.update((events) =>
      events.map((event) => (event.id === id ? { ...event, status: 'cancelled' } : event)),
    );
  }

  removeArtistFromEvent(lineupId: string): void {
    this.lineupState.update((rows) => rows.filter((row) => row.id !== lineupId));
  }

  commentsFor(filter: { songId?: string; eventId?: string; artistId?: string }): CommentNode[] {
    const matches = this.commentsState().filter((comment) => {
      if (filter.songId) {
        return comment.songId === filter.songId;
      }
      if (filter.eventId) {
        return comment.eventId === filter.eventId;
      }
      if (filter.artistId) {
        return comment.artistId === filter.artistId;
      }
      return false;
    });
    const nodes = new Map<string, CommentNode>();
    for (const comment of matches) {
      nodes.set(comment.id, { ...comment, replies: [] });
    }
    const roots: CommentNode[] = [];
    for (const node of nodes.values()) {
      if (node.parentId && nodes.has(node.parentId)) {
        nodes.get(node.parentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  addComment(input: {
    content: string;
    parentId: string | null;
    songId: string | null;
    eventId: string | null;
    artistId: string | null;
  }): void {
    this.commentsState.update((comments) => [
      {
        id: `comment-${Date.now()}`,
        userId: this.guestId,
        content: input.content,
        createdAt: new Date().toISOString(),
        parentId: input.parentId,
        songId: input.songId,
        eventId: input.eventId,
        artistId: input.artistId,
      },
      ...comments,
    ]);
  }
}
