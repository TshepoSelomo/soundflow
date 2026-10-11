import { Component, inject } from '@angular/core';
import { IconComponent } from '../../components/icon/icon.component';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-my-music',
  imports: [IconComponent],
  templateUrl: './my-music.component.html',
  styleUrl: './my-music.component.css',
})
export class MyMusicComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly toast = inject(ToastService);

  protected albums() {
    return this.data.myAlbums();
  }

  protected songs() {
    return this.data.mySongs();
  }

  protected albumTitle(id: string | null): string {
    return this.data.albumById(id)?.title ?? 'Single';
  }

  protected deleteAlbum(id: string): void {
    if (!confirm('Delete this album? Songs in it will become singles.')) {
      return;
    }
    this.data.deleteAlbum(id);
    this.toast.success('Album deleted');
  }

  protected deleteSong(id: string): void {
    if (!confirm('Delete this track?')) {
      return;
    }
    this.data.deleteSong(id);
    this.toast.success('Track deleted');
  }
}
