import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPointPrediction, NewPredictionModel, PredictionModel, PredictionResponse } from './dto/dtos';
import { map } from 'rxjs/operators';
import { LineConfig } from '../shared/line-chart/line-chart.component';

@Injectable({
  providedIn: 'root',
})
export class ModelApiService {
  constructor(private readonly http: HttpClient) {}

  public getMatchingModels(region: string): Observable<PredictionModel[]> {
    return this.http
      .get<{ models: PredictionModel[] }>(`api/model?region=${region}`)
      .pipe(map((r) => r.models));
  }

  public createModel(model: NewPredictionModel): Observable<PredictionModel> {
    return this.http.post<PredictionModel>('/api/model', model);
  }

  public updateModel(model: PredictionModel): Observable<void> {
    return this.http.put<void>(`/api/model/${model.id}`, model);
  }

  public triggerPrediction(
    model: Omit<PredictionModel, 'owner'>,
    withScore: boolean,
  ): Observable<{ score?: number; lineConfig: LineConfig }> {
    let url = `/api/model/${model.id}/predict`;
    if (withScore) {
      url = `${url}?withScore=true`;
    }

    return this.http.post<PredictionResponse>(url, model).pipe(
      map((prediction) => ({
        score: prediction.score,
        lineConfig: this.mapPrediction(prediction.dataPoints),
      })),
    );
  }

  public getPrediction(modelId: PredictionModel['id']): Observable<LineConfig> {
    return this.http.get<{ dataPoints: DataPointPrediction[] }>(`/api/model/${modelId}/predict`).pipe(
      map((r) => r.dataPoints),
      map((prediction) => this.mapPrediction(prediction)),
    );
  }

  private mapPrediction(prediction: DataPointPrediction[]): LineConfig {
    return {
      color: 'red',
      dashes: '1',
      label: `Prediction`,
      values: prediction.map((d) => ({
        date: d.date,
        value: d.yhat,
        upperBound: d.upperBound,
        lowerBound: d.lowerBound,
        isChangePoint: d.changePoint,
      })),
    };
  }

  public deleteModel(id: number): Observable<void> {
    return this.http.delete<void>(`/api/model/${id}`);
  }
}
