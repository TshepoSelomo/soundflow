import { Injectable, computed, inject, signal } from '@angular/core';
import { SearchTrack } from '../models/search-track.model';
import { Song } from '../models/soundflow.models';
import { durationToSeconds } from '../utils/format';
import { SoundflowDataService } from './soundflow-data.service';
import { StreamingPlaybackService } from './streaming-playback.service';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly data = inject(SoundflowDataService);
  private readonly streaming = inject(StreamingPlaybackService);
  private timer: ReturnType<typeof setInterval> | null = null;
  private externalQueue: SearchTrack[] = [];

  readonly current = signal<Song | null>(null);
  readonly external = signal<SearchTrack | null>(null);
  readonly playing = signal(false);
  readonly progress = signal(0);
  readonly volume = signal(70);
  readonly shuffle = signal(false);
  readonly repeat = signal(false);
  readonly reportedDuration = signal(0);

  readonly duration = computed(() => {
    if (this.external()) {
      return this.reportedDuration();
    }
    const song = this.current();
    return song ? durationToSeconds(song.duration) : 0;
  });

  constructor() {
    this.streaming.bind({
      onEnded: () => this.next(),
      onPlaying: (playing) => this.playing.set(playing),
    });
  }

  play(song: Song): void {
    this.external.set(null);
    this.externalQueue = [];
    this.streaming.stop();
    if (this.current()?.id !== song.id) {
      this.current.set(song);
      this.progress.set(0);
    }
    this.playing.set(true);
    this.startTick();
  }

  async playExternal(track: SearchTrack, queue: SearchTrack[]): Promise<void> {
    this.current.set(null);
    this.external.set(track);
    this.externalQueue = queue;
    this.progress.set(0);
    this.reportedDuration.set(durationToSeconds(track.duration));
    this.playing.set(true);
    this.startTick();
    await this.streaming.play(track);
    this.streaming.setVolume(this.volume());
  }

  playAlbum(albumId: string): void {
    const [first] = this.data.songsForAlbum(albumId);
    if (first) {
      this.play(first);
    }
  }

  toggle(): void {
    if (this.external()) {
      const nextPlaying = !this.playing();
      this.playing.set(nextPlaying);
      if (nextPlaying) {
        this.streaming.resume();
      } else {
        this.streaming.pause();
      }
      return;
    }
    if (!this.current()) {
      return;
    }
    this.playing.update((value) => !value);
    if (this.playing()) {
      this.startTick();
    }
  }

  seek(seconds: number): void {
    this.progress.set(seconds);
    if (this.external()) {
      this.streaming.seek(seconds);
    }
  }

  setVolume(value: number): void {
    this.volume.set(value);
    this.streaming.setVolume(value);
  }

  toggleShuffle(): void {
    this.shuffle.update((value) => !value);
  }

  toggleRepeat(): void {
    this.repeat.update((value) => !value);
  }

  next(): void {
    if (this.external()) {
      this.stepExternal(1);
      return;
    }
    const queue = this.queue();
    const current = this.current();
    if (queue.length === 0) {
      return;
    }
    if (this.shuffle()) {
      const pick = queue[Math.floor(Math.random() * queue.length)];
      this.play(pick);
      return;
    }
    const index = queue.findIndex((song) => song.id === current?.id);
    this.play(queue[(index + 1) % queue.length]);
  }

  previous(): void {
    if (this.external()) {
      if (this.progress() > 3) {
        this.seek(0);
        return;
      }
      this.stepExternal(-1);
      return;
    }
    if (this.progress() > 3) {
      this.progress.set(0);
      return;
    }
    const queue = this.queue();
    const index = queue.findIndex((song) => song.id === this.current()?.id);
    const previous = queue[(index - 1 + queue.length) % queue.length];
    if (previous) {
      this.play(previous);
    }
  }

  private stepExternal(direction: number): void {
    const queue = this.externalQueue;
    const current = this.external();
    if (!current || queue.length === 0) {
      return;
    }
    const index = queue.findIndex((track) => track.id === current.id);
    const next = queue[(index + direction + queue.length) % queue.length];
    if (next) {
      void this.playExternal(next, queue);
    }
  }

  private queue(): Song[] {
    const current = this.current();
    if (!current) {
      return this.data.songs();
    }
    const sameArtist = this.data.songsForArtist(current.artistId);
    return sameArtist.length > 0 ? sameArtist : this.data.songs();
  }

  private startTick(): void {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => {
      if (!this.playing()) {
        return;
      }
      if (this.external()) {
        const snap = this.streaming.snapshot();
        this.progress.set(snap.seconds);
        if (snap.duration > 0) {
          this.reportedDuration.set(snap.duration);
        }
        return;
      }
      const max = this.duration();
      const next = this.progress() + 1;
      if (max > 0 && next >= max) {
        if (this.repeat()) {
          this.progress.set(0);
        } else {
          this.next();
        }
        return;
      }
      this.progress.set(next);
    }, 1000);
  }
}
