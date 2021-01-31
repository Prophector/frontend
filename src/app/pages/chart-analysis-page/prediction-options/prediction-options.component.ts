import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LineConfig } from '../../../shared/line-chart/line-chart.component';
import { ModelApiService } from '../../../api/model-api.service';
import { NewPredictionModel, PredictionModel, TimeseriesType } from '../../../api/dto/dtos';
import { COUNTRIES } from 'src/app/core/countries';
import { faCheckCircle, faCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ChartStateService, IsoCodeModels } from '../chart-state.service';
import { ChartOptions } from '../chart-options/chart-options.component';
import { MODEL_STATUS, TIMESERIES_TYPE_DISPLAY_NAME } from 'src/app/core/constants';
import { TokenStorageService } from '../../../core/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prediction-options',
  templateUrl: './prediction-options.component.html',
  styleUrls: ['./prediction-options.component.scss'],
})
export class PredictionOptionsComponent implements OnChanges {
  public readonly COUNTRIES = COUNTRIES;
  public readonly TIMESERIES_TYPE_DISPLAY_NAME = TIMESERIES_TYPE_DISPLAY_NAME;
  public readonly MODEL_STATUS = MODEL_STATUS;
  public readonly faCheckCircle = faCheckCircle;
  public readonly faCircle = faCircle;
  public readonly faPlus = faPlus;

  @Input()
  public chartOptions!: ChartOptions;

  public prediction?: LineConfig;
  public models: IsoCodeModels = {};
  public isoCodes: string[] = [];

  public activeModel?: PredictionModel | NewPredictionModel;

  constructor(
    private readonly modelApiService: ModelApiService,
    private readonly chartStateService: ChartStateService,
    private readonly tokenStorageService: TokenStorageService,
    private readonly router: Router,
  ) {
    this.chartStateService.models$.subscribe((models) => {
      this.models = models;
      this.isoCodes = Object.keys(models);
    });
    this.chartStateService.activePrediction$.subscribe((prediction) => {
      this.prediction = prediction;
    });
    this.chartStateService.activeModel$.subscribe((model) => {
      this.activeModel = model;
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.isoCodes) {
      if (this.activeModel && !this.isoCodes.includes(this.activeModel.region)) {
        this.unselectModel();
      }
    }
  }

  public unselectModel(): void {
    this.chartStateService.selectModel(undefined);
  }

  public selectModel(model: PredictionModel | NewPredictionModel): void {
    this.chartStateService.selectModel(model);
  }

  public createNewModel(): void {
    const ownerId = this.tokenStorageService.getUser()?.id;
    if (!ownerId) {
      this.router.navigate(['/login'], {
        queryParams: {
          redirectUrl: window.location.pathname + window.location.search,
          reason: 'To create personal prediction models, you must be logged in.',
        },
      });
      return;
    }
    if (this.chartOptions.groups.length === 0 || this.chartOptions.groups[0].lines.length === 0) {
      return;
    }

    const typeCandidate = this.chartOptions.groups[0].lines[0].type;
    const type = typeCandidate !== TimeseriesType.TEST_POSITIVITY ? typeCandidate : TimeseriesType.CASES;
    const region = this.chartOptions.groups[0].region;

    const model: NewPredictionModel = {
      name: '',
      description: '',
      status: 'DRAFT',
      region,
      type,
      ownerId,
      displayType: 'daily',
      rollingSumWindow: 1,
      seasonalityMode: 'additive',
      changePointPriorScale: 0.25,
      seasonalityPriorScale: 10,
      holidaysPriorScale: 10,
      changePointRange: 0.9,
      changePoints: [],
      daysToLookBack: 90,
      numChangePoints: 25,
      smoothing: 7,
      addCountryHolidays: false,
    };
    this.models[region].unshift(model);
    this.chartStateService.selectModel(model);
    this.chartStateService.updates$.next();
  }
}
