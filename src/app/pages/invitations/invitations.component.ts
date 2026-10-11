import { Component, inject } from '@angular/core';
import { IconComponent } from '../../components/icon/icon.component';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { ToastService } from '../../services/toast.service';
import { formatLongDate } from '../../utils/format';

@Component({
  selector: 'app-invitations',
  imports: [IconComponent],
  templateUrl: './invitations.component.html',
  styleUrl: './invitations.component.css',
})
export class InvitationsComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly toast = inject(ToastService);

  protected rows() {
    return this.data.invitations();
  }

  protected eventFor(eventId: string) {
    return this.data.eventById(eventId);
  }

  protected fromName(organiserId: string): string {
    return this.data.profileById(organiserId)?.fullName ?? 'Organiser';
  }

  protected date(iso: string): string {
    return formatLongDate(iso);
  }

  protected respond(id: string, status: 'accepted' | 'declined'): void {
    this.data.respondToInvite(id, status);
    this.toast.success(
      status === 'accepted'
        ? 'Invitation accepted! Added to your calendar.'
        : 'Invitation declined.',
    );
  }
}
