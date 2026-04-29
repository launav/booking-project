import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/user/auth.service';
import { Booking, BookingService } from '../../core/services/user/booking.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'
})
export class ReservationsComponent implements OnInit {

  authService    = inject(AuthService);
  bookingService = inject(BookingService);

  reservations = signal<Booking[]>([]);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) return;
    // TODO: cargar reservas reales
    // this.bookingService.getUserBookings(this.authService.currentUser()!.id)
    //   .subscribe(data => this.reservations.set(data));
    this.reservations.set([]);
  }
}
