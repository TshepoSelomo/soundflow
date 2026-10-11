import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { ToastService } from '../../services/toast.service';
import { formatLongDate } from '../../utils/format';

@Component({
  selector: 'app-my-events',
  imports: [RouterLink, IconComponent],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.css',
})
export class MyEventsComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly toast = inject(ToastService);

  protected events() {
    return this.data.myEvents();
  }

  protected lineup(eventId: string) {
    return this.data.lineupFor(eventId);
  }

  protected artistName(id: string): string {
    return this.data.profileById(id)?.fullName ?? 'Artist';
  }

  protected when(date: string, time: string, venue: string): string {
    return `${formatLongDate(date).replace(/,?\s*\d{4}$/, '')} · ${time} · ${venue}`;
  }

  protected cancel(id: string): void {
    if (!confirm('Cancel this event?')) {
      return;
    }
    this.data.cancelEvent(id);
    this.toast.success('Event cancelled');
  }

  protected remove(id: string): void {
    this.data.removeArtistFromEvent(id);
    this.toast.success('Artist removed');
  }
}
