import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/user/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);

  isRegister = signal(false);
  error      = signal('');

  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    first_name: ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', [Validators.required, Validators.minLength(6)]],
  });

  toggleMode(): void {
    this.isRegister.update(v => !v);
    this.error.set('');
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    // TODO: conectar con this.http.post(`${environment.apiUrl}/auth/login`, ...)
    // Mock: simula login exitoso
    this.authService.login('mock-token', {
      id: 1,
      first_name: this.loginForm.value.email!.split('@')[0],
      email: this.loginForm.value.email!,
    });
    this.router.navigate(['/home']);
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    // TODO: conectar con this.http.post(`${environment.apiUrl}/auth/register`, ...)
    // Mock: simula registro y login automático
    this.authService.login('mock-token', {
      id: 1,
      first_name: this.registerForm.value.first_name!,
      email: this.registerForm.value.email!,
    });
    this.router.navigate(['/home']);
  }
}
