import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { formatShortDate } from '../../utils/format';

@Component({
  selector: 'app-events',
  imports: [RouterLink, IconComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent {
  private readonly data = inject(SoundflowDataService);
  protected readonly events = this.data.upcomingEvents;

  protected date(iso: string): string {
    return formatShortDate(iso);
  }

  protected organiser(id: string): string {
    return this.data.profileById(id)?.fullName ?? 'Organiser';
  }
}
