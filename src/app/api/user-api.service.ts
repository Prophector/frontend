import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PredictionModel, UserInfo } from './dto/dtos';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>('/api/user/me');
  }

  getUserPredictionModels(): Observable<PredictionModel[]> {
    return this.http.get<{ models: PredictionModel[] }>('/api/user/models').pipe(map((r) => r.models));
  }
}
