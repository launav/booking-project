import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Booking {
  id: number;
  roomId: number;
  userId: number;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  // TODO: inyectar HttpClient cuando se conecte al backend
  // constructor(private http: HttpClient) {}

  getUserBookings(userId: number): Observable<Booking[]> {
    // TODO: return this.http.get<Booking[]>(`${environment.apiUrl}/bookings?userId=${userId}`)
    return of([]);
  }

  createBooking(booking: Partial<Booking>): Observable<Booking> {
    // TODO: return this.http.post<Booking>(`${environment.apiUrl}/bookings`, booking)
    return of({} as Booking);
  }

  cancelBooking(bookingId: number): Observable<void> {
    // TODO: return this.http.patch<void>(`${environment.apiUrl}/bookings/${bookingId}/cancel`, {})
    return of(void 0);
  }
}
