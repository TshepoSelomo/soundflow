import { Component, inject, input } from '@angular/core';
import { Song } from '../../models/soundflow.models';
import { PlayerService } from '../../services/player.service';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { formatPlays } from '../../utils/format';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-song-row',
  imports: [IconComponent],
  templateUrl: './song-row.component.html',
  styleUrl: './song-row.component.css',
})
export class SongRowComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly player = inject(PlayerService);

  readonly song = input.required<Song>();
  readonly index = input.required<number>();

  protected artistName(): string {
    return this.data.profileById(this.song().artistId)?.fullName ?? 'Artist';
  }

  protected albumName(): string {
    return this.data.albumById(this.song().albumId)?.title ?? 'Single';
  }

  protected plays(): string {
    return formatPlays(this.song().plays);
  }

  protected liked(): boolean {
    return this.data.isLiked(this.song().id);
  }

  protected play(): void {
    this.player.play(this.song());
  }

  protected like(): void {
    this.data.toggleLike(this.song().id);
  }
}
