import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/user/auth.service';
import { BookingService } from '../../core/services/user/booking.service';
import { Booking } from '../../core/services/user/models/booking.model';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'
})
export class ReservationsComponent implements OnInit {

  authService = inject(AuthService);
  bookingService = inject(BookingService);
  private destroyRef = inject(DestroyRef);

  reservations = signal<Booking[]>([]);

  // Obtener el ID del usuario actual para cargar sus reservas
  userId = this.authService.currentUser()?.id_user as any;

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) return;

    if (!this.userId) return;

    this.setBooking();
  }

  setBooking() {
    this.bookingService.getUserBookings(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => this.reservations.set(data),
        error: () => this.reservations.set([]),
      });
  }
}
