import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { PlayerService } from '../../services/player.service';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { formatShortDate } from '../../utils/format';

@Component({
  selector: 'app-home',
  imports: [RouterLink, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly player = inject(PlayerService);

  protected readonly albums = this.data.albums;
  protected readonly artists = this.data.artists;
  protected readonly events = this.data.upcomingEvents;

  protected date(iso: string): string {
    return formatShortDate(iso);
  }

  protected playAlbum(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.player.playAlbum(id);
  }
}
