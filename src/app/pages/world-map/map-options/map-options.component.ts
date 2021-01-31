import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimeseriesType } from '../../../api/dto/dtos';

export interface MapOptions {
  type: TimeseriesType;
  windowSize: number;
  aggregation: 'sum' | 'avg';
  populationNormalization: number;
}

@Component({
  selector: 'app-map-options',
  templateUrl: './map-options.component.html',
  styleUrls: ['./map-options.component.scss'],
})
export class MapOptionsComponent {
  @Input()
  public mapOptions!: MapOptions;

  @Output()
  public update = new EventEmitter<void>();

  public triggerUpdate(): void {
    this.update.next();
  }
}
