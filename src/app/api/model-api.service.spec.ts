import { TestBed } from '@angular/core/testing';

import { ModelApiService } from './model-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ModelApiService', () => {
  let service: ModelApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ModelApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
