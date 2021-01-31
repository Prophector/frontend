import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionOptionsComponent } from './prediction-options.component';
import { ChartStateService } from '../chart-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('PredictionOptionsComponent', () => {
  let component: PredictionOptionsComponent;
  let fixture: ComponentFixture<PredictionOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, FontAwesomeModule, FormsModule],
      declarations: [PredictionOptionsComponent],
      providers: [ChartStateService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
