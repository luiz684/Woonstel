import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal('');

  show(msg: string) {
    this.message.set(msg);
    setTimeout(() => this.message.set(''), 2500);
  }
}