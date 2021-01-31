import { TestBed } from '@angular/core/testing';

import { TimeseriesApiService } from './timeseries-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TimeseriesApiService', () => {
  let service: TimeseriesApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(TimeseriesApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
