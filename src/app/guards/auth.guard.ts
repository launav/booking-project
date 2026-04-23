import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // TODO: Implementar lógica de autenticación
    // Por ahora retorna false - cambiar cuando se implemente autenticación
    const isAdmin = this.isUserAdmin();

    if (!isAdmin) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }

  private isUserAdmin(): boolean {
    // TODO: Verificar si el usuario es admin desde localStorage, sessionStorage o servicio
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).isAdmin === true : false;
  }
}
