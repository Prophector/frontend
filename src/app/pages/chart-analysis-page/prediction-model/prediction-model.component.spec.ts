import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionModelComponent } from './prediction-model.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChartStateService } from '../chart-state.service';
import { FormsModule } from '@angular/forms';

describe('PredictionModelComponent', () => {
  let component: PredictionModelComponent;
  let fixture: ComponentFixture<PredictionModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule],
      declarations: [PredictionModelComponent],
      providers: [ChartStateService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
