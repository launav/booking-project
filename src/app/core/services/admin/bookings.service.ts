import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Booking } from '../user/booking.service';

@Injectable({
  providedIn: 'root'
})
export class BookingsAdminService {

  // TODO: inyectar HttpClient cuando se conecte al backend
  // constructor(private http: HttpClient) {}

  getAllBookings(): Observable<Booking[]> {
    // TODO: return this.http.get<Booking[]>(`${environment.apiUrl}/admin/bookings`)
    return of([]);
  }

  updateBookingStatus(bookingId: number, status: Booking['status']): Observable<Booking> {
    // TODO: return this.http.patch<Booking>(`${environment.apiUrl}/admin/bookings/${bookingId}`, { status })
    return of({} as Booking);
  }

  deleteBooking(bookingId: number): Observable<void> {
    // TODO: return this.http.delete<void>(`${environment.apiUrl}/admin/bookings/${bookingId}`)
    return of(void 0);
  }
}
