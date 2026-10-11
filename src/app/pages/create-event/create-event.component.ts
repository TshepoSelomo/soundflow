import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-create-event',
  imports: [FormsModule, IconComponent],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css',
})
export class CreateEventComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected title = '';
  protected description = '';
  protected date = '';
  protected time = '';
  protected venue = '';
  protected readonly coverUrl = signal<string | null>(null);
  protected readonly invited = signal<string[]>([]);

  protected artists() {
    return this.data.artists().filter((artist) => artist.userId !== this.data.guestId);
  }

  protected pickCover(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.coverUrl.set(file ? URL.createObjectURL(file) : null);
  }

  protected isInvited(id: string): boolean {
    return this.invited().includes(id);
  }

  protected toggle(id: string): void {
    this.invited.update((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  }

  protected create(): void {
    if (!this.title.trim() || !this.date || !this.time || !this.venue.trim()) {
      this.toast.error('Please fill in all required fields');
      return;
    }
    this.data.createEvent({
      title: this.title.trim(),
      description: this.description.trim(),
      date: this.date,
      time: this.time,
      venue: this.venue.trim(),
      coverUrl: this.coverUrl(),
      artistIds: this.invited(),
    });
    this.toast.success('Event created!');
    void this.router.navigateByUrl('/my-events');
  }
}
