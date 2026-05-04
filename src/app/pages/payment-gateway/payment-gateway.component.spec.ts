import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';

import { PaymentGatewayComponent } from './payment-gateway.component';
import { BookingContextService } from '../../core/services/user/booking-context.service';
import { BookingService } from '../../core/services/user/booking.service';
import { ToastService } from '../../core/services/loading/toast.service';

@Pipe({ name: 'translate', standalone: true })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string { return value; }
}

const mockRoom: any = {
  id: 1, id_hotel: 2, name: 'Room Test', roomType: 'doble',
  bedType: 'Cama doble', size: 25, basePrice: 100, stars: 4,
  description: 'Test room', amenities: [], images: [], pricingOptions: [],
};

const translateServiceMock = {
  instant: jasmine.createSpy('instant').and.callFake((k: string) => k),
  get: jasmine.createSpy('get').and.returnValue(of('')),
  onLangChange: of({}),
  onTranslationChange: of({}),
  onDefaultLanguageChange: of({}),
};

describe('PaymentGatewayComponent', () => {
  let component: PaymentGatewayComponent;
  let fixture: ComponentFixture<PaymentGatewayComponent>;
  let routerMock: any;
  let bookingServiceMock: any;
  let ctxMock: any;
  let toastMock: any;

  async function setup(isComplete = true): Promise<void> {
    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    };

    ctxMock = {
      isComplete:       () => isComplete,
      totalPrice:       () => 300,
      selectedRoom:     () => mockRoom,
      checkIn:          () => new Date('2025-06-01'),
      checkOut:         () => new Date('2025-06-03'),
      setContext:       jasmine.createSpy('setContext'),
      setReservationId: jasmine.createSpy('setReservationId'),
    };

    bookingServiceMock = {
      createBooking: jasmine.createSpy('createBooking').and.returnValue(
        of({ id_reservation: 42 })
      ),
    };

    toastMock = { show: jasmine.createSpy('show') };

    await TestBed.configureTestingModule({
      imports: [PaymentGatewayComponent, MockTranslatePipe],
      providers: [
        { provide: Router,                useValue: routerMock },
        { provide: BookingContextService, useValue: ctxMock },
        { provide: BookingService,        useValue: bookingServiceMock },
        { provide: ToastService,          useValue: toastMock },
        { provide: TranslateService,      useValue: translateServiceMock },
      ],
    })
      .overrideComponent(PaymentGatewayComponent, {
        remove: { imports: [TranslatePipe] },
        add:    { imports: [MockTranslatePipe] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PaymentGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await setup(true);
  });

  // ── Creación e init ─────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should NOT redirect when isComplete is true', () => {
    expect(routerMock.navigate).not.toHaveBeenCalledWith(['/home']);
  });

  // ── selectPayment() ─────────────────────────────────────────────────────────

  describe('selectPayment()', () => {
    it('sets paymentMethod to tarjeta', () => {
      component.selectPayment('tarjeta');
      expect(component.paymentMethod()).toBe('tarjeta');
    });

    it('sets paymentMethod to paypal', () => {
      component.selectPayment('paypal');
      expect(component.paymentMethod()).toBe('paypal');
    });

    it('clears paymentMethod when set to empty string', () => {
      component.selectPayment('tarjeta');
      component.selectPayment('');
      expect(component.paymentMethod()).toBe('');
    });
  });

  // ── canContinue ─────────────────────────────────────────────────────────────

  describe('canContinue', () => {
    it('is false when form invalid and no payment method', () => {
      expect(component.canContinue()).toBeFalse();
    });

    it('is false when payment selected but form still invalid', () => {
      component.selectPayment('tarjeta');
      expect(component.canContinue()).toBeFalse();
    });

    it('is true when form is valid and payment method selected', () => {
      fillValidForm();
      component.selectPayment('tarjeta');
      expect(component.canContinue()).toBeTrue();
    });
  });

  // ── isInvalid() ─────────────────────────────────────────────────────────────

  describe('isInvalid()', () => {
    it('returns false for untouched required field', () => {
      expect(component.isInvalid('nombre')).toBeFalse();
    });

    it('returns true when required field is touched and empty', () => {
      component.form.get('nombre')!.markAsTouched();
      expect(component.isInvalid('nombre')).toBeTrue();
    });

    it('returns false when field is valid and touched', () => {
      component.form.get('nombre')!.setValue('Ana');
      component.form.get('nombre')!.markAsTouched();
      expect(component.isInvalid('nombre')).toBeFalse();
    });

    it('returns true for invalid email format', () => {
      component.form.get('email')!.setValue('not-an-email');
      component.form.get('email')!.markAsTouched();
      expect(component.isInvalid('email')).toBeTrue();
    });
  });

  // ── totalPrice ──────────────────────────────────────────────────────────────

  describe('totalPrice', () => {
    it('returns totalPrice from context', () => {
      expect(component.totalPrice()).toBe(300);
    });
  });

  // ── continue() ──────────────────────────────────────────────────────────────

  describe('continue()', () => {
    it('marks all fields as touched when form is invalid', () => {
      spyOn(component.form, 'markAllAsTouched').and.callThrough();
      component.continue();
      expect(component.form.markAllAsTouched).toHaveBeenCalled();
    });

    it('does NOT call createBooking when form is invalid', () => {
      component.continue();
      expect(bookingServiceMock.createBooking).not.toHaveBeenCalled();
    });

    it('does NOT call createBooking when form valid but no payment method', () => {
      fillValidForm();
      // paymentMethod still ''
      component.continue();
      expect(bookingServiceMock.createBooking).not.toHaveBeenCalled();
    });

    it('calls createBooking with correct payload when canContinue', () => {
      fillValidForm();
      component.selectPayment('tarjeta');

      component.continue();

      expect(bookingServiceMock.createBooking).toHaveBeenCalledWith({
        id_room:        1,
        id_hotel:       2,
        check_in_date:  '2025-06-01',
        check_out_date: '2025-06-03',
      });
    });

    it('sets reservationId and navigates to /success on successful booking', () => {
      fillValidForm();
      component.selectPayment('tarjeta');

      component.continue();

      expect(ctxMock.setReservationId).toHaveBeenCalledWith(42);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/success']);
    });

    it('resets submitting flag after success', () => {
      fillValidForm();
      component.selectPayment('tarjeta');
      component.continue();
      expect(component.submitting()).toBeFalse();
    });

    it('shows toast and redirects to room on 409 conflict', () => {
      fillValidForm();
      component.selectPayment('tarjeta');
      bookingServiceMock.createBooking.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 409, statusText: 'Conflict' }))
      );

      component.continue();

      expect(toastMock.show).toHaveBeenCalled();
      expect(ctxMock.setContext).toHaveBeenCalledWith({ checkIn: null, checkOut: null });
      expect(routerMock.navigate).toHaveBeenCalledWith(['/room', 1]);
    });

    it('resets submitting flag after error', () => {
      fillValidForm();
      component.selectPayment('tarjeta');
      bookingServiceMock.createBooking.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 409, statusText: 'Conflict' }))
      );

      component.continue();

      expect(component.submitting()).toBeFalse();
    });

    it('shows toast when dates or room are missing', () => {
      ctxMock.selectedRoom = () => null;
      fillValidForm();
      component.selectPayment('tarjeta');

      component.continue();

      expect(toastMock.show).toHaveBeenCalled();
      expect(bookingServiceMock.createBooking).not.toHaveBeenCalled();
    });
  });

  // ── Helper ──────────────────────────────────────────────────────────────────

  function fillValidForm(): void {
    component.form.setValue({
      nombre:          'Ana',
      apellido:        'García',
      segundoApellido: '',
      direccion:       'Calle Falsa 123',
      pais:            'España',
      ciudad:          'Madrid',
      codigoPostal:    '28001',
      email:           'ana@test.com',
      telefono:        '+34612345678',
      mismaDireccion:  false,
    });
  }
});
