import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartOptionsComponent } from './chart-options.component';
import { ChartStateService } from '../chart-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('ChartOptionsComponent', () => {
  let component: ChartOptionsComponent;
  let fixture: ComponentFixture<ChartOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FontAwesomeModule, FormsModule],
      declarations: [ChartOptionsComponent],
      providers: [ChartStateService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartOptionsComponent);
    component = fixture.componentInstance;
    component.options = { groups: [] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
