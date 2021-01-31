import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TimeseriesResponseDto } from './dto/dtos';
import { format, subDays } from 'date-fns';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TimeseriesApiService {
  private observables: {
    [region: string]: { [daysToLookBack: number]: Observable<TimeseriesResponseDto> };
  } = {};

  constructor(private readonly http: HttpClient) {}

  public getTimeseries(region: string, daysToLookBack: number): Observable<TimeseriesResponseDto> {
    if (!this.observables[region]) {
      this.observables[region] = {};
    }
    if (!this.observables[region][daysToLookBack]) {
      this.observables[region][daysToLookBack] = this.http
        .get<TimeseriesResponseDto>('/api/timeseries', {
          params: {
            from: format(subDays(new Date(), daysToLookBack), 'yyyy-MM-dd'),
            to: format(new Date(), 'yyyy-MM-dd'),
            region,
          },
        })
        .pipe(shareReplay());
    }

    return this.observables[region][daysToLookBack];
  }
}
