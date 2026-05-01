import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, catchError, throwError } from 'rxjs';
import { AuthService }   from '../services/user/auth.service';
import { LoadingService } from '../services/loading/loading.service';
import { ToastService }  from '../services/loading/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth    = inject(AuthService);
  const loading = inject(LoadingService);
  const toast   = inject(ToastService);

  const token = auth.token();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  loading.show();

  return next(authReq).pipe(
    finalize(() => loading.hide()),
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          auth.logout();
          toast.show('Sesión expirada. Por favor, inicia sesión de nuevo.');
          break;
        case 403:
          toast.show('No tienes permisos para realizar esta acción.');
          break;
        case 500:
          toast.show('Error del servidor. Inténtalo más tarde.');
          break;
        // 404, 409 y otros los gestiona el componente
      }
      return throwError(() => error);
    })
  );
};
