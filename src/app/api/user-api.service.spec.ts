import { TestBed } from '@angular/core/testing';

import { UserApiService } from './user-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UserApiService', () => {
  let service: UserApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(UserApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
