import { PricingOption } from './../../../pages/booking-detail/booking-detail.component';
import { Injectable, signal, computed } from '@angular/core';

import { BookingContext } from './models/booking-context.model';
import { RoomDetail } from './models/room-detail.model';

@Injectable({ providedIn: 'root' })
export class BookingContextService {

  checkIn = signal<Date | null>(null);
  checkOut = signal<Date | null>(null);
  adults = signal<number>(1);
  roomCount = signal<number>(1);
  eventName = signal<string>('');

  selectedRoom = signal<RoomDetail | null>(null);
  selectedOption = signal<PricingOption | null>(null);

  reservationId = signal<number | null>(null);

  nights = computed(() => {
    const ci = this.checkIn();
    const co = this.checkOut();
    if (!ci || !co) return 0;
    return Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
  });

  totalPrice = computed(() => {
    const nights = this.nights();
    const base = this.selectedOption()?.pricePerNight ?? 0;
    return nights > 0
      ? base * nights
      : (this.selectedOption()?.totalPrice ?? 0);
  });

  isComplete = computed(() =>
    !!this.selectedRoom() && !!this.selectedOption()
  );

  setContext(ctx: Partial<BookingContext>): void {
    if (ctx.checkIn !== undefined) this.checkIn.set(ctx.checkIn);
    if (ctx.checkOut !== undefined) this.checkOut.set(ctx.checkOut);
    if (ctx.adults !== undefined) this.adults.set(ctx.adults);
    if (ctx.roomCount !== undefined) this.roomCount.set(ctx.roomCount);
    if (ctx.eventName !== undefined) this.eventName.set(ctx.eventName);
  }

  setSelection(room: RoomDetail, option: PricingOption): void {
    this.selectedRoom.set(room);
    this.selectedOption.set(option);
  }

  setReservationId(id: number): void {
    this.reservationId.set(id);
  }

  clear(): void {
    this.selectedRoom.set(null);
    this.selectedOption.set(null);
    this.reservationId.set(null);
  }
}
