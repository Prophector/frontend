import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataOptionsComponent } from './data-options.component';
import { ChartStateService } from '../chart-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('DataOptionsComponent', () => {
  let component: DataOptionsComponent;
  let fixture: ComponentFixture<DataOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule],
      declarations: [DataOptionsComponent],
      providers: [ChartStateService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataOptionsComponent);
    component = fixture.componentInstance;
    component.options = { byPopulation: 0, displayType: 'daily', lag: 0, rollingSumWindow: 1 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
