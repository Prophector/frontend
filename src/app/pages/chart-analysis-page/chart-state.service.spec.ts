import { TestBed } from '@angular/core/testing';

import { ChartStateService } from './chart-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ChartStateService', () => {
  let service: ChartStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChartStateService],
    });
    service = TestBed.inject(ChartStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
