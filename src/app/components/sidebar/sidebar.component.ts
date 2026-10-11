import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../icon/icon.component';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly data = inject(SoundflowDataService);
  private readonly toast = inject(ToastService);

  protected readonly guest = this.data.guest;
  protected readonly items: NavItem[] = [
    { to: '/search', icon: 'search', label: 'Search' },
    { to: '/home', icon: 'home', label: 'Home' },
    { to: '/events', icon: 'events', label: 'Events' },
    { to: '/upload', icon: 'upload', label: 'Upload Music' },
    { to: '/my-music', icon: 'music', label: 'My Music' },
    { to: '/calendar', icon: 'calendar', label: 'My Calendar' },
    { to: '/invitations', icon: 'invite', label: 'Invitations' },
    { to: '/my-events', icon: 'events', label: 'My Events' },
    { to: '/create-event', icon: 'calendar', label: 'Create Event' },
    { to: '/artists', icon: 'users', label: 'Browse Artists' },
  ];

  protected logout(): void {
    this.toast.success('You are already browsing as a guest. No login is required.');
  }
}
