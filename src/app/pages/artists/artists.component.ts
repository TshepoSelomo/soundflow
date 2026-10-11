import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { formatPlays } from '../../utils/format';

@Component({
  selector: 'app-artists',
  imports: [RouterLink, IconComponent],
  templateUrl: './artists.component.html',
  styleUrl: './artists.component.css',
})
export class ArtistsComponent {
  private readonly data = inject(SoundflowDataService);
  protected readonly artists = this.data.artists;

  protected followers(count: number): string {
    return formatPlays(count);
  }
}
