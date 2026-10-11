import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import { sourceLabel } from '../../models/search-track.model';
import { PlayerService } from '../../services/player.service';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { StreamingPlaybackService } from '../../services/streaming-playback.service';
import { formatClock } from '../../utils/format';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-player-bar',
  imports: [IconComponent],
  templateUrl: './player-bar.component.html',
  styleUrl: './player-bar.component.css',
})
export class PlayerBarComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly streaming = inject(StreamingPlaybackService);
  private readonly ytHost = viewChild<ElementRef<HTMLDivElement>>('ytHost');
  protected readonly player = inject(PlayerService);
  protected readonly sourceLabel = sourceLabel;

  constructor() {
    afterNextRender(() => {
      const element = this.ytHost()?.nativeElement;
      if (element) {
        this.streaming.setHost(element);
      }
    });
  }

  protected artistName(): string {
    const song = this.player.current();
    if (!song) {
      return '';
    }
    return this.data.profileById(song.artistId)?.fullName ?? 'Artist';
  }

  protected clock(seconds: number): string {
    return formatClock(seconds);
  }

  protected onSeek(event: Event): void {
    this.player.seek(Number((event.target as HTMLInputElement).value));
  }

  protected onVolume(event: Event): void {
    this.player.setVolume(Number((event.target as HTMLInputElement).value));
  }
}
