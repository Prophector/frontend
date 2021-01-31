import { Injectable } from '@angular/core';
import { NewPredictionModel, PredictionModel } from '../../api/dto/dtos';
import { ModelApiService } from '../../api/model-api.service';
import { Subject } from 'rxjs';
import { LineConfig } from '../../shared/line-chart/line-chart.component';

export type IsoCodeModels = { [isoCode: string]: (PredictionModel | NewPredictionModel)[] };

@Injectable()
export class ChartStateService {
  private activeModelSubject = new Subject<PredictionModel | NewPredictionModel | undefined>();
  private updatesSubject = new Subject<IsoCodeModels>();

  private activeModel?: PredictionModel | NewPredictionModel;
  private predictions: { [index: number]: LineConfig } = {};

  public activeModel$ = this.activeModelSubject.asObservable();
  public activePrediction$ = new Subject<LineConfig | undefined>();
  public models$ = this.updatesSubject.asObservable();
  public updates$ = new Subject<void>();

  private models: IsoCodeModels = {};

  constructor(private readonly modelApiService: ModelApiService) {}

  public updateModels(isoCodes: string[]): void {
    Object.keys(this.models)
      .filter((code) => !isoCodes.includes(code))
      .forEach((code) => {
        if (this.activeModel && this.models[code].includes(this.activeModel)) {
          this.removeModel(this.activeModel);
        }
        delete this.models[code];
      });

    isoCodes.forEach((isoCode) => {
      if (this.models[isoCode]) {
        return;
      }
      this.models[isoCode] = [];
      this.modelApiService.getMatchingModels(isoCode).subscribe((models) => {
        this.models[isoCode] = [...this.models[isoCode], ...models];
        this.updatesSubject.next(this.models);
      });
    });
  }

  public selectModel(model: PredictionModel | NewPredictionModel | undefined): void {
    this.activeModel = model;
    this.activeModelSubject.next(model);

    if (!model) {
      this.activePrediction$.next(undefined);
    } else if (model?.id) {
      if (this.predictions[model.id]) {
        this.activePrediction$.next(this.predictions[model.id]);
      } else {
        this.modelApiService.getPrediction(model.id).subscribe((prediction) => {
          if (!model.id) {
            return;
          }
          this.predictions[model.id] = prediction;
          this.activePrediction$.next(prediction);
        });
      }
    }
  }

  public removeModel(model: PredictionModel | NewPredictionModel): void {
    const i = this.models[model.region].indexOf(model);
    this.models[model.region].splice(i, 1);
    this.updatesSubject.next(this.models);
    if (model === this.activeModel) {
      this.selectModel(undefined);
    }
  }
}
