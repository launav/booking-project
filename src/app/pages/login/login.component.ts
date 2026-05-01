import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/user/auth.service';

const REMEMBER_KEY = 'rememberedEmail';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isRegister = signal(false);
  error = signal('');
  loading = signal(false);

  // Visibilidad de contraseña
  showLoginPwd = signal(false);
  showRegisterPwd = signal(false);

  // Recordar email
  rememberEmail = signal(!!localStorage.getItem(REMEMBER_KEY));

  loginForm = this.fb.group({
    email: [localStorage.getItem(REMEMBER_KEY) ?? '', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  toggleMode(): void {
    this.isRegister.update(v => !v);
    this.error.set('');
  }

  toggleRemember(): void { this.rememberEmail.update(v => !v); }
  toggleLoginPwd(): void { this.showLoginPwd.update(v => !v); }
  toggleRegisterPwd(): void { this.showRegisterPwd.update(v => !v); }

  onLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }

    this.error.set('');
    this.loading.set(true);

    const { email, password } = this.loginForm.value;

    // Guardar / borrar email recordado
    if (this.rememberEmail()) {
      localStorage.setItem(REMEMBER_KEY, email!);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    this.authService
      .login$({ email: email!, password: password! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate([this.authService.isAdmin() ? '/admin' : '/home']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.status === 401
              ? 'Email o contraseña incorrectos'
              : (err.error?.message ?? 'Error al iniciar sesión')
          );
        },
      });
  }

  onRegister(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }

    this.error.set('');
    this.loading.set(true);

    const { first_name, last_name, email, password } = this.registerForm.value;

    this.authService
      .register$({ first_name: first_name!, last_name: last_name!, email: email!, password: password! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.authService
            .login$({ email: email!, password: password! })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.loading.set(false);
                this.router.navigate([this.authService.isAdmin() ? '/admin' : '/home']);
              },
              error: () => {
                this.loading.set(false);
                this.isRegister.set(false);
                this.error.set('Cuenta creada. Por favor inicia sesión.');
              },
            });
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.status === 409
              ? 'Ya existe una cuenta con ese email'
              : (err.error?.message ?? 'Error al crear la cuenta')
          );
        },
      });
  }
}
