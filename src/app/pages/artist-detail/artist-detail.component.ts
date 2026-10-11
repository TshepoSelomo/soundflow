import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { CommentsComponent } from '../../components/comments/comments.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SongRowComponent } from '../../components/song-row/song-row.component';
import { PlayerService } from '../../services/player.service';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { dayOfMonth, formatMonth, formatPlays } from '../../utils/format';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-artist-detail',
  imports: [IconComponent, SongRowComponent, CommentsComponent],
  templateUrl: './artist-detail.component.html',
  styleUrl: './artist-detail.component.css',
})
export class ArtistDetailComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly player = inject(PlayerService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly id = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), { initialValue: '' });

  protected readonly artist = computed(() => this.data.profileById(this.id()));
  protected readonly songs = computed(() => this.data.songsForArtist(this.id()));
  protected readonly shows = computed(() => this.data.performancesFor(this.id()));
  protected readonly guest = this.data.guest;

  protected followers(): string {
    return formatPlays(this.artist()?.followers ?? 0);
  }

  protected following(): boolean {
    return this.data.isFollowing(this.id());
  }

  protected play(): void {
    const [first] = this.songs();
    if (first) {
      this.player.play(first);
    }
  }

  protected follow(): void {
    const nowFollowing = this.data.toggleFollow(this.id());
    this.toast.success(nowFollowing ? 'Following!' : 'Unfollowed');
  }

  protected eventFor(eventId: string) {
    return this.data.eventById(eventId);
  }

  protected day(iso: string): number {
    return dayOfMonth(iso);
  }

  protected month(iso: string): string {
    return formatMonth(iso);
  }
}
