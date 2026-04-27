import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CardData } from '../../../components/card/card.component';

export interface Room extends CardData {
  price: number;
  location: string;
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RoomsAdminService {

  // TODO: inyectar HttpClient cuando se conecte al backend
  // constructor(private http: HttpClient) {}

  getAllRooms(): Observable<Room[]> {
    // TODO: return this.http.get<Room[]>(`${environment.apiUrl}/admin/rooms`)
    return of([]);
  }

  createRoom(room: Partial<Room>): Observable<Room> {
    // TODO: return this.http.post<Room>(`${environment.apiUrl}/admin/rooms`, room)
    return of({} as Room);
  }

  updateRoom(roomId: number, room: Partial<Room>): Observable<Room> {
    // TODO: return this.http.put<Room>(`${environment.apiUrl}/admin/rooms/${roomId}`, room)
    return of({} as Room);
  }

  deleteRoom(roomId: number): Observable<void> {
    // TODO: return this.http.delete<void>(`${environment.apiUrl}/admin/rooms/${roomId}`)
    return of(void 0);
  }
}
