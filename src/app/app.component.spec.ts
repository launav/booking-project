import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TranslateService } from '@ngx-translate/core';

describe('AppComponent', () => {

  const translateServiceMock = {
    use: jasmine.createSpy('use')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'booking-project' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('booking-project');
  });

  it('should call translate.use on init', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // dispara ngOnInit
    expect(translateServiceMock.use).toHaveBeenCalledWith('es-ES');
  });

});
