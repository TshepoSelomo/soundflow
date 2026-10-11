import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayerBarComponent } from './components/player-bar/player-bar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, PlayerBarComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
