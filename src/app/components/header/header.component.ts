import { Component, inject, signal, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { MatMenuModule }    from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService }      from '../../core/services/user/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrl:    './header.component.scss',
})
export class HeaderComponent {

  authService    = inject(AuthService);
  private router = inject(Router);

  scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 10);
  }

  goToFavorites(): void    { this.router.navigate(['/favorites']); }
  goToReservations(): void { this.router.navigate(['/reservations']); }
  goToProfile(): void      { this.router.navigate(['/profile']); }
  logout(): void           { this.authService.logout(); }
}
