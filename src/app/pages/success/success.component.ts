import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BookingContextService } from '../../core/services/user/booking-context.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class SuccessComponent {

  private ctx = inject(BookingContextService);
  private router = inject(Router);

  // Datos de la reserva confirmada
  room = computed(() => this.ctx.selectedRoom());
  option = computed(() => this.ctx.selectedOption());
  reservationId = computed(() => this.ctx.reservationId());
  totalPrice = computed(() => this.ctx.totalPrice());
  nights = computed(() => this.ctx.nights());
  checkInLabel = computed(() => this.formatDate(this.ctx.checkIn()));
  checkOutLabel = computed(() => this.formatDate(this.ctx.checkOut()));

  // Acciones

  goHome(): void {
    this.ctx.clear();
    this.router.navigate(['/home']);
  }

  // Helpers

  private formatDate(date: Date | null): string {
    if (!date) return '—';
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
