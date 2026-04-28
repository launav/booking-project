import { Injectable, signal, computed } from '@angular/core';

export interface BookingContext {
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  roomCount: number;
  eventName: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingContextService {

  checkIn    = signal<Date | null>(null);
  checkOut   = signal<Date | null>(null);
  adults     = signal<number>(1);
  roomCount  = signal<number>(1);
  eventName  = signal<string>('');

  nights = computed(() => {
    const ci = this.checkIn();
    const co = this.checkOut();
    if (!ci || !co) return 0;
    return Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
  });

  setContext(ctx: Partial<BookingContext>): void {
    if (ctx.checkIn   !== undefined) this.checkIn.set(ctx.checkIn);
    if (ctx.checkOut  !== undefined) this.checkOut.set(ctx.checkOut);
    if (ctx.adults    !== undefined) this.adults.set(ctx.adults);
    if (ctx.roomCount !== undefined) this.roomCount.set(ctx.roomCount);
    if (ctx.eventName !== undefined) this.eventName.set(ctx.eventName);
  }
}
