import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserProfile } from '../user/profile.service';

@Injectable({
  providedIn: 'root'
})
export class UsersAdminService {

  // TODO: inyectar HttpClient cuando se conecte al backend
  // constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserProfile[]> {
    // TODO: return this.http.get<UserProfile[]>(`${environment.apiUrl}/admin/users`)
    return of([]);
  }

  getUserById(userId: number): Observable<UserProfile> {
    // TODO: return this.http.get<UserProfile>(`${environment.apiUrl}/admin/users/${userId}`)
    return of({} as UserProfile);
  }

  deleteUser(userId: number): Observable<void> {
    // TODO: return this.http.delete<void>(`${environment.apiUrl}/admin/users/${userId}`)
    return of(void 0);
  }
}
