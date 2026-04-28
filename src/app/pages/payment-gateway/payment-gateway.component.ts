import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

export type PaymentMethod = 'tarjeta' | 'paypal' | 'googlepay' | '';

@Component({
  selector: 'app-payment-gateway',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-gateway.component.html',
  styleUrl: './payment-gateway.component.scss'
})
export class PaymentGatewayComponent implements OnInit {

  private fb     = inject(FormBuilder);
  private router = inject(Router);

  // ── Formulario ────────────────────────────────────────────────
  form = this.fb.group({
    nombre:          ['', Validators.required],
    apellido:        ['', Validators.required],
    segundoApellido: [''],
    direccion:       ['', Validators.required],
    pais:            ['', Validators.required],
    ciudad:          ['', Validators.required],
    codigoPostal:    ['', [Validators.required, Validators.pattern(/^\d{4,10}$/)]],
    email:           ['', [Validators.required, Validators.email]],
    telefono:        ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{7,15}$/)]],
    mismaDireccion:  [false],
  });

  // Mapea el estado del form a boolean y lo convierte a signal (Angular 19)
  formValid = toSignal(
    this.form.statusChanges.pipe(map(status => status === 'VALID')),
    { initialValue: false }
  );

  // ── Pago ──────────────────────────────────────────────────────
  paymentMethod = signal<PaymentMethod>('');
  totalPrice    = signal<number>(0);

  canContinue = computed(() => (this.formValid() ?? false) && this.paymentMethod() !== '');

  // ── Datos de los selects ──────────────────────────────────────
  readonly paises = [
    'España', 'México', 'Argentina', 'Colombia', 'Chile',
    'Perú', 'Francia', 'Alemania', 'Italia', 'Portugal',
  ];

  readonly ciudades: Record<string, string[]> = {
    'España':    ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'],
    'México':    ['Ciudad de México', 'Guadalajara', 'Monterrey'],
    'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario'],
    'Colombia':  ['Bogotá', 'Medellín', 'Cali'],
    'Chile':     ['Santiago', 'Valparaíso', 'Concepción'],
    'Perú':      ['Lima', 'Arequipa', 'Trujillo'],
    'Francia':   ['París', 'Marsella', 'Lyon'],
    'Alemania':  ['Berlín', 'Múnich', 'Hamburgo'],
    'Italia':    ['Roma', 'Milán', 'Nápoles'],
    'Portugal':  ['Lisboa', 'Oporto', 'Braga'],
  };

  get ciudadesList(): string[] {
    return this.ciudades[this.form.get('pais')?.value ?? ''] ?? [];
  }

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    const raw = sessionStorage.getItem('selectedOption');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        this.totalPrice.set(data.option?.totalPrice ?? 0);
      } catch { /* noop */ }
    }
  }

  // ── Acciones ──────────────────────────────────────────────────
  onPaisChange(): void {
    this.form.get('ciudad')?.setValue('');
  }

  selectPayment(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  continue(): void {
    if (!this.canContinue()) return;
    sessionStorage.setItem('bookingForm', JSON.stringify(this.form.value));
    this.router.navigate(['/success']);
  }
}
