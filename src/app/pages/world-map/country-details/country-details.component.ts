import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { COUNTRIES } from 'src/app/core/countries';
import { CountryDataDto, DataPointDto, TimeseriesType } from '../../../api/dto/dtos';

@Component({
  selector: 'app-country-details',
  templateUrl: './country-details.component.html',
  styleUrls: ['./country-details.component.scss'],
})
export class CountryDetailsComponent implements OnChanges {
  @Input()
  public countryData?: CountryDataDto;
  public readonly COUNTRIES = COUNTRIES;

  public timeFrame: 0 | 1 | 7 | 10 | 14 = 7;

  public cases?: number;
  public deaths?: number;
  public tests?: number;
  public vaccinations?: number;
  public testPositivity?: number;

  ngOnChanges(changes: SimpleChanges): void {
    this.updateStats();
  }

  resetStats(): void {
    this.cases = undefined;
    this.deaths = undefined;
    this.tests = undefined;
    this.vaccinations = undefined;
    this.testPositivity = undefined;
  }

  updateStats(): void {
    if (!this.countryData) {
      this.resetStats();
      return;
    }

    if (this.timeFrame === 0) {
      this.cases = this.countryData.totalCases;
      this.deaths = this.countryData.totalDeaths;
      this.tests = this.countryData.totalTests;
      this.vaccinations = this.countryData.totalVaccinations;
      this.computeTestPositivity();
      return;
    }

    const historicalData = this.countryData.historicalData;

    if (!historicalData) {
      this.resetStats();
      return;
    }

    this.cases = this.computeDiff(historicalData[TimeseriesType.CASES]?.values, this.timeFrame);
    this.deaths = this.computeDiff(historicalData[TimeseriesType.DEATHS]?.values, this.timeFrame);
    this.tests = this.computeDiff(historicalData[TimeseriesType.TESTS]?.values, this.timeFrame);
    this.vaccinations = this.computeDiff(historicalData[TimeseriesType.VACCINATIONS]?.values, this.timeFrame);
    this.computeTestPositivity();
  }

  private computeTestPositivity(): void {
    if (this.tests != null && this.cases != null && this.tests > 0) {
      this.testPositivity = this.cases / this.tests;
    } else {
      this.testPositivity = undefined;
    }
  }

  private computeDiff(param: undefined | DataPointDto[], timeFrame: number): number | undefined {
    // we regard the last value as unusable for diffs (as updates are coming, the numbers usually are incorrect)
    if (!param || param.length < 2) {
      return undefined;
    }

    const lastValue = param[param.length - 2].value;
    const previousValueIndex = Math.max(0, param.length - 2 - timeFrame);

    return lastValue - param[previousValueIndex].value;
  }
}
