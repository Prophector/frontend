import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TIMESERIES_TYPE_DISPLAY_NAME } from 'src/app/core/constants';
import { COUNTRIES } from 'src/app/core/countries';
import { NewPredictionModel, PredictionModel, TimeseriesType } from '../../../api/dto/dtos';
import { ModelApiService } from '../../../api/model-api.service';
import { LineChartOptions, LineConfig } from '../../../shared/line-chart/line-chart.component';
import { ChartOptions } from '../chart-options/chart-options.component';
import { DataOptions } from '../data-options/data-options.component';
import { ChartStateService } from '../chart-state.service';
import { TokenStorageService } from '../../../core/token-storage.service';

@Component({
  selector: 'app-prediction-model',
  templateUrl: './prediction-model.component.html',
  styleUrls: ['./prediction-model.component.scss'],
})
export class PredictionModelComponent implements OnChanges {
  public readonly COUNTRIES = COUNTRIES;
  public readonly TIMESERIES_TYPE_DISPLAY_NAME = TIMESERIES_TYPE_DISPLAY_NAME;

  public readonly changePointMinDate: string = new Date(2020, 1, 1).toISOString();
  public readonly changePointMaxDate: string = new Date().toISOString();

  @Input()
  public chartOptions!: ChartOptions;
  @Input()
  public dataOptions!: DataOptions;
  @Input()
  public displayOptions!: LineChartOptions;

  public prediction?: LineConfig;
  public model?: PredictionModel | NewPredictionModel;
  public isOwner = false;
  public data: { region: string; type: TimeseriesType }[] = [];
  public dataSelected?: string;
  public changePointMode: 'auto' | 'custom' = 'auto';
  public changePoints: { date: string }[] = [];

  public updateInProgress: false | 'updating' | 'scoring' = false;
  public publishInProgress = false;
  public deleteInProgress = false;

  public get loading(): boolean {
    return !!this.updateInProgress || this.publishInProgress || this.deleteInProgress;
  }

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    tokenStorageService: TokenStorageService,
    private readonly modelApiService: ModelApiService,
    private readonly chartStateService: ChartStateService,
  ) {
    this.chartStateService.activeModel$.subscribe((activeModel) => {
      this.model = activeModel;
      this.isOwner = activeModel?.ownerId === tokenStorageService.getUser()?.id;
      this.changePointMode = this.model?.changePoints.length === 0 ? 'auto' : 'custom';
      this.changePoints = this.model?.changePoints.map((c) => ({ date: c })) || [];
      if (activeModel) {
        this.updateData();
      } else {
        this.data = [];
        this.dataSelected = undefined;
      }
    });
    this.chartStateService.updates$.subscribe(() => {
      this.updateData();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateData();
  }

  public updateData(): void {
    this.data = this.chartOptions.groups.flatMap((g) =>
      g.lines
        .filter((line) => line.type !== TimeseriesType.TEST_POSITIVITY)
        .map((line) => ({ region: g.region, type: line.type })),
    );

    if (
      this.model &&
      !this.data.find((d) => d.region === this.model?.region && d.type === this.model?.type) &&
      this.model.type !== TimeseriesType.TEST_POSITIVITY
    ) {
      this.data.unshift({ region: this.model.region, type: this.model.type });
    }

    if (this.model && !this.dataSelected && this.data.length > 0) {
      this.dataSelected = `${this.data[0].region}-${this.data[0].type}`;
    }

    if (!this.model) {
      return;
    }

    if (this.dataSelected) {
      const [region, type] = this.dataSelected.split('-');
      this.model.region = region;
      this.model.type = type as TimeseriesType;
    }
  }

  public updateModelAndPredict(withScore: boolean): void {
    if (!this.model) {
      return;
    }

    this.model.smoothing = this.dataOptions.lag;
    this.model.displayType = this.dataOptions.displayType;
    this.model.daysToLookBack = this.displayOptions.daysToLookBack;
    this.model.rollingSumWindow = this.dataOptions.rollingSumWindow;

    this.updateInProgress = withScore ? 'scoring' : 'updating';
    if (!this.model.id) {
      this.applyChangePoints();
      this.modelApiService.createModel(this.model).subscribe(
        (model) => {
          (this.model as PredictionModel).id = model.id;
          (this.model as PredictionModel).owner = model.owner;
          (this.model as PredictionModel).ownerId = model.ownerId;
          this.predict(withScore);
        },
        () => {
          this.updateInProgress = false;
        },
      );
    } else {
      this.predict(withScore);
    }
  }

  private predict(withScore: boolean): void {
    if (!this.model) {
      return;
    }

    this.applyChangePoints();
    this.modelApiService.triggerPrediction(this.model as PredictionModel, withScore).subscribe(
      (prediction) => {
        if (this.model) {
          this.model.lastScore = prediction.score;
          this.model.lastPrediction = new Date().toISOString();
        }
        this.chartStateService.activePrediction$.next(prediction.lineConfig);
        this.chartStateService.updates$.next();
        this.updateInProgress = false;
        this.updateInProgress = false;
      },
      () => {
        this.updateInProgress = false;
      },
    );
  }

  public publishModel(): void {
    if (!this.model) {
      return;
    }

    this.model.status = 'PUBLISHED';
    this.publishInProgress = true;
    this.modelApiService.updateModel(this.model as PredictionModel).subscribe(
      () => {
        this.publishInProgress = false;
      },
      () => {
        this.publishInProgress = false;
      },
    );
  }

  public deleteModel(): void {
    if (!this.model) {
      return;
    }

    this.deleteInProgress = true;
    this.modelApiService.deleteModel(this.model.id as number).subscribe(
      () => {
        this.deleteInProgress = false;
        this.chartStateService.removeModel(this.model as PredictionModel);
      },
      () => {
        this.deleteInProgress = false;
      },
    );
  }

  private applyChangePoints(): void {
    if (!this.model) {
      return;
    }
    this.model.changePoints = this.changePoints.map((c) => c.date).filter(Boolean);
  }
}
