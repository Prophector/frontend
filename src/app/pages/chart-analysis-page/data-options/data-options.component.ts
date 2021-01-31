import { Component, Input } from '@angular/core';
import { ChartStateService } from '../chart-state.service';

export interface DataOptions {
  displayType: 'absolute' | 'daily';
  byPopulation: 0 | 1 | 10_000 | 100_000 | 1_000_000;
  lag: 0 | 7 | 10 | 14;
  rollingSumWindow: number;
}

@Component({
  selector: 'app-data-options',
  templateUrl: './data-options.component.html',
  styleUrls: ['./data-options.component.scss'],
})
export class DataOptionsComponent {
  @Input()
  public options!: DataOptions;

  constructor(public readonly chartStateService: ChartStateService) {}
}
