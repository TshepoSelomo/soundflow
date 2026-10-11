import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommentNode } from '../../models/soundflow.models';
import { SoundflowDataService } from '../../services/soundflow-data.service';
import { timeAgo } from '../../utils/format';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-comments',
  imports: [FormsModule, IconComponent],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent {
  private readonly data = inject(SoundflowDataService);

  readonly songId = input<string | null>(null);
  readonly eventId = input<string | null>(null);
  readonly artistId = input<string | null>(null);

  protected draft = '';
  protected readonly replyingTo = signal<string | null>(null);

  protected readonly comments = computed(() =>
    this.data.commentsFor({
      songId: this.songId() ?? undefined,
      eventId: this.eventId() ?? undefined,
      artistId: this.artistId() ?? undefined,
    }),
  );

  protected readonly guest = this.data.guest;

  protected name(userId: string): string {
    return this.data.profileById(userId)?.fullName ?? 'User';
  }

  protected initial(userId: string): string {
    return this.name(userId).charAt(0) || '?';
  }

  protected ago(iso: string): string {
    return timeAgo(iso);
  }

  protected roleLabel(userId: string): string | null {
    const role = this.data.profileById(userId)?.role;
    if (role === 'artist') {
      return 'Artist';
    }
    if (role === 'organiser') {
      return 'Organiser';
    }
    return null;
  }

  protected reply(id: string): void {
    this.replyingTo.set(id);
  }

  protected cancelReply(): void {
    this.replyingTo.set(null);
  }

  protected send(): void {
    const content = this.draft.trim();
    if (!content) {
      return;
    }
    this.data.addComment({
      content,
      parentId: this.replyingTo(),
      songId: this.songId(),
      eventId: this.eventId(),
      artistId: this.artistId(),
    });
    this.draft = '';
    this.replyingTo.set(null);
  }

  protected threads(): CommentNode[] {
    return this.comments();
  }
}
