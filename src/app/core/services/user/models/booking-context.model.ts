export interface BookingContext {
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  roomCount: number;
  eventName: string;
}
