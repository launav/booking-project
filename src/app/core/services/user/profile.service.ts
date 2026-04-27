import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  favorites: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  // TODO: inyectar HttpClient cuando se conecte al backend
  // constructor(private http: HttpClient) {}

  getProfile(userId: number): Observable<UserProfile> {
    // TODO: return this.http.get<UserProfile>(`${environment.apiUrl}/users/${userId}`)
    return of({} as UserProfile);
  }

  updateProfile(userId: number, data: Partial<UserProfile>): Observable<UserProfile> {
    // TODO: return this.http.put<UserProfile>(`${environment.apiUrl}/users/${userId}`, data)
    return of({} as UserProfile);
  }

  toggleFavorite(userId: number, roomId: number): Observable<void> {
    // TODO: return this.http.post<void>(`${environment.apiUrl}/users/${userId}/favorites/${roomId}`, {})
    return of(void 0);
  }
}
