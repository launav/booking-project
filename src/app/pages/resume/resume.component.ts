import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingContextService } from '../../core/services/user/booking-context.service';
import { RoomDetail, PricingOption } from '../booking-detail/booking-detail.component';

interface StoredBooking {
  room: RoomDetail;
  option: PricingOption;
}

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent implements OnInit {

  private router  = inject(Router);
  private ctx     = inject(BookingContextService);

  booking = signal<StoredBooking | null>(null);

  // ── Datos derivados ───────────────────────────────────────────

  stars = computed(() => {
    const n = this.booking()?.room.stars ?? 5;
    return Array.from({ length: n }, (_, i) => i);
  });

  mealRegime = computed(() => {
    const name = this.booking()?.option.name ?? '';
    if (name.includes('Media pensión')) return 'Media pensión';
    if (name.includes('Desayuno'))      return 'Desayuno';
    return 'Sin régimen';
  });

  roomLabel = computed(() => {
    const type  = this.booking()?.room.roomType ?? '';
    const count = this.ctx.roomCount();
    return `${type} x ${count}`;
  });

  totalPrice = computed(() => this.booking()?.option.totalPrice ?? 0);

  checkInLabel = computed(() => this.formatDate(this.ctx.checkIn()));
  checkOutLabel = computed(() => this.formatDate(this.ctx.checkOut()));

  adults    = this.ctx.adults;
  roomCount = this.ctx.roomCount;
  eventName = this.ctx.eventName;

  // ── Lifecycle ─────────────────────────────────────────────────

  ngOnInit(): void {
    const raw = sessionStorage.getItem('selectedOption');
    if (raw) {
      try {
        this.booking.set(JSON.parse(raw) as StoredBooking);
      } catch {
        this.router.navigate(['/home']);
      }
    } else {
      this.router.navigate(['/home']);
    }

    // Mock de contexto de búsqueda si no viene informado
    if (!this.ctx.checkIn()) {
      const ci = new Date(2025, 6, 21); // 21 julio 2025
      const co = new Date(2025, 6, 24); // 24 julio 2025
      this.ctx.setContext({ checkIn: ci, checkOut: co, adults: 1, roomCount: 1, eventName: 'Evento Fitur' });
    }
  }

  // ── Acciones ──────────────────────────────────────────────────

  goBack(): void {
    const id = this.booking()?.room.id;
    if (id) this.router.navigate(['/room', id]);
    else history.back();
  }

  continue(): void {
    this.router.navigate(['/payment']);
  }

  // ── Helpers ───────────────────────────────────────────────────

  private formatDate(date: Date | null): string {
    if (!date) return '—';
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
}
