import { Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { BookingService } from '../../core/services/user/booking.service';
import { BookingContextService } from '../../core/services/user/booking-context.service';
import { ToastService } from '../../core/services/loading/toast.service';

export type PaymentMethod = 'tarjeta' | 'paypal' | 'googlepay' | '';

@Component({
  selector: 'app-payment-gateway',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-gateway.component.html',
  styleUrl: './payment-gateway.component.scss'
})
export class PaymentGatewayComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private ctx = inject(BookingContextService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    segundoApellido: [''],
    direccion: ['', Validators.required],
    pais: ['', Validators.required],
    ciudad: ['', Validators.required],
    codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{4,10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{7,15}$/)]],
    mismaDireccion: [false],
  });

  formValid = toSignal(
    this.form.statusChanges.pipe(map(s => s === 'VALID')),
    { initialValue: false }
  );

  paymentMethod = signal<PaymentMethod>('');
  totalPrice = computed(() => this.ctx.totalPrice());
  submitting = signal(false);

  canContinue = computed(() => this.formValid() && this.paymentMethod() !== '');

  readonly paises = [
    'España', 'México', 'Argentina', 'Colombia', 'Chile',
    'Perú', 'Francia', 'Alemania', 'Italia', 'Portugal',
  ];

  readonly ciudades: Record<string, string[]> = {
    'España': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao','Cádiz'],
    'México': ['Ciudad de México', 'Guadalajara', 'Monterrey'],
    'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario'],
    'Colombia': ['Bogotá', 'Medellín', 'Cali'],
    'Chile': ['Santiago', 'Valparaíso', 'Concepción'],
    'Perú': ['Lima', 'Arequipa', 'Trujillo'],
    'Francia': ['París', 'Marsella', 'Lyon'],
    'Alemania': ['Berlín', 'Múnich', 'Hamburgo'],
    'Italia': ['Roma', 'Milán', 'Nápoles'],
    'Portugal': ['Lisboa', 'Oporto', 'Braga'],
  };

  get ciudadesList(): string[] {
    return this.ciudades[this.form.get('pais')?.value ?? ''] ?? [];
  }

  // Lifecycle
  ngOnInit(): void {
    if (!this.ctx.isComplete()) {
      this.router.navigate(['/home']);
    }
  }

  // Acciones

  onPaisChange(): void { this.form.get('ciudad')?.setValue(''); }

  selectPayment(method: PaymentMethod): void { this.paymentMethod.set(method); }

  continue(): void {
    if (!this.canContinue() || this.submitting()) return;

    const room = this.ctx.selectedRoom();
    const checkIn = this.ctx.checkIn()?.toISOString().split('T')[0] ?? null;
    const checkOut = this.ctx.checkOut()?.toISOString().split('T')[0] ?? null;

    if (!room || !checkIn || !checkOut) {
      this.toast.show('Debes seleccionar fechas de entrada y salida para continuar.');
      return;
    }

    this.submitting.set(true);

    this.bookingService.createBooking({
      id_room: room.id,
      id_hotel: room.id_hotel,
      check_in_date: checkIn,
      check_out_date: checkOut,
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.ctx.setReservationId(res.id_reservation);
          this.submitting.set(false);
          this.router.navigate(['/success']);
        },
        error: () => {
          this.submitting.set(false);
          // El interceptor muestra el modal de error para 4xx/5xx
        },
      });
  }
}
