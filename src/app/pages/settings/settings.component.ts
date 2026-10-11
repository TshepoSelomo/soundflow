import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../components/icon/icon.component';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, IconComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly toast = inject(ToastService);

  protected readonly guest = this.data.guest;
  protected name = this.data.guest().fullName;
  protected password = '';

  protected save(): void {
    const next = this.name.trim();
    if (!next) {
      this.toast.error('Please enter a display name');
      return;
    }
    this.data.updateGuestName(next);
    this.toast.success('Profile updated');
  }

  protected changePassword(): void {
    if (this.password.length < 6) {
      this.toast.error('Password must be at least 6 characters');
      return;
    }
    this.password = '';
    this.toast.success('Password updated');
  }

  protected deleteAccount(): void {
    if (!confirm('Are you sure? This cannot be undone.')) {
      return;
    }
    this.data.updateGuestName('Guest');
    this.name = 'Guest';
    this.toast.success('Guest profile reset. Login is not required.');
  }
}
