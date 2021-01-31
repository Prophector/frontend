import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserInfo } from '../api/dto/dtos';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post('/auth/signin', {
      email: credentials.email,
      password: credentials.password,
    });
  }

  register(user: UserInfo & { password: string; matchingPassword: string }): Observable<any> {
    return this.http.post('/auth/signup', {
      displayName: user.displayName,
      email: user.email,
      password: user.password,
      matchingPassword: user.matchingPassword,
      socialProvider: 'LOCAL',
    });
  }
}
