import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionComponent } from './section.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, ReplaySubject } from 'rxjs';
import { HomeService } from '../../core/services/user/home.service';
import { signal, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CardData } from '../../components/card/model/card.model';

@Pipe({ name: 'translate', standalone: true })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('SectionComponent', () => {
  let component: SectionComponent;
  let fixture: ComponentFixture<SectionComponent>;
  let routerMock: any;
  let homeServiceMock: any;
  let translateServiceMock: any;

  const paramMapSubject = new ReplaySubject(1);
  const queryParamMapSubject = new ReplaySubject(1);

  beforeEach(async () => {
    paramMapSubject.next(
      new (class {
        get(key: string): string | null {
          return key === 'section' ? 'rooms' : null;
        }
      })()
    );

    queryParamMapSubject.next(
      new (class {
        get(key: string): string | null {
          return null;
        }
      })()
    );

    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))
    };

    const mockCards: CardData[] = [
      {
        id: 1,
        title: 'Room 1',
        subtitle: 'Luxury',
        location: 'Madrid',
        capacity: 2,
        rating: 4.5,
        imageUrl: ''
      }
    ];

    homeServiceMock = {
      location: signal('Madrid'),
      getRooms: jasmine.createSpy('getRooms').and.returnValue(of(mockCards)),
      getVisits: jasmine.createSpy('getVisits').and.returnValue(of([]))
    };

    translateServiceMock = {
      instant: jasmine.createSpy('instant').and.callFake((key: string) => {
        const translations: Record<string, string> = {
          'section.titleRooms': 'Habitaciones',
          'section.titleEvents': 'Eventos',
          'section.titleVisits': 'Visitas'
        };
        return translations[key] || key;
      }),
      get: jasmine.createSpy('get').and.callFake((key: string) => {
        const translations: Record<string, string> = {
          'section.titleRooms': 'Habitaciones',
          'section.titleEvents': 'Eventos',
          'section.titleVisits': 'Visitas'
        };
        return of(translations[key] || key);
      }),
      onLangChange: of({}),
      onTranslationChange: of({}),
      onDefaultLanguageChange: of({})
    };

    const activatedRouteMock = {
      paramMap: paramMapSubject.asObservable(),
      queryParamMap: queryParamMapSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [
        SectionComponent,
        MockTranslatePipe
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock },
        { provide: HomeService, useValue: homeServiceMock },
        { provide: TranslateService, useValue: translateServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionComponent);
    component = fixture.componentInstance;
    // No detectChanges aquí - cada test decide si necesita renderizar
  });

  // ─────────────────────────────────────────────

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should load rooms on init when section is rooms', () => {
      component.ngOnInit();
      expect(homeServiceMock.getRooms).toHaveBeenCalledWith(50, {
        destination: '',
        travelers: 0,
        checkIn: null,
        checkOut: null
      });
    });

    it('should set section and filters from route params', (done) => {
      component.ngOnInit();
      setTimeout(() => {
        expect(component.section()).toBe('rooms');
        expect(component.filters().destination).toBe('');
        expect(component.filters().travelers).toBe(0);
        done();
      }, 100);
    });
  });

  // ─────────────────────────────────────────────

  describe('clearFilters', () => {
    it('should navigate with relativeTo and empty query params', () => {
      component.clearFilters();

      expect(routerMock.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParams: {},
          replaceUrl: true
        })
      );
    });
  });

  // ─────────────────────────────────────────────

  describe('computed properties', () => {
    it('should compute title correctly', () => {
      component.section.set('rooms');
      component.filters.set({
        destination: 'madrid',
        travelers: 0,
        checkIn: null,
        checkOut: null
      });

      const title = component.title();
      // Title uses the computed value, which calls translate.instant()
      expect(title).toBeDefined();
      expect(title).toContain('Madrid');
    });

    it('should filter cards by destination', () => {
      component.allCards.set([
        {
          id: 1,
          title: 'Room Madrid',
          subtitle: 'Luxury',
          location: 'Madrid',
          capacity: 2,
          rating: 4.5,
          imageUrl: ''
        },
        {
          id: 2,
          title: 'Room Barcelona',
          subtitle: 'Budget',
          location: 'Barcelona',
          capacity: 1,
          rating: 3.8,
          imageUrl: ''
        }
      ]);

      component.filters.set({
        destination: 'madrid',
        travelers: 0,
        checkIn: null,
        checkOut: null
      });

      expect(component.cards().length).toBe(1);
      expect(component.cards()[0].id).toBe(1);
    });

    it('should filter cards by travelers capacity', () => {
      component.allCards.set([
        {
          id: 1,
          title: 'Room 1',
          subtitle: 'Luxury',
          location: 'Madrid',
          capacity: 4,
          rating: 4.5,
          imageUrl: ''
        },
        {
          id: 2,
          title: 'Room 2',
          subtitle: 'Budget',
          location: 'Madrid',
          capacity: 1,
          rating: 3.0,
          imageUrl: ''
        }
      ]);

      component.filters.set({
        destination: '',
        travelers: 2,
        checkIn: null,
        checkOut: null
      });

      expect(component.cards().length).toBe(1);
      expect(component.cards()[0].capacity).toBe(4);
    });

    it('should have hasFilters true when filters are set', () => {
      component.filters.set({
        destination: '',
        travelers: 2,
        checkIn: null,
        checkOut: null
      });

      expect(component.hasFilters()).toBe(true);
    });

    it('should have hasFilters false when no filters are set', () => {
      component.filters.set({
        destination: '',
        travelers: 0,
        checkIn: null,
        checkOut: null
      });

      expect(component.hasFilters()).toBe(false);
    });
  });

});
