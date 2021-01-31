import { TestBed } from '@angular/core/testing';
import { HttpErrorInterceptor } from './http-error-interceptor';

describe('HttpErrorInterceptor', () => {
  let service: HttpErrorInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [HttpErrorInterceptor] });
    service = TestBed.inject(HttpErrorInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
