import { Component, Input } from '@angular/core';
import { COUNTRIES } from 'src/app/core/countries';
import { TimeseriesType } from '../../../api/dto/dtos';
import { ColorService } from '../../../core/color.service';
import { faEye, faEyeSlash, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TYPE_DASHES_CONFIG } from '../../../core/constants';
import { ChartStateService } from '../chart-state.service';

export interface LineOptions {
  type: TimeseriesType;
  hide: boolean;
}

export interface ChartOptionGroup {
  region: string;
  color: string;
  hide: boolean;
  lines: LineOptions[];
}

export interface ChartOptions {
  groups: ChartOptionGroup[];
}

@Component({
  selector: 'app-chart-options',
  templateUrl: './chart-options.component.html',
  styleUrls: ['./chart-options.component.scss'],
})
export class ChartOptionsComponent {
  @Input()
  public options!: ChartOptions;

  public readonly faTrash = faTrash;
  public readonly faEye = faEye;
  public readonly faEyeSlash = faEyeSlash;
  public readonly TYPE_DASHES_CONFIG = TYPE_DASHES_CONFIG;

  public addedGroupIndex = -1;

  public readonly COUNTRIES = COUNTRIES;
  public readonly COUNTRY_LIST = Object.entries(COUNTRIES).map(([isoCode, name]) => ({ isoCode, name }));

  constructor(
    private readonly chartStateService: ChartStateService,
    private readonly colorService: ColorService,
  ) {}

  public addGroup(): void {
    const nextColor = this.colorService.getCyclePaletteColor(this.options.groups.length);
    const newGroup: ChartOptionGroup = { region: '', hide: false, color: nextColor, lines: [] };

    if (this.options.groups.length >= 1) {
      newGroup.lines = this.options.groups[0].lines.map((line) => ({ ...line }));
    } else {
      newGroup.lines = [{ type: TimeseriesType.CASES, hide: false }];
    }

    this.options.groups.push(newGroup);
    this.addedGroupIndex = this.options.groups.length - 1;
    this.update();
  }

  public addLine(group: ChartOptionGroup): void {
    const line: LineOptions = { type: TimeseriesType.CASES, hide: false };

    if (group.lines.length > 0) {
      const usedTypes = group.lines.map((l) => l.type);
      const unusedTypes = [
        TimeseriesType.CASES,
        TimeseriesType.TESTS,
        TimeseriesType.VACCINATIONS,
        TimeseriesType.TEST_POSITIVITY,
        TimeseriesType.DEATHS,
      ].filter((t) => !usedTypes.includes(t));
      if (unusedTypes.length > 0) {
        line.type = unusedTypes[0];
      }
    }

    group.lines.push(line);
    this.update();
  }

  public toggleGroup(group: ChartOptionGroup): void {
    group.hide = !group.hide;
    this.update();
  }

  public toggleLine(line: LineOptions): void {
    line.hide = !line.hide;
    this.update();
  }

  public removeGroup(group: ChartOptionGroup): void {
    this.options.groups = this.options.groups.filter((g) => g !== group);
    this.update();
  }

  public removeLine(line: LineOptions, group: ChartOptionGroup): void {
    group.lines = group.lines.filter((l) => l !== line);
    this.update();
  }

  public update(): void {
    this.chartStateService.updates$.next();
  }
}
