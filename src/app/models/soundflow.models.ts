export type Role = 'listener' | 'artist' | 'organiser';
export type EventStatus = 'upcoming' | 'cancelled';
export type InviteStatus = 'invited' | 'accepted' | 'declined';

export interface Profile {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  genre: string | null;
  bio: string | null;
  role: Role;
  followers: number;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  coverUrl: string | null;
  year: string;
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  albumId: string | null;
  coverUrl: string | null;
  duration: string;
  plays: number;
  description: string;
}

export interface MusicEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  coverUrl: string | null;
  organiserId: string;
  status: EventStatus;
}

export interface EventArtist {
  id: string;
  eventId: string;
  artistId: string;
  status: InviteStatus;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  songId: string | null;
  eventId: string | null;
  artistId: string | null;
}

export interface CommentNode extends Comment {
  replies: CommentNode[];
}
