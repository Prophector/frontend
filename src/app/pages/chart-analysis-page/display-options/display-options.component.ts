import { Component, Input } from '@angular/core';
import { LineChartOptions } from '../../../shared/line-chart/line-chart.component';
import { ChartStateService } from '../chart-state.service';

@Component({
  selector: 'app-display-options',
  templateUrl: './display-options.component.html',
  styleUrls: ['./display-options.component.scss'],
})
export class DisplayOptionsComponent {
  @Input()
  public displayOptions!: LineChartOptions;

  constructor(public readonly chartStateService: ChartStateService) {}
}
