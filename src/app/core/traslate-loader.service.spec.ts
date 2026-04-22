import { TestBed } from '@angular/core/testing';

import { TraslateLoaderService } from './traslate-loader.service';

describe('TraslateLoaderService', () => {
  let service: TraslateLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TraslateLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
