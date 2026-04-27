import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatToolbarModule }   from '@angular/material/toolbar';
import { MatIconModule }      from '@angular/material/icon';
import { MatButtonModule }    from '@angular/material/button';
import { MatMenuModule }      from '@angular/material/menu';
import { MatDividerModule }   from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrl:    './header.component.scss',
})
export class HeaderComponent {

  // ── Estado de autenticación ────────────────────────────────
  private _token = signal<string | null>(localStorage.getItem('token'));

  isLoggedIn = computed(() => !!this._token());

  userName = computed(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return '';
    try {
      const user = JSON.parse(raw);
      return user.first_name ?? '';
    } catch { return ''; }
  });

  constructor(private router: Router) {}

  // ── Acciones del menú de usuario ───────────────────────────
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToFavorites(): void {
    this.router.navigate(['/favorites']);
  }

  goToReservations(): void {
    this.router.navigate(['/reservations']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._token.set(null);
    this.router.navigate(['/home']);
  }

  deleteAccount(): void {
    // El diálogo de confirmación se implementará en la página de perfil
    this.router.navigate(['/profile'], { queryParams: { action: 'delete' } });
  }
}
