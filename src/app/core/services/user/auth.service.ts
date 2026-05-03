import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { from, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse
} from './models/auth.model';
import { STORAGE_KEYS } from '../../constants/storage-keys';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(localStorage.getItem(STORAGE_KEYS.TOKEN));
  private _user = signal<AuthUser | null>(this.loadUser());

  readonly token = this._token.asReadonly();

  isLoggedIn = computed(() => !!this._token());
  currentUser = computed(() => this._user());
  userName = computed(() => this._user()?.first_name ?? '');
  isAdmin = computed(() => this._user()?.role === 'admin');

  login$(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap(res => this.saveSession(res.token, res.user)));
  }

  register$(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${environment.apiUrl}/auth/register`,
      data
    );
  }

  saveSession(token: string, user: AuthUser): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/home']);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
