import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Pipe, PipeTransform, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ResumeComponent } from './resume.component';
import { BookingContextService } from '../../core/services/user/booking-context.service';

@Pipe({ name: 'translate', standalone: true })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string { return value; }
}

const BASE_ROOM: any = {
  id: 1, id_hotel: 2, name: 'Hotel Test · Hab. 101',
  roomType: 'doble', bedType: 'Cama doble', size: 25,
  basePrice: 100, stars: 4, description: 'Nice room',
  amenities: [], images: [], pricingOptions: [],
  hotelCity: 'Madrid', hotelName: 'Hotel Test',
};

const BASE_OPTION: any = {
  name: 'Alojamiento + Desayuno',
  pricePerNight: 150,
  totalPrice: 300,
};

describe('ResumeComponent', () => {
  let component: ResumeComponent;
  let fixture: ComponentFixture<ResumeComponent>;
  let routerMock: any;

  // Signals reales para que Angular invalide los computed() al cambiarlos
  let selectedRoomSig:   ReturnType<typeof signal<any>>;
  let selectedOptionSig: ReturnType<typeof signal<any>>;
  let checkInSig:        ReturnType<typeof signal<Date | null>>;
  let checkOutSig:       ReturnType<typeof signal<Date | null>>;

  beforeEach(async () => {
    selectedRoomSig   = signal<any>(BASE_ROOM);
    selectedOptionSig = signal<any>(BASE_OPTION);
    checkInSig        = signal<Date | null>(new Date('2025-06-01'));
    checkOutSig       = signal<Date | null>(new Date('2025-06-03'));

    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    };

    const ctxMock = {
      isComplete:     () => true,
      selectedRoom:   selectedRoomSig,
      selectedOption: selectedOptionSig,
      checkIn:        checkInSig,
      checkOut:       checkOutSig,
      nights:         () => 2,
      totalPrice:     () => 300,
      roomCount:      () => 1,
      adults:         () => 2,
      eventName:      () => '',
    };

    await TestBed.configureTestingModule({
      imports: [ResumeComponent, MockTranslatePipe],
      providers: [
        { provide: Router,               useValue: routerMock },
        { provide: BookingContextService, useValue: ctxMock },
      ],
    })
      .overrideComponent(ResumeComponent, {
        remove: { imports: [TranslatePipe] },
        add:    { imports: [MockTranslatePipe] },
      })
      .compileComponents();

    fixture   = TestBed.createComponent(ResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should NOT redirect to /home when booking is complete', () => {
    expect(routerMock.navigate).not.toHaveBeenCalledWith(['/home']);
  });

  // ── booking() ───────────────────────────────────────────────────────────────

  describe('booking()', () => {
    it('returns { room, option } when both exist', () => {
      const b = component.booking();
      expect(b).not.toBeNull();
      expect(b?.room).toEqual(BASE_ROOM);
      expect(b?.option).toEqual(BASE_OPTION);
    });

    it('returns null when room is null', () => {
      selectedRoomSig.set(null);
      expect(component.booking()).toBeNull();
    });

    it('returns null when option is null', () => {
      selectedOptionSig.set(null);
      expect(component.booking()).toBeNull();
    });
  });

  // ── stars() ─────────────────────────────────────────────────────────────────

  describe('stars()', () => {
    it('returns array matching room stars count', () => {
      expect(component.stars().length).toBe(4);
    });

    it('defaults to 5 when stars is undefined', () => {
      selectedRoomSig.set({ ...BASE_ROOM, stars: undefined });
      expect(component.stars().length).toBe(5);
    });
  });

  // ── mealRegime() ────────────────────────────────────────────────────────────

  describe('mealRegime()', () => {
    it('returns Desayuno', () => {
      expect(component.mealRegime()).toBe('Desayuno');
    });

    it('returns Media pensión', () => {
      selectedOptionSig.set({ name: 'Alojamiento + Media pensión', pricePerNight: 190, totalPrice: 380 });
      expect(component.mealRegime()).toBe('Media pensión');
    });

    it('returns Sin régimen for plain Alojamiento', () => {
      selectedOptionSig.set({ name: 'Alojamiento', pricePerNight: 100, totalPrice: 200 });
      expect(component.mealRegime()).toBe('Sin régimen');
    });

    it('returns Sin régimen when option is null', () => {
      selectedOptionSig.set(null);
      expect(component.mealRegime()).toBe('Sin régimen');
    });
  });

  // ── roomLabel() ─────────────────────────────────────────────────────────────

  describe('roomLabel()', () => {
    it('returns "type x count"', () => {
      expect(component.roomLabel()).toBe('doble x 1');
    });
  });

  // ── price & nights ──────────────────────────────────────────────────────────

  it('totalPrice() returns value from context', () => {
    expect(component.totalPrice()).toBe(300);
  });

  it('nights() returns value from context', () => {
    expect(component.nights()).toBe(2);
  });

  // ── date labels ─────────────────────────────────────────────────────────────

  describe('date labels', () => {
    it('checkInLabel() returns a formatted date string', () => {
      expect(component.checkInLabel()).not.toBe('—');
      expect(component.checkInLabel()).toContain('junio');
    });

    it('checkInLabel() returns — when null', () => {
      checkInSig.set(null);
      expect(component.checkInLabel()).toBe('—');
    });

    it('checkOutLabel() returns — when null', () => {
      checkOutSig.set(null);
      expect(component.checkOutLabel()).toBe('—');
    });

    it('hasDates() is true when both dates set', () => {
      expect(component.hasDates()).toBeTrue();
    });

    it('hasDates() is false when checkIn is null', () => {
      checkInSig.set(null);
      expect(component.hasDates()).toBeFalse();
    });
  });

  // ── goBack() ────────────────────────────────────────────────────────────────

  describe('goBack()', () => {
    it('navigates to /room/:id', () => {
      component.goBack();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/room', 1]);
    });

    it('calls history.back() when room is null', () => {
      selectedRoomSig.set(null);
      spyOn(history, 'back');
      component.goBack();
      expect(history.back).toHaveBeenCalled();
    });
  });

  // ── continue() ──────────────────────────────────────────────────────────────

  it('continue() navigates to /payment', () => {
    component.continue();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/payment']);
  });
});
