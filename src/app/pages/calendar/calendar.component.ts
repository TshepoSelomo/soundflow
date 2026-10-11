import { Component, inject } from '@angular/core';
import { IconComponent } from '../../components/icon/icon.component';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { dayOfMonth, formatMonth, yearOf } from '../../utils/format';

@Component({
  selector: 'app-calendar',
  imports: [IconComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent {
  private readonly data = inject(SoundflowDataService);

  protected rows() {
    return this.data.calendar();
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

  protected year(iso: string): number {
    return yearOf(iso);
  }
}
