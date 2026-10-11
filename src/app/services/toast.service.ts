import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  kind: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly messages = signal<ToastMessage[]>([]);

  success(text: string): void {
    this.push(text, 'success');
  }

  error(text: string): void {
    this.push(text, 'error');
  }

  dismiss(id: number): void {
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  private push(text: string, kind: ToastMessage['kind']): void {
    const id = this.nextId++;
    this.messages.update((messages) => [...messages, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), 2800);
  }
}
