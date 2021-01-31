import { TestBed } from '@angular/core/testing';

import { CountryApiService } from './country-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CountryApiService', () => {
  let service: CountryApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CountryApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
