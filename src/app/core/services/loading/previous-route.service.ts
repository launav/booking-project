import { Injectable, signal } from '@angular/core';

/** Rutas que NO se deben guardar como "última ruta segura" del cliente */
const EXCLUDED = ['/resume', '/payment', '/success', '/profile', '/admin'];

@Injectable({ providedIn: 'root' })
export class PreviousRouteService {

  private _prev = signal<string>('/home');
  readonly prev = this._prev.asReadonly();

  /** Llamar en cada NavigationEnd desde MainLayout */
  track(url: string): void {
    if (!EXCLUDED.some(prefix => url.startsWith(prefix))) {
      this._prev.set(url);
    }
  }
}
