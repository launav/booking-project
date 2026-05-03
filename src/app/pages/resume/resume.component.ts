import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingContextService } from '../../core/services/user/booking-context.service';
import { fallbackImage } from '../../core/services/user/room.service';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent {

  private router = inject(Router);
  ctx = inject(BookingContextService);

  // Datos de la selección
  // `booking` keeps the same shape the template uses (b.room / b.option)
  booking = computed(() => {
    const room = this.ctx.selectedRoom();
    const option = this.ctx.selectedOption();
    if (!room || !option) return null;
    return { room, option };
  });

  room = computed(() => this.ctx.selectedRoom());
  option = computed(() => this.ctx.selectedOption());

  stars = computed(() => {
    const n = this.room()?.stars ?? 5;
    return Array.from({ length: n }, (_, i) => i);
  });

  mealRegime = computed(() => {
    const name = this.option()?.name ?? '';
    if (name.includes('Media pensión')) return 'Media pensión';
    if (name.includes('Desayuno')) return 'Desayuno';
    return 'Sin régimen';
  });

  roomLabel = computed(() => {
    const type = this.room()?.roomType ?? '';
    const count = this.ctx.roomCount();
    return `${type} x ${count}`;
  });

  totalPrice = computed(() => this.ctx.totalPrice());
  checkInLabel = computed(() => this.formatDate(this.ctx.checkIn()));
  checkOutLabel = computed(() => this.formatDate(this.ctx.checkOut()));
  nights = computed(() => this.ctx.nights());
  hasDates = computed(() => !!this.ctx.checkIn() && !!this.ctx.checkOut());

  adults = this.ctx.adults;
  roomCount = this.ctx.roomCount;
  eventName = this.ctx.eventName;

  // Guard: si no hay selección, volvemos al inicio
  constructor() {
    if (!this.ctx.isComplete()) {
      this.router.navigate(['/home']);
    }
  }

  // Acciones

  goBack(): void {
    const id = this.room()?.id;
    if (id) this.router.navigate(['/room', id]);
    else history.back();
  }

  continue(): void {
    this.router.navigate(['/payment']);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = fallbackImage(this.room()?.roomType ?? 'default');
  }

  // Helpers

  private formatDate(date: Date | null): string {
    if (!date) return '—';
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
}
