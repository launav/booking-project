import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuccessComponent } from './success.component';
import { BookingContextService } from '../../core/services/user/booking-context.service';
import { Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { signal, computed, Pipe, PipeTransform } from '@angular/core';
import { of } from 'rxjs';

@Pipe({ name: 'translate', standalone: true })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('SuccessComponent', () => {
  let component: SuccessComponent;
  let fixture: ComponentFixture<SuccessComponent>;
  let routerMock: any;
  let bookingContextMock: any;

  beforeEach(async () => {
    // Signals para el mock
    const selectedRoomSignal = signal({
      id: 1,
      name: 'Room Test',
      roomType: 'Double',
      bedType: 'King',
      size: 30,
      basePrice: 100,
      stars: 5,
      description: 'Luxury room in Madrid',
      amenities: [],
      images: [],
      pricingOptions: [],
      hotelCity: 'Madrid',
      hotelName: 'Hotel Test'
    });

    const selectedOptionSignal = signal({
      name: 'Option 1',
      pricePerNight: 150,
      totalPrice: 300
    });

    const reservationIdSignal = signal<number | null>(123);
    const totalPriceSignal = signal(300);
    const nightsSignal = signal(2);
    const checkInSignal = signal<Date | null>(new Date('2025-01-15'));
    const checkOutSignal = signal<Date | null>(new Date('2025-01-17'));

    bookingContextMock = {
      selectedRoom: () => selectedRoomSignal(),
      selectedOption: () => selectedOptionSignal(),
      reservationId: () => reservationIdSignal(),
      totalPrice: () => totalPriceSignal(),
      nights: () => nightsSignal(),
      checkIn: () => checkInSignal(),
      checkOut: () => checkOutSignal(),
      clear: jasmine.createSpy('clear')
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))
    };

    const translateServiceMock = {
      instant: jasmine.createSpy('instant').and.callFake((key: string) => key),
      get: jasmine.createSpy('get').and.returnValue(of('')),
      use: jasmine.createSpy('use')
    };

    await TestBed.configureTestingModule({
      imports: [
        SuccessComponent,
        MockTranslatePipe
      ],
      providers: [
        { provide: BookingContextService, useValue: bookingContextMock },
        { provide: Router, useValue: routerMock },
        { provide: TranslateService, useValue: translateServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessComponent);
    component = fixture.componentInstance;
  });

  // ─────────────────────────────────────────────

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────

  describe('computed properties', () => {
    it('should get room from context', () => {
      const room = component.room();
      expect(room).toBeDefined();
      expect(room?.name).toBe('Room Test');
    });

    it('should get option from context', () => {
      const option = component.option();
      expect(option).toBeDefined();
      expect(option?.name).toBe('Option 1');
    });

    it('should get reservationId from context', () => {
      expect(component.reservationId()).toBe(123);
    });

    it('should get totalPrice from context', () => {
      expect(component.totalPrice()).toBe(300);
    });

    it('should get nights from context', () => {
      expect(component.nights()).toBe(2);
    });

    it('should format check-in date correctly', () => {
      const label = component.checkInLabel();
      expect(label).toContain('2025');
      expect(label).toContain('15');
    });

    it('should format check-out date correctly', () => {
      const label = component.checkOutLabel();
      expect(label).toContain('2025');
      expect(label).toContain('17');
    });

    it('should return dash if check-in is null', () => {
      bookingContextMock.checkIn = () => null;
      expect(component.checkInLabel()).toBe('—');
    });

    it('should return dash if check-out is null', () => {
      bookingContextMock.checkOut = () => null;
      expect(component.checkOutLabel()).toBe('—');
    });
  });

  // ─────────────────────────────────────────────

  describe('goHome', () => {
    it('should clear context and navigate to home', () => {
      component.goHome();

      expect(bookingContextMock.clear).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

});
