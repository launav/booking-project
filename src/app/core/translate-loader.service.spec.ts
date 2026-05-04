import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateLoaderService } from './translate-loader.service';

describe('TranslateLoaderService', () => {
  let service: TranslateLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        ...TranslateLoaderService.getProviders(),
      ]
    });
    service = TestBed.inject(TranslateLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getProviders should return a non-empty array', () => {
    const providers = TranslateLoaderService.getProviders();
    expect(Array.isArray(providers)).toBeTrue();
    expect(providers.length).toBeGreaterThan(0);
  });


});
