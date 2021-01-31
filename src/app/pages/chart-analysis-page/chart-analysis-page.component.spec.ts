import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartAnalysisPageComponent } from './chart-analysis-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChartStateService } from './chart-state.service';
import { DisplayOptionsComponent } from './display-options/display-options.component';
import { PredictionModelComponent } from './prediction-model/prediction-model.component';
import { DataOptionsComponent } from './data-options/data-options.component';
import { PredictionOptionsComponent } from './prediction-options/prediction-options.component';
import { ChartOptionsComponent } from './chart-options/chart-options.component';
import { LineChartComponent } from '../../shared/line-chart/line-chart.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

describe('ChartAnalysisPageComponent', () => {
  let component: ChartAnalysisPageComponent;
  let fixture: ComponentFixture<ChartAnalysisPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, FontAwesomeModule, FormsModule],
      declarations: [
        ChartAnalysisPageComponent,
        LineChartComponent,
        DisplayOptionsComponent,
        PredictionModelComponent,
        DataOptionsComponent,
        PredictionOptionsComponent,
        ChartOptionsComponent,
      ],
      providers: [ChartStateService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartAnalysisPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
