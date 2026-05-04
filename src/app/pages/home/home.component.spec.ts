import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { signal, Pipe, PipeTransform } from '@angular/core';

import { HomeComponent } from './home.component';
import { HomeService } from '../../core/services/user/home.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CardData } from '../../components/card/model/card.model';
import { CarouselItem } from '../../components/carousel/carousel.component';

@Pipe({ name: 'translate', standalone: true })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let homeServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    homeServiceMock = {
      location: signal('Madrid'),
      getRooms: jasmine.createSpy('getRooms').and.returnValue(of([{
        id: 1,
        title: 'Room 1',
        subtitle: 'Habitación prueba',
        location: 'Madrid',
        rating: 4.5,
        imageUrl: ''
      } as CardData])),
      getHotels: jasmine.createSpy('getHotels').and.returnValue(of([{
        id: 10,
        title: 'Hotel Test',
        subtitle: 'Centro',
        location: 'Madrid',
        rating: 5,
        imageUrl: ''
      } as CardData])),
      getVisits: jasmine.createSpy('getVisits').and.returnValue(of([{
        id: 1,
        title: 'Visita 1',
        description: 'Descripción',
        imageUrl: '',
        linkText: 'Ver',
        linkUrl: '#'
      } as CarouselItem]))
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent, MockTranslatePipe],
      providers: [
        { provide: HomeService, useValue: homeServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    })
    .overrideComponent(HomeComponent, {
      remove: {
        imports: [TranslatePipe]
      },
      add: {
        imports: [MockTranslatePipe]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load rooms, hotels and visits on init', () => {
    component.ngOnInit();

    expect(homeServiceMock.getRooms).toHaveBeenCalledWith(4, {
      destination: 'Madrid',
      travelers: 0,
      checkIn: null,
      checkOut: null
    });
    expect(homeServiceMock.getHotels).toHaveBeenCalledWith(4);
    expect(homeServiceMock.getVisits).toHaveBeenCalled();

    expect(component.rooms().length).toBe(1);
    expect(component.hotels().length).toBe(1);
    expect(component.visits().length).toBe(1);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('');
  });

  it('should navigate to section', () => {
    component.goToSection('rooms');
    expect(routerMock.navigate).toHaveBeenCalledWith(['rooms']);
  });

  it('should navigate to room when card is clicked', () => {
    component.onCardClick(42);
    expect(routerMock.navigate).toHaveBeenCalledWith(['room', 42]);
  });

  it('should navigate to hotel when hotel is clicked', () => {
    component.onHotelClick(99);
    expect(routerMock.navigate).toHaveBeenCalledWith(['hotel', 99]);
  });
});
