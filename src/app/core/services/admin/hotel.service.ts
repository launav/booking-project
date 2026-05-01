import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Hotel } from './models/hotel.model';
import { PaginatedResponse } from './models/pagination.model';
import { CreateHotelDto, UpdateHotelDto } from './models/hotel.model';

@Injectable({ providedIn: 'root' })
export class HotelService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/hotels`;

  getAll(page: number, limit: number): Observable<PaginatedResponse<Hotel>> {
    return this.http.get<PaginatedResponse<Hotel>>(
      `${this.base}?page=${page}&limit=${limit}`
    );
  }

  create(data: CreateHotelDto): Observable<Hotel> {
    return this.http.post<Hotel>(this.base, data);
  }

  update(id: number, data: UpdateHotelDto): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
