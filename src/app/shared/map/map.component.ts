import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Expression, Map, Popup } from 'mapbox-gl';
import { ColorService } from '../../core/color.service';
import { DatePipe, DecimalPipe } from '@angular/common';

export interface MapData {
  code: string;
  value: number | undefined;
  details: {
    lastValueDate: Date | undefined;
    population: number | undefined;
    cases: number | undefined;
    tests: number | undefined;
    deaths: number | undefined;
    vaccinations: number | undefined;
    testPositivity: number | undefined;
  };
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnChanges, AfterViewInit {
  @ViewChild('map')
  private mapElement?: ElementRef;

  @Input()
  public data: MapData[] = [];

  @Output()
  public countryClick = new EventEmitter<string>();

  public minValue = 0;
  public maxValue = 0;

  private map?: Map;
  private hoveredStateId?: string | number;
  private popup?: Popup;

  constructor(
    private readonly colorService: ColorService,
    private readonly decimalPipe: DecimalPipe,
    private readonly datePipe: DatePipe,
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      this.addChoroplethColors(this.map);
    }
  }

  public ngAfterViewInit(): void {
    const map = new Map({
      accessToken:
        'pk.eyJ1Ijoic2ViYXN0aWFuaGFlbmkiLCJhIjoiY2trazNicGU0MjU5ZDJ3cXVuNnFmYnJicCJ9.yRciXaAVDpNh_rPvubne-A',
      container: this.mapElement?.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [17, 30],
      zoom: 1.5,
    });

    map.on('load', () => {
      this.addCountrySource(map);
      this.addChoroplethColors(map);
      this.addHoverStateTracking(map);
      this.addHoverPopup(map);
      this.addClickHandler(map);
      this.map = map;
    });
  }

  private addCountrySource(map: Map): void {
    // Add source for country polygons using the Mapbox Countries tileset
    // The polygons contain an ISO 3166 alpha-3 code which can be used to for joining the data
    // https://docs.mapbox.com/vector-tiles/reference/mapbox-countries-v1
    map.addSource('countries', {
      type: 'vector',
      url: 'mapbox://mapbox.country-boundaries-v1',
    });
  }

  private addChoroplethColors(map: Map): void {
    // Build a GL match expression that defines the color for every vector tile feature
    // Use the ISO 3166-1 alpha 3 code as the lookup key for the country shape
    const matchExpression: Expression = ['match', ['get', 'iso_3166_1_alpha_3']];

    // Calculate color values for each country
    const values = this.data
      .map((row) => row.value)
      .filter((v) => v != null && !isNaN(v) && Number.isFinite(v)) as number[];
    this.minValue = Math.min(...values);
    this.maxValue = Math.max(...values);
    const naDataColor = 'rgba(0, 0, 0, 1)';
    this.data.forEach((row) => {
      // Convert the range of data values to a suitable color
      const color =
        row.value === undefined || isNaN(row.value) || !Number.isFinite(row.value)
          ? naDataColor
          : this.colorService.getScalePaletteColor(row.value, this.minValue, this.maxValue);
      matchExpression.push(row.code, color);
    });

    // Last value is the default, used where there is no data
    matchExpression.push(naDataColor);

    // Remove layer first, in case this is an update
    if (map.getLayer('countries-fills')) {
      map.removeLayer('countries-fills');
    }

    if (this.data.length === 0) {
      return;
    }

    // Add layer from the vector tile source to create the choropleth
    // Insert it below the 'admin-1-boundary-bg' layer in the style
    map.addLayer(
      {
        'id': 'countries-fills',
        'type': 'fill',
        'source': 'countries',
        'source-layer': 'country_boundaries',
        'paint': {
          'fill-color': matchExpression,
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.5],
        },
      },
      'admin-1-boundary-bg',
    );
  }

  private addHoverStateTracking(map: Map): void {
    // When the user moves their mouse over the layer, we'll update the
    // feature state for the feature under the mouse.
    map.on('mousemove', 'countries-fills', (e) => {
      if (e.features?.length) {
        if (this.hoveredStateId) {
          this.setHoverState(map, false);
        }
        this.hoveredStateId = e.features[0].id;
        this.setHoverState(map, true);
      }
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map.on('mouseleave', 'countries-fills', () => {
      if (this.hoveredStateId) {
        this.setHoverState(map, false);
      }
      this.hoveredStateId = undefined;
    });
  }

  private setHoverState(map: Map, hover: boolean): void {
    map.setFeatureState(
      { source: 'countries', sourceLayer: 'country_boundaries', id: this.hoveredStateId },
      { hover },
    );
  }

  private addHoverPopup(map: Map): void {
    // Create a popup, but don't add it to the map yet.
    this.popup = new Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: '300px',
    });

    map.on('mousemove', 'countries-fills', (e) => {
      if (!e.features) {
        return;
      }
      map.getCanvas().style.cursor = 'pointer';
      const properties = e.features[0].properties as any;
      const countryData = this.data.find((c) => c.code === properties.iso_3166_1_alpha_3);
      const value = this.decimalPipe.transform(
        countryData?.value,
        // show at least one integer, and 0-1 decimal digits
        '1.0-1',
      );

      const list = `<table class="w-100">
<tr><td>Last date:</td><td class="text-end">${this.valueOrNA(
        this.datePipe.transform(countryData?.details?.lastValueDate),
      )}</td></tr>
<tr><td colspan="2"><hr></td></tr>
<tr><td>Population:</td><td class="text-end">${this.valueOrNA(
        this.decimalPipe.transform(countryData?.details?.population),
      )}</td></tr>
<tr><td>Cases:</td><td class="text-end">${this.valueOrNA(
        this.decimalPipe.transform(countryData?.details?.cases),
      )}</td></tr>
<tr><td>Fatalities:</td><td class="text-end">${this.valueOrNA(
        this.decimalPipe.transform(countryData?.details?.deaths),
      )}</td></tr>
<tr><td>Tests:</td><td class="text-end">${this.valueOrNA(
        this.decimalPipe.transform(countryData?.details?.tests),
      )}</td></tr>
<tr><td>Vaccinations:</td><td class="text-end">${this.valueOrNA(
        this.decimalPipe.transform(countryData?.details?.vaccinations),
      )}</td></tr>
<tr><td>Test Positivity:</td><td class="text-end">${this.valueOrNA(
        this.decimalPipe.transform(countryData?.details?.testPositivity, '1.2-2'),
      )}%</td></tr>
</table>`;

      this.popup
        ?.setLngLat(e.lngLat)
        .setHTML(`<h4>${properties.name_en}: ${this.valueOrNA(value)}</h4>${list}`)
        .addTo(map);
    });

    map.on('mouseleave', 'countries-fills', () => {
      map.getCanvas().style.cursor = '';
      this.popup?.remove();
    });
  }

  private addClickHandler(map: Map): void {
    map.on('click', 'countries-fills', (e) => {
      if (e.features) {
        this.countryClick.emit((e.features[0].properties as any).iso_3166_1_alpha_3);
      }
    });
  }

  private valueOrNA<T>(value: T | null): T | string {
    return value != null ? value : 'n/a';
  }
}
