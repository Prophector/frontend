import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayOptionsComponent } from './display-options.component';
import { ChartStateService } from '../chart-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('DisplayOptionsComponent', () => {
  let component: DisplayOptionsComponent;
  let fixture: ComponentFixture<DisplayOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule],
      declarations: [DisplayOptionsComponent],
      providers: [ChartStateService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayOptionsComponent);
    component = fixture.componentInstance;
    component.displayOptions = { daysToLookBack: 0, scale: 'linear' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
