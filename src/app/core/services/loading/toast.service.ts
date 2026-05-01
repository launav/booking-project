import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from './model/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {

  readonly toasts = signal<Toast[]>([]);
  private _nextId = 0;

  show(message: string, type: ToastType = 'error', duration = 4000): void {
    const id = this._nextId++;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
