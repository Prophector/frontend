import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  public getScalePaletteColor(value: number, minValue: number, maxValue: number): string {
    const normalizedValue = value - minValue;
    const normalizedMaxValue = maxValue - minValue;
    const v = Math.round(
      (normalizedValue / normalizedMaxValue) * (ColorService.SEQUENTIAL_PALETTE.length - 1),
    );
    return ColorService.SEQUENTIAL_PALETTE[v];
  }

  public getCyclePaletteColor(index: number): string {
    return ColorService.ACCENT_PALETTE[index % ColorService.ACCENT_PALETTE.length];
  }

  private static readonly ACCENT_PALETTE = ['#0EABA9', '#E61E64', '#086ADB', '#A63297', '#5944C6'];

  /**
   * From https://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=9
   */
  private static readonly SEQUENTIAL_PALETTE = [
    '#ffffcc',
    '#ffeda0',
    '#fed976',
    '#feb24c',
    '#fd8d3c',
    '#fc4e2a',
    '#e31a1c',
    '#bd0026',
    '#800026',
  ];
}
