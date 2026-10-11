import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { SearchTrack, sourceLabel } from '../../models/search-track.model';
import { AppleMusicAdapter } from '../../services/apple-music.adapter';
import { CatalogSearchResults, CatalogSearchService } from '../../services/catalog-search.service';
import { PlayerService } from '../../services/player.service';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { SpotifyAdapter } from '../../services/spotify.adapter';
import { ToastService } from '../../services/toast.service';
import { YouTubeSearchAdapter } from '../../services/youtube-search.adapter';

@Component({
  selector: 'app-search',
  imports: [FormsModule, IconComponent, NgTemplateOutlet],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  private readonly catalog = inject(CatalogSearchService);
  private readonly data = inject(SoundflowDataService);
  private readonly player = inject(PlayerService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly youtube = inject(YouTubeSearchAdapter);
  protected readonly apple = inject(AppleMusicAdapter);
  protected readonly spotify = inject(SpotifyAdapter);
  protected readonly sourceLabel = sourceLabel;

  protected query = '';
  protected readonly searching = signal(false);
  protected readonly searched = signal(false);
  protected readonly results = signal<CatalogSearchResults>({
    local: [],
    youtube: [],
    apple: [],
    spotify: [],
  });

  async ngOnInit(): Promise<void> {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code || !this.spotify.enabled) {
      return;
    }
    try {
      await this.spotify.completeAuth(code);
      this.toast.success('Spotify connected');
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Spotify sign-in failed');
    }
    await this.router.navigate(['/search'], { replaceUrl: true });
  }

  protected async submit(): Promise<void> {
    const query = this.query.trim();
    if (!query) {
      return;
    }
    this.searching.set(true);
    this.searched.set(true);
    try {
      this.results.set(await this.catalog.search(query));
    } finally {
      this.searching.set(false);
    }
  }

  protected async play(track: SearchTrack): Promise<void> {
    if (track.source === 'soundflow') {
      const song = this.data.songs().find((item) => item.id === track.externalId);
      if (song) {
        this.player.play(song);
      }
      return;
    }
    const queue = this.queueFor(track.source);
    try {
      await this.player.playExternal(track, queue);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Playback failed');
    }
  }

  protected async connectApple(): Promise<void> {
    try {
      await this.apple.connect();
      this.toast.success('Apple Music connected');
      if (this.query.trim()) {
        await this.submit();
      }
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Apple Music sign-in failed');
    }
  }

  protected connectSpotify(): void {
    void this.spotify.connect();
  }

  protected anyExternal(): boolean {
    return this.youtube.enabled || this.apple.enabled || this.spotify.enabled;
  }

  private queueFor(source: SearchTrack['source']): SearchTrack[] {
    const current = this.results();
    if (source === 'youtube') {
      return current.youtube;
    }
    if (source === 'apple') {
      return current.apple;
    }
    if (source === 'spotify') {
      return current.spotify;
    }
    return current.local;
  }
}
