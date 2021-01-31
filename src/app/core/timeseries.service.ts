import { Injectable } from '@angular/core';
import { DataPointDto, HistoricalDataDto, TimeseriesType } from '../api/dto/dtos';

@Injectable({
  providedIn: 'root',
})
export class TimeseriesService {
  constructor() {}

  public sum(list: DataPointDto[] | undefined, windowSize: number): number | undefined {
    if (!list || list.length === 0) {
      return undefined;
    }
    let lastValue = 0;
    for (
      let lastValidIndex = list.length;
      lastValidIndex >= 0 && lastValue === 0 && lastValidIndex > list.length - windowSize;
      lastValidIndex--
    ) {
      // in case the last value is "empty", we search from the back until we find a value
      lastValue = list[lastValidIndex - 1].value;
    }
    return lastValue - list[Math.max(0, list.length - windowSize - 1)].value;
  }

  public average(list: DataPointDto[] | undefined, windowSize: number): number | undefined {
    const sum = this.sum(list, windowSize);
    if (sum === undefined) {
      return undefined;
    }
    return sum / windowSize;
  }

  public computeAggregatedValue(
    values: DataPointDto[],
    aggregation: 'sum' | 'avg',
    windowSize: number,
  ): number | undefined {
    return aggregation === 'sum' ? this.sum(values, windowSize) : this.average(values, windowSize);
  }

  public computeTestPositivity(timeseries: HistoricalDataDto, windowSize: number): number | undefined {
    if (!timeseries[TimeseriesType.TESTS] || !timeseries[TimeseriesType.CASES]) {
      return undefined;
    }

    const tests = this.computeAggregatedValue(timeseries[TimeseriesType.TESTS].values, 'sum', windowSize);
    const cases = this.computeAggregatedValue(timeseries[TimeseriesType.CASES].values, 'sum', windowSize);

    if (tests === undefined || cases === undefined || tests === 0) {
      return undefined;
    }

    return (cases / tests) * 100;
  }

  public movingAverage(list: DataPointDto[], windowSize: number): DataPointDto[] {
    const length = list.length;

    if (!windowSize) {
      return [list.reduce((a, b) => ({ date: a.date, value: (a.value + b.value) / length }))];
    }

    if (windowSize <= 1) {
      return list.slice();
    }

    if (windowSize > length) {
      return Array(length);
    }

    const ret: DataPointDto[] = [];
    let sum = 0;
    let i = 0;
    let counter = 0;
    let datum: DataPointDto;

    for (; i < length && counter < windowSize - 1; i++) {
      datum = list[i];

      sum += datum.value;
      counter++;
    }

    for (; i < length; i++) {
      datum = list[i];
      sum += datum.value;

      if (list[i - windowSize]) {
        sum -= list[i - windowSize].value;
      }

      ret[i] = { date: datum.date, value: sum / windowSize };
    }

    return ret.filter(Boolean);
  }
}
