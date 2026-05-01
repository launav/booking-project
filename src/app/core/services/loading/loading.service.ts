import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  isLoading = signal(false);

  private count = 0;

  show(): void {
    this.count++;
    this.isLoading.set(true);
  }

  hide(): void {
    if (--this.count <= 0) {
      this.count = 0;
      this.isLoading.set(false);
    }
  }
}
