import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-upload',
  imports: [FormsModule, IconComponent],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly toast = inject(ToastService);

  protected albumMode = false;
  protected albumTitle = '';
  protected title = '';
  protected description = '';
  protected readonly audioName = signal<string | null>(null);
  protected readonly coverUrl = signal<string | null>(null);

  protected pickAudio(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.audioName.set(file?.name ?? null);
  }

  protected pickCover(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.coverUrl.set(file ? URL.createObjectURL(file) : null);
  }

  protected clearAudio(): void {
    this.audioName.set(null);
  }

  protected upload(): void {
    if (!this.title.trim() || !this.audioName()) {
      this.toast.error('Please fill in the song title and select an audio file');
      return;
    }
    this.data.uploadTrack({
      title: this.title.trim(),
      description: this.description.trim(),
      albumTitle: this.albumMode ? this.albumTitle.trim() || null : null,
      coverUrl: this.coverUrl(),
      duration: '3:30',
    });
    this.toast.success('Music uploaded successfully!');
    this.title = '';
    this.description = '';
    this.albumTitle = '';
    this.audioName.set(null);
    this.coverUrl.set(null);
  }
}
