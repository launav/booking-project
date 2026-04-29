import { Injectable, signal } from '@angular/core';

export interface ModalError {
  title:   string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  error = signal<ModalError | null>(null);

  showError(title: string, message: string): void {
    this.error.set({ title, message });
  }

  close(): void {
    this.error.set(null);
  }
}
