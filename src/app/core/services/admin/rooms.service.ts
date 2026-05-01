import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Room, CreateRoomDto, UpdateRoomDto } from './models/room.model';
import { PaginatedResponse } from './models/pagination.model';

@Injectable({ providedIn: 'root' })
export class RoomsService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/rooms`;

  getAll(page: number, limit: number): Observable<PaginatedResponse<Room>> {
    return this.http.get<PaginatedResponse<Room>>(
      `${this.base}?page=${page}&limit=${limit}`
    );
  }

  create(data: CreateRoomDto): Observable<Room> {
    return this.http.post<Room>(this.base, data);
  }

  update(id: number, data: UpdateRoomDto): Observable<Room> {
    return this.http.put<Room>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
