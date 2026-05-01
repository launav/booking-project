import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/user/auth.service';

export const AdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;

  // Si está logado pero no es admin -> inicio
  // Si no está logado -> login
  router.navigate([auth.isLoggedIn() ? '/home' : '/login']);
  return false;
};
