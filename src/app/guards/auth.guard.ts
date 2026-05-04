import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/user/auth.service';

export const AuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
