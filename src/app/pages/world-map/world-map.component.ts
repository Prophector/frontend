import { Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MapData } from '../../shared/map/map.component';
import { CountryDataDto, TimeseriesType } from '../../api/dto/dtos';
import { CountryApiService } from '../../api/country-api.service';
import { TimeseriesService } from '../../core/timeseries.service';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { isValid, max, parseISO } from 'date-fns';
import { MapOptions } from './map-options/map-options.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-world-map',
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.scss'],
})
export class WorldMapComponent {
  public countryData$: Observable<CountryDataDto[]>;
  public mapData$: Observable<MapData[]>;

  public mapOptions: MapOptions = {
    type: TimeseriesType.CASES,
    windowSize: 7,
    aggregation: 'sum',
    populationNormalization: 100_000,
  };

  public selectedCountryCode?: string;

  private updateSubject = new BehaviorSubject<void>(void 0);

  constructor(
    activatedRoute: ActivatedRoute,
    countryService: CountryApiService,
    private readonly timeseriesService: TimeseriesService,
  ) {
    this.countryData$ = this.updateSubject.asObservable().pipe(
      switchMap(() => countryService.getCountryHistoricalData()),
      map((r) => r.countries),
      shareReplay(),
    );
    this.mapData$ = this.countryData$.pipe(
      map((countries) =>
        countries
          .filter((country) => country.isoCode !== 'OWID_WRL')
          .map((country) => this.mapCountryData(country)),
      ),
    );

    activatedRoute.params.subscribe(() => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const optionsParam = urlSearchParams.get('options');
      if (optionsParam) {
        try {
          this.mapOptions = JSON.parse(optionsParam);
        } catch (e) {
          console.log('Could not parse options param', e, optionsParam);
        }
      }

      const selectedCountryParam = urlSearchParams.get('selectedCountry');
      if (selectedCountryParam) {
        this.selectedCountryCode = selectedCountryParam;
      }
    });
  }

  private updateSearchParams(): void {
    const optionsParam = encodeURIComponent(JSON.stringify(this.mapOptions));
    const newRelativePathQuery = `options=${optionsParam}&selectedCountry=${this.selectedCountryCode}`;
    history.pushState(null, '', `${window.location.pathname}?${newRelativePathQuery}`);
  }

  public update(): void {
    this.updateSearchParams();
    this.updateSubject.next();
  }

  public activateCountry(isoCode: string): void {
    this.selectedCountryCode = isoCode;
    this.updateSearchParams();
  }

  public getCountryData(
    selectedCountryCode: string | undefined,
    countryData: CountryDataDto[],
  ): CountryDataDto | undefined {
    return countryData.find((c) => c.isoCode === selectedCountryCode);
  }

  private mapCountryData(country: CountryDataDto): MapData {
    if (this.mapOptions.type === 'TEST_POSITIVITY' && this.mapOptions.windowSize === 0) {
      const positivity =
        country.totalTests === 0 ? undefined : (country.totalCases / country.totalTests) * 100;
      return this.buildCountryData(country, positivity);
    }

    let value: number | undefined;
    if (country.historicalData) {
      if (this.mapOptions.type === 'TEST_POSITIVITY') {
        const testPositivity = this.timeseriesService.computeTestPositivity(
          country.historicalData,
          this.mapOptions.windowSize,
        );
        return this.buildCountryData(country, testPositivity);
      }

      if (this.mapOptions.windowSize === 0) {
        value = this.getTotalValue(this.mapOptions.type, country);
      } else if (country.historicalData[this.mapOptions.type]) {
        value = this.timeseriesService.computeAggregatedValue(
          country.historicalData[this.mapOptions.type].values,
          this.mapOptions.aggregation,
          this.mapOptions.windowSize,
        );
        if (value !== undefined && this.mapOptions.populationNormalization > 0) {
          value /= country.population / this.mapOptions.populationNormalization;
        }
      }
    }
    return this.buildCountryData(country, value);
  }

  private buildCountryData(country: CountryDataDto, value: number | undefined): MapData {
    let lastValueDate: Date | undefined;
    if (country.historicalData) {
      const datesArray: Date[] = [
        this.getLastDate(country, TimeseriesType.CASES),
        this.getLastDate(country, TimeseriesType.TESTS),
        this.getLastDate(country, TimeseriesType.DEATHS),
        this.getLastDate(country, TimeseriesType.VACCINATIONS),
      ].filter((v) => v !== undefined) as Date[];
      lastValueDate = max(datesArray);
    }

    return {
      code: country.isoCode,
      value,
      details: {
        lastValueDate,
        population: country.population,
        cases: this.getAggregatedValue(country, TimeseriesType.CASES),
        tests: this.getAggregatedValue(country, TimeseriesType.TESTS),
        deaths: this.getAggregatedValue(country, TimeseriesType.DEATHS),
        vaccinations: this.getAggregatedValue(country, TimeseriesType.VACCINATIONS),
        testPositivity: country.historicalData
          ? this.timeseriesService.computeTestPositivity(country.historicalData, this.mapOptions.windowSize)
          : undefined,
      },
    };
  }

  private getLastDate(country: CountryDataDto, timeseriesType: TimeseriesType): Date | undefined {
    const values =
      country.historicalData &&
      country.historicalData[timeseriesType] &&
      country.historicalData[timeseriesType].values;
    if (!values || values.length === 0) {
      return undefined;
    }
    const date = parseISO(values[values.length - 1].date);
    return isValid(date) ? date : undefined;
  }

  private getAggregatedValue(country: CountryDataDto, type: TimeseriesType): number | undefined {
    if (this.mapOptions.windowSize === 0) {
      return this.getTotalValue(type, country);
    }
    if (!country.historicalData || !country.historicalData[type] || !country.historicalData[type].values) {
      return undefined;
    }
    return this.timeseriesService.computeAggregatedValue(
      country.historicalData[type].values,
      this.mapOptions.aggregation,
      this.mapOptions.windowSize,
    );
  }

  private getTotalValue(type: TimeseriesType, country: CountryDataDto): number {
    switch (type) {
      case TimeseriesType.CASES:
        return country.totalCases;
      case TimeseriesType.TESTS:
        return country.totalTests;
      case TimeseriesType.DEATHS:
        return country.totalDeaths;
      case TimeseriesType.VACCINATIONS:
        return country.totalVaccinations;
      case TimeseriesType.TEST_POSITIVITY:
        return country.totalCases / country.totalTests;
      default:
        throw new Error('not yet implemented');
    }
  }
}
