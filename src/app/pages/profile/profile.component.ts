import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/user/auth.service';
import { ToastService } from '../../core/services/loading/toast.service';
import { PreviousRouteService } from '../../core/services/loading/previous-route.service';
import { environment } from '../../../environments/environment';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {

  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private prevRoute = inject(PreviousRouteService);
  private destroyRef = inject(DestroyRef);

  user = computed(() => this.auth.currentUser());
  isAdmin = computed(() => this.auth.isAdmin());

  showPassword = signal(false);
  saving = signal(false);

  togglePassword(): void { this.showPassword.update(v => !v); }

  form = this.fb.group({
    first_name: [this.auth.currentUser()?.first_name ?? '', Validators.required],
    last_name: [this.auth.currentUser()?.last_name ?? '', Validators.required],
    phone: [this.auth.currentUser()?.phone ?? ''],
    password: [''],
  });

  // Navegación
  goBack(): void {
    if (this.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigateByUrl(this.prevRoute.prev());
    }
  }

  // Guardar cambios de perfil

  save(): void {
    if (this.form.invalid || this.saving()) return;
    const userId = this.user()?.id_user;
    if (!userId) return;

    this.saving.set(true);

    const body: Record<string, any> = {
      first_name: this.form.value.first_name,
      last_name: this.form.value.last_name,
      phone: this.form.value.phone || null,
    };
    if (this.form.value.password) {
      body['password'] = this.form.value.password;
    }

    this.http.put(`${environment.apiUrl}/users/${userId}`, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          // Actualiza el usuario en memoria sin forzar nuevo login
          this.auth.saveSession(this.auth.token()!, {
            ...this.user()!,
            first_name: body['first_name'],
            last_name: body['last_name'],
          });
          this.form.get('password')?.setValue('');
          this.toast.show('Perfil actualizado correctamente', 'success');
        },
        error: () => {
          this.saving.set(false);
          this.toast.show('No se pudo actualizar el perfil. Inténtalo de nuevo.');
        },
      });
  }
}
