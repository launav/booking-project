import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'translate', standalone: true })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string { return value; }
}

import { AdminComponent } from './admin.component';
import { ToastService } from '../../core/services/loading/toast.service';
import { RoomsService } from '../../core/services/admin/rooms.service';
import { UsersService } from '../../core/services/admin/users.service';
import { BookingsService } from '../../core/services/admin/bookings.service';
import { HotelService } from '../../core/services/admin/hotel.service';
import { ImageService } from '../../core/services/admin/image.service';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let toastMock: any;
  let roomsServiceMock: any;
  let usersServiceMock: any;
  let bookingsServiceMock: any;
  let hotelsServiceMock: any;
  let imageServiceMock: any;

  beforeEach(async () => {
    toastMock = {
      show: jasmine.createSpy('show')
    };

    roomsServiceMock = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })),
      create: jasmine.createSpy('create').and.returnValue(of({ id_room: 1 })),
      update: jasmine.createSpy('update').and.returnValue(of({})),
      delete: jasmine.createSpy('delete').and.returnValue(of({})),
    };

    usersServiceMock = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })),
      delete: jasmine.createSpy('delete').and.returnValue(of({}))
    };

    bookingsServiceMock = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })),
      delete: jasmine.createSpy('delete').and.returnValue(of({}))
    };

    hotelsServiceMock = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })),
      getAllForSelect: jasmine.createSpy('getAllForSelect').and.returnValue(of({ data: [] })),
      create: jasmine.createSpy('create').and.returnValue(of({ id_hotel: 1 })),
      update: jasmine.createSpy('update').and.returnValue(of({})),
      delete: jasmine.createSpy('delete').and.returnValue(of({}))
    };

    imageServiceMock = {
      saveUrl: jasmine.createSpy('saveUrl').and.returnValue(of({}))
    };

    const translateServiceMock = {
      instant: jasmine.createSpy('instant').and.callFake((key: string) => key),
      get: jasmine.createSpy('get').and.callFake((key: string) => of(key)),
      onLangChange: of({}),
      onTranslationChange: of({}),
      onDefaultLanguageChange: of({}),
      use: jasmine.createSpy('use')
    };

    await TestBed.configureTestingModule({
      imports: [AdminComponent, MockTranslatePipe],
      providers: [
        { provide: ToastService, useValue: toastMock },
        { provide: RoomsService, useValue: roomsServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: BookingsService, useValue: bookingsServiceMock },
        { provide: HotelService, useValue: hotelsServiceMock },
        { provide: ImageService, useValue: imageServiceMock },
        { provide: TranslateService, useValue: translateServiceMock }
      ]
    })
      .overrideComponent(AdminComponent, {
        remove: { imports: [TranslatePipe] },
        add:    { imports: [MockTranslatePipe] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load hoteles list on init', () => {
    expect(hotelsServiceMock.getAllForSelect).toHaveBeenCalled();
    expect(component.hotelsList()).toEqual([]);
  });

  it('should format date and return dash for invalid values', () => {
    expect(component.formatDate('2025-05-01')).toBe('01/05/2025');
    expect(component.formatDate('')).toBe('—');
    expect(component.formatDate('invalid')).toBe('invalid');
  });

  it('should return hotel name by id or dash if not found', () => {
    component.hotelsList.set([{ id_hotel: 5, name: 'Hotel A', address: '', city: '', phone: '', email: '', description: '' }]);
    expect(component.hotelNameById(5)).toBe('Hotel A');
    expect(component.hotelNameById(10)).toBe('—');
  });

  it('should add and remove image urls', () => {
    component.imageUrls.set(['one']);
    component.addImageUrl();
    expect(component.imageUrls()).toEqual(['one', '']);

    component.removeImageUrl(0);
    expect(component.imageUrls()).toEqual(['']);
  });

  it('should select tab and reset page', () => {
    component.page.set(3);
    component.selectTab('usuarios');

    expect(component.activeTab()).toBe('usuarios');
    expect(component.page()).toBe(1);
    expect(component.confirmDeleteId()).toBeNull();
    expect(usersServiceMock.getAll).toHaveBeenCalledWith(1, 10);
  });
});
