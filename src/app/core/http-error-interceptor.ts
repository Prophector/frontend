import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          // client side error
          alert(
            `A client side error occurred. Are you connected to the Internet still? Message: ${error.error.message}`,
          );
        } else {
          // error response
          alert(`Oops... this should not happen. Error Code: ${error.status}, Message: ${error.message}`);
        }
        return throwError(error);
      }),
    );
  }
}
