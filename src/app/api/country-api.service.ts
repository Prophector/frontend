import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CountriesResponseDto } from './dto/dtos';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CountryApiService {
  private countryHistoricalObservables: {
    [key in 1 | 7 | 10 | 14]?: Observable<CountriesResponseDto>;
  } = {};

  constructor(private readonly http: HttpClient) {}

  public getCountryHistoricalData(days: 1 | 7 | 10 | 14 = 14): Observable<CountriesResponseDto> {
    if (!this.countryHistoricalObservables[days]) {
      this.countryHistoricalObservables[days] = this.http
        .get<CountriesResponseDto>('/api/countries/historical', {
          params: { days: `${days}` },
        })
        .pipe(shareReplay());
    }

    return this.countryHistoricalObservables[days] as Observable<CountriesResponseDto>;
  }
}
