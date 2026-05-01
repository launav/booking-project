import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Booking } from './models/booking.model';
import { PaginatedResponse } from './models/pagination.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/reservations`;

  getAll(page: number, limit: number): Observable<PaginatedResponse<Booking>> {
    return this.http.get<PaginatedResponse<Booking>>(
      `${this.base}?page=${page}&limit=${limit}`
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
