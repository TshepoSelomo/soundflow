import { Routes } from '@angular/router';
import { ArtistDetailComponent } from './pages/artist-detail/artist-detail.component';
import { ArtistsComponent } from './pages/artists/artists.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { CreateEventComponent } from './pages/create-event/create-event.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { EventsComponent } from './pages/events/events.component';
import { HomeComponent } from './pages/home/home.component';
import { InvitationsComponent } from './pages/invitations/invitations.component';
import { MyEventsComponent } from './pages/my-events/my-events.component';
import { MyMusicComponent } from './pages/my-music/my-music.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SearchComponent } from './pages/search/search.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { UploadComponent } from './pages/upload/upload.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'search', component: SearchComponent },
  { path: 'home', component: HomeComponent },
  { path: 'events', component: EventsComponent },
  { path: 'event/:id', component: EventDetailComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'my-music', component: MyMusicComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'invitations', component: InvitationsComponent },
  { path: 'create-event', component: CreateEventComponent },
  { path: 'my-events', component: MyEventsComponent },
  { path: 'artists', component: ArtistsComponent },
  { path: 'artist/:id', component: ArtistDetailComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', component: NotFoundComponent },
];
