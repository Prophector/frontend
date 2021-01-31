import { Component, OnInit } from '@angular/core';
import { TimeseriesApiService } from '../../api/timeseries-api.service';
import { ChartOptionGroup, ChartOptions, LineOptions } from './chart-options/chart-options.component';
import { DataPointDto, HistoricalDataDto, NewPredictionModel, TimeseriesType } from '../../api/dto/dtos';
import {
  Datum,
  LineChartData,
  LineChartOptions,
  LineConfig,
} from '../../shared/line-chart/line-chart.component';
import { TimeseriesService } from '../../core/timeseries.service';
import { differenceInDays, parseISO } from 'date-fns';
import { ColorService } from '../../core/color.service';
import { TIMESERIES_TYPE_DISPLAY_NAME, TYPE_DASHES_CONFIG } from '../../core/constants';
import { ActivatedRoute } from '@angular/router';
import { COUNTRIES } from '../../core/countries';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataOptions } from './data-options/data-options.component';
import { ChartStateService } from './chart-state.service';

@Component({
  selector: 'app-chart-analysis-page',
  templateUrl: './chart-analysis-page.component.html',
  styleUrls: ['./chart-analysis-page.component.scss'],
  providers: [ChartStateService],
})
export class ChartAnalysisPageComponent implements OnInit {
  public data: LineChartData = [];

  public displayOptions: LineChartOptions = {
    scale: 'linear',
    daysToLookBack: 365,
  };
  public dataOptions: DataOptions = {
    displayType: 'daily',
    lag: 7,
    byPopulation: 0,
    rollingSumWindow: 1,
  };
  public yLabel = '';
  public options: ChartOptions = { groups: [] };

  private fetchingRegionData: { [index: string]: boolean } = {};
  private regionPopulations: { [index: string]: number } = {};
  private activePrediction?: LineConfig;
  private activeModel?: NewPredictionModel;
  private selectedModelIdParam?: string | null;

  constructor(
    activatedRoute: ActivatedRoute,
    private readonly chartStateService: ChartStateService,
    private readonly timeseriesApiService: TimeseriesApiService,
    private readonly timeseriesService: TimeseriesService,
    private readonly colorService: ColorService,
  ) {
    activatedRoute.params.subscribe(() => {
      const searchParams = new URLSearchParams(window.location.search);

      this.selectedModelIdParam = searchParams.get('model');
      if (this.selectedModelIdParam) {
        let selectedModel = false;
        this.chartStateService.models$.subscribe((isoCodeModels) => {
          if (selectedModel) {
            return;
          }
          selectedModel = true;
          Object.values(isoCodeModels).forEach((models) => {
            const foundModel = models.find((m) => `${m.id}` === this.selectedModelIdParam);
            if (foundModel) {
              this.chartStateService.selectModel(foundModel);
            } else {
              this.selectedModelIdParam = null;
            }
          });
        });
      }

      const regionParam = searchParams.get('region');
      if (regionParam) {
        this.options.groups.push({
          region: regionParam,
          color: this.colorService.getCyclePaletteColor(0),
          hide: false,
          lines: [{ type: TimeseriesType.CASES, hide: false }],
        });
        return;
      }

      const optionsParam = searchParams.get('options');
      if (optionsParam) {
        try {
          this.options = JSON.parse(optionsParam.replace(/__/g, '#'));
        } catch (e) {
          console.log('Could not parse options param', e, optionsParam);
        }
      }

      const dataOptionsParam = searchParams.get('dataOptions');
      if (dataOptionsParam) {
        try {
          this.dataOptions = JSON.parse(dataOptionsParam);
        } catch (e) {
          console.log('Could not parse data options param', e, optionsParam);
        }
      }

      const displayParam = searchParams.get('display');
      if (displayParam) {
        try {
          this.displayOptions = JSON.parse(displayParam);
        } catch (e) {
          console.log('Could not parse display param', e, displayParam);
        }
      }
    });

    this.chartStateService.updates$.subscribe(() => {
      this.update();
    });

    this.chartStateService.activePrediction$.subscribe((activePrediction) => {
      this.activePrediction = activePrediction;
      this.update();
    });

    this.chartStateService.activeModel$.subscribe((model) => {
      this.selectedModelIdParam = model ? `${model.id}` : undefined;
      this.activeModel = model;
    });
  }

  public ngOnInit(): void {
    this.update();
  }

  private updateSearchParams(): void {
    const optionsParam = encodeURIComponent(JSON.stringify(this.options).replace(/#/g, '__'));
    const displayParam = encodeURIComponent(JSON.stringify(this.displayOptions));
    const dataParam = encodeURIComponent(JSON.stringify(this.dataOptions));
    const newRelativePathQuery = `${window.location.pathname}?options=${optionsParam}&dataOptions=${dataParam}&display=${displayParam}`;
    const modelParam = this.selectedModelIdParam ? `&model=${this.selectedModelIdParam}` : '';
    history.pushState(null, '', `${newRelativePathQuery}${modelParam}`);
  }

  public update(): void {
    this.updateSearchParams();
    this.chartStateService.updateModels(this.options.groups.map((g) => g.region).filter(Boolean));
    this.data = [];
    const yLabels: string[] = [];
    const obs = this.options.groups
      .filter((group) => !group.hide)
      .filter((group) => !!group.region)
      .map((group) => {
        this.fetchingRegionData[group.region] = true;
        return this.timeseriesApiService.getTimeseries(group.region, this.displayOptions.daysToLookBack).pipe(
          tap((data) => {
            if (!this.fetchingRegionData[group.region]) {
              return;
            }
            this.fetchingRegionData[group.region] = false;
            this.regionPopulations[group.region] = data.population;
            group.lines
              .filter((line) => !line.hide)
              .forEach((line) => {
                let computedValues: DataPointDto[] | undefined;
                if (line.type === TimeseriesType.TEST_POSITIVITY) {
                  computedValues = this.getTestPositivityData(data.timeseries);
                } else {
                  computedValues = data.timeseries[line.type]?.values || [];
                  if (this.dataOptions.displayType === 'daily') {
                    computedValues = this.computeDaily(computedValues);
                  }
                  if (this.dataOptions.rollingSumWindow > 1) {
                    computedValues = this.computeRollingSum(computedValues);
                  }
                }

                if (this.dataOptions.byPopulation > 0) {
                  computedValues = this.computeByPopulation(computedValues, data.population);
                }

                if (this.dataOptions.lag > 0) {
                  computedValues = this.movingAverage(computedValues, this.dataOptions.lag);
                }

                this.data.push({
                  label: this.getLabel(group, line),
                  color: group.color,
                  dashes: TYPE_DASHES_CONFIG[line.type],
                  values: computedValues,
                });
                yLabels.push(TIMESERIES_TYPE_DISPLAY_NAME[line.type]);
              });
          }),
        );
      });
    forkJoin(obs).subscribe(() => {
      this.yLabel = yLabels.filter((l, i, self) => i !== self.indexOf(l)).join(', ');

      // concat with predictions and
      if (this.activePrediction && this.activeModel) {
        let computedValues = this.activePrediction.values;
        if (this.dataOptions.byPopulation > 0) {
          computedValues = this.computeByPopulation(
            this.activePrediction.values,
            this.regionPopulations[this.activeModel.region],
          );
        }
        this.data.push({
          label: this.activePrediction.label,
          color: this.activePrediction.color,
          dashes: this.activePrediction.dashes,
          values: computedValues,
        });
      }
      // important: update reference to trigger change detection
      this.data = this.data.slice();
    });
  }

  private computeDaily(computedValues: { date: string; value: number }[]): { date: string; value: number }[] {
    const firstNonZeroValue = computedValues.findIndex((v) => v.value > 0);
    const usableValues = computedValues.filter((v, i) => i <= firstNonZeroValue || v.value !== 0);
    const dailyValues = usableValues.map((datum, i) => {
      if (i === 0) {
        return { value: 0, date: datum.date };
      }

      const lastDatum = usableValues[i - 1];
      const diffInDays = differenceInDays(parseISO(datum.date), parseISO(lastDatum.date));
      const value = (datum.value - lastDatum.value) / diffInDays;
      return { value, date: datum.date };
    });
    dailyValues.splice(0, 1);
    return dailyValues;
  }

  private computeByPopulation(computedValues: Datum[], population: number): Datum[] {
    const populationDivisor = population / this.dataOptions.byPopulation;
    return computedValues.map((v) => {
      const d: Datum = { date: v.date, value: v.value / populationDivisor };

      if (v.upperBound) {
        d.upperBound = v.upperBound / populationDivisor;
      }
      if (v.lowerBound) {
        d.lowerBound = v.lowerBound / populationDivisor;
      }

      return d;
    });
  }

  private movingAverage(
    computedValues: { date: string; value: number }[],
    lag: number,
  ): { date: string; value: number }[] {
    return this.timeseriesService.movingAverage(computedValues, lag);
  }

  private getTestPositivityData(data: HistoricalDataDto): DataPointDto[] {
    const testValues = data[TimeseriesType.TESTS];
    if (!testValues) {
      return [];
    }
    const caseValues = data[TimeseriesType.CASES];
    if (!caseValues) {
      return [];
    }
    const dailyCaseValues = this.computeDaily(caseValues.values);
    return this.computeDaily(testValues.values).map((v) => ({
      value: this.getTestPositivity(v, dailyCaseValues),
      date: v.date,
    }));
  }

  private getTestPositivity(v: DataPointDto, caseValues: DataPointDto[]): number {
    const cases = caseValues.find((c) => c.date === v.date);
    if (!cases || v.value === 0) {
      return 0;
    }
    return cases.value / v.value;
  }

  private getLabel(group: ChartOptionGroup, line: LineOptions): string {
    return `${COUNTRIES[group.region]} ${TIMESERIES_TYPE_DISPLAY_NAME[line.type]}`;
  }

  private computeRollingSum(computedValues: DataPointDto[]): DataPointDto[] {
    if (computedValues.length < this.dataOptions.rollingSumWindow) {
      return [];
    }

    const rollingSum: DataPointDto[] = [];
    for (let i = this.dataOptions.rollingSumWindow; i < computedValues.length; i++) {
      let sum = 0;
      for (let j = i - this.dataOptions.rollingSumWindow; j < i; j++) {
        sum += computedValues[j].value;
      }
      rollingSum.push({ date: computedValues[i].date, value: sum });
    }

    return rollingSum;
  }
}
