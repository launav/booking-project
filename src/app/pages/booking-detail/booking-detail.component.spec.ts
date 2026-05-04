import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Component, Pipe, PipeTransform, signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DateRangePickerComponent } from '../../components/date-range-picker/date-range-picker.component';

import { BookingDetailComponent } from './booking-detail.component';
import { HomeService } from '../../core/services/user/home.service';
import { RoomService } from '../../core/services/user/room.service';
import { BookingContextService } from '../../core/services/user/booking-context.service';

@Pipe({ name: 'translate', standalone: true })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string { return value; }
}

@Component({ selector: 'app-date-range-picker', standalone: true, template: '' })
class MockDateRangePickerComponent {}

describe('BookingDetailComponent', () => {
  let component: BookingDetailComponent;
  let fixture: ComponentFixture<BookingDetailComponent>;
  let routerMock: any;
  let roomServiceMock: any;
  let ctxMock: any;

  // Signals reales para checkIn / checkOut porque el efecto los trackea
  const checkInSig  = signal<Date | null>(null);
  const checkOutSig = signal<Date | null>(null);

  const mockApiRoom = {
    id_room: 1, id_hotel: 2, room_number: '101', type: 'doble',
    capacity: 2, price_per_night: 120, status: 'available',
    description: 'Nice room', hotel_name: 'Hotel Test', hotel_city: 'Madrid',
  };

  const mockHotel = {
    id_hotel: 2, name: 'Hotel Test', address: 'Calle 1',
    city: 'Madrid', phone: null, email: null, description: null,
  };

  const translateServiceMock = {
    instant: jasmine.createSpy('instant').and.callFake((k: string) => k),
    get:     jasmine.createSpy('get').and.callFake((k: string) => of(k)),
    onLangChange:           of({}),
    onTranslationChange:    of({}),
    onDefaultLanguageChange: of({}),
    use: jasmine.createSpy('use'),
  };

  beforeEach(async () => {
    // Resetea los signals antes de cada test
    checkInSig.set(null);
    checkOutSig.set(null);

    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    };

    roomServiceMock = {
      getRoomDetail: jasmine.createSpy('getRoomDetail').and.returnValue(of({
        room:   mockApiRoom,
        images: ['https://example.com/img1.jpg'],
        hotel:  mockHotel,
      })),
      checkAvailability: jasmine.createSpy('checkAvailability').and.returnValue(
        of({ available: true })
      ),
    };

    ctxMock = {
      checkIn:      checkInSig,
      checkOut:     checkOutSig,
      nights:       () => 0,
      setContext:   jasmine.createSpy('setContext'),
      setSelection: jasmine.createSpy('setSelection'),
    };

    await TestBed.configureTestingModule({
      imports: [BookingDetailComponent, MockTranslatePipe],
      providers: [
        { provide: Router,               useValue: routerMock },
        { provide: ActivatedRoute,       useValue: {
            paramMap:      of(convertToParamMap({ id: '1' })),
            queryParamMap: of(convertToParamMap({})),
          }
        },
        { provide: HomeService,          useValue: { location: signal('') } },
        { provide: RoomService,          useValue: roomServiceMock },
        { provide: BookingContextService, useValue: ctxMock },
        { provide: TranslateService,     useValue: translateServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(BookingDetailComponent, {
        remove: { imports: [TranslatePipe, DateRangePickerComponent] },
        add:    { imports: [MockTranslatePipe, MockDateRangePickerComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BookingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Creación ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── ngOnInit ────────────────────────────────────────────────────────────────

  it('should call getRoomDetail with the route id on init', () => {
    expect(roomServiceMock.getRoomDetail).toHaveBeenCalledWith(1);
  });

  it('should set room data and turn off loading after init', () => {
    expect(component.room()).not.toBeNull();
    expect(component.room()?.id).toBe(1);
    expect(component.loading()).toBeFalse();
  });

  // ── selectOption / isSelected ───────────────────────────────────────────────

  describe('selectOption() / isSelected()', () => {
    const opt = { name: 'Alojamiento', pricePerNight: 120, totalPrice: 480 };

    it('selects an option', () => {
      component.selectOption(opt);
      expect(component.selectedOption()).toEqual(opt);
    });

    it('isSelected returns true for the selected option', () => {
      component.selectOption(opt);
      expect(component.isSelected(opt)).toBeTrue();
    });

    it('isSelected returns false for a different option', () => {
      const other = { name: 'Alojamiento + Desayuno', pricePerNight: 170, totalPrice: 680 };
      component.selectOption(opt);
      expect(component.isSelected(other)).toBeFalse();
    });
  });

  // ── canContinue ─────────────────────────────────────────────────────────────

  describe('canContinue', () => {
    it('is false when no option and no dates', () => {
      expect(component.canContinue()).toBeFalse();
    });

    it('is false when option selected but no dates', () => {
      component.selectOption({ name: 'Alojamiento', pricePerNight: 120, totalPrice: 480 });
      expect(component.canContinue()).toBeFalse();
    });
  });

  // ── continue() ──────────────────────────────────────────────────────────────

  describe('continue()', () => {
    it('does nothing when no option or dates', () => {
      component.continue();
      expect(ctxMock.setSelection).not.toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('calls setSelection and navigates to /resume when conditions met', () => {
      const opt = { name: 'Alojamiento', pricePerNight: 120, totalPrice: 480 };
      component.selectOption(opt);
      checkInSig.set(new Date('2025-06-01'));
      checkOutSig.set(new Date('2025-06-03'));
      fixture.detectChanges();

      component.continue();

      expect(ctxMock.setSelection).toHaveBeenCalledWith(component.room(), opt);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/resume']);
    });
  });

  // ── Navegación de imágenes ──────────────────────────────────────────────────

  describe('image navigation', () => {
    it('nextImage wraps around with a single image', () => {
      expect(component.imageIndex()).toBe(0);
      component.nextImage();
      expect(component.imageIndex()).toBe(0); // 1 imagen → vuelve a 0
    });

    it('prevImage wraps around with a single image', () => {
      component.prevImage();
      expect(component.imageIndex()).toBe(0);
    });
  });

  // ── Lightbox ────────────────────────────────────────────────────────────────

  describe('lightbox', () => {
    it('opens lightbox with the correct index', () => {
      component.openLightbox(0);
      expect(component.lightboxOpen()).toBeTrue();
      expect(component.lightboxIndex()).toBe(0);
    });

    it('closes lightbox', () => {
      component.openLightbox(0);
      component.closeLightbox();
      expect(component.lightboxOpen()).toBeFalse();
    });
  });

  // ── toggleCalendar ──────────────────────────────────────────────────────────

  describe('toggleCalendar()', () => {
    it('toggles calendarOpen', () => {
      expect(component.calendarOpen()).toBeFalse();
      component.toggleCalendar();
      expect(component.calendarOpen()).toBeTrue();
      component.toggleCalendar();
      expect(component.calendarOpen()).toBeFalse();
    });
  });

  // ── datesLabel ──────────────────────────────────────────────────────────────

  describe('datesLabel', () => {
    it('returns placeholder when no checkIn', () => {
      expect(component.datesLabel()).toBe('Añade las fechas de tu estancia');
    });

    it('returns formatted label when checkIn is set', () => {
      checkInSig.set(new Date('2025-06-01'));
      fixture.detectChanges();
      expect(component.datesLabel()).not.toBe('Añade las fechas de tu estancia');
    });
  });
});
