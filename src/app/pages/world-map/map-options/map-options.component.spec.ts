import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapOptionsComponent } from './map-options.component';
import { TimeseriesType } from '../../../api/dto/dtos';
import { FormsModule } from '@angular/forms';

describe('MapOptionsComponent', () => {
  let component: MapOptionsComponent;
  let fixture: ComponentFixture<MapOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [MapOptionsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapOptionsComponent);
    component = fixture.componentInstance;
    component.mapOptions = {
      type: TimeseriesType.CASES,
      aggregation: 'sum',
      populationNormalization: 0,
      windowSize: 0,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
