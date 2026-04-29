import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  id: number;
  first_name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _token = signal<string | null>(localStorage.getItem('token'));
  private _user  = signal<AuthUser | null>(this.loadUser());

  isLoggedIn = computed(() => !!this._token());
  currentUser = computed(() => this._user());
  userName    = computed(() => this._user()?.first_name ?? '');

  constructor(private router: Router) {}

  login(token: string, user: AuthUser): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/home']);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
