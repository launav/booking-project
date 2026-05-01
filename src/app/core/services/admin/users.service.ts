import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { User } from './models/user.model';
import { PaginatedResponse } from './models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  getAll(page: number, limit: number): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(
      `${this.base}?page=${page}&limit=${limit}`
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
