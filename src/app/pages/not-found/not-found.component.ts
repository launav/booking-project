import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/user/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: '',
})
export class NotFoundComponent {
  constructor() {
    const auth = inject(AuthService);
    const router = inject(Router);
    router.navigate([auth.isAdmin() ? '/admin' : '/home'], { replaceUrl: true });
  }
}
