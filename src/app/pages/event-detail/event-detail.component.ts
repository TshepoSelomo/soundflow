import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CommentsComponent } from '../../components/comments/comments.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { formatLongDate } from '../../utils/format';

@Component({
  selector: 'app-event-detail',
  imports: [RouterLink, IconComponent, CommentsComponent],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css',
})
export class EventDetailComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly id = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), { initialValue: '' });

  protected readonly event = computed(() => this.data.eventById(this.id()));
  protected readonly lineup = computed(() => this.data.lineupFor(this.id()));

  protected organiser(): string {
    const event = this.event();
    return event ? this.data.profileById(event.organiserId)?.fullName ?? 'Organiser' : '';
  }

  protected longDate(): string {
    const event = this.event();
    return event ? formatLongDate(event.date) : '';
  }

  protected artistName(id: string): string {
    return this.data.profileById(id)?.fullName ?? 'Artist';
  }

  protected artistGenre(id: string): string {
    return this.data.profileById(id)?.genre || 'Artist';
  }

  protected artistAvatar(id: string): string | null {
    return this.data.profileById(id)?.avatarUrl ?? null;
  }

  protected initial(id: string): string {
    return this.artistName(id).charAt(0);
  }
}
