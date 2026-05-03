import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  Booking,
  CreateBookingRequest,
  CreateBookingResponse
} from './models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/reservations`;

  getUserBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.base}/my`);
  }

  createBooking(data: CreateBookingRequest): Observable<CreateBookingResponse> {
    return this.http.post<CreateBookingResponse>(this.base, data);
  }

  cancelBooking(bookingId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.base}/${bookingId}`
    );
  }
}
