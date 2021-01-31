import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { Selection } from 'd3';
import { parseISO } from 'date-fns';

export type Datum = {
  value: number;
  date: string;
  upperBound?: number;
  lowerBound?: number;
  isChangePoint?: boolean;
};

export type LineConfig = {
  color: string;
  dashes: string;
  label: string;
  values: Datum[];
};

export type LineChartData = LineConfig[];

export type LineChartOptions = {
  scale: 'linear' | 'log';
  daysToLookBack: number;
  threshold?: number;
};

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnChanges {
  @Input()
  public data: LineChartData = [];

  @Input()
  public options!: LineChartOptions;

  @Input()
  public yLabel?: string;

  private width = 700;
  private height = 450;
  private margin = 30;

  public svg!: Selection<SVGSVGElement, unknown, null, undefined>;
  public svgInner!: Selection<SVGGElement, unknown, null, undefined>;
  public yScale!: d3.ScaleLinear<number, number>;
  public xScale!: d3.ScaleTime<number, number>;
  public xAxis!: Selection<SVGGElement, unknown, null, undefined>;
  public yAxis!: Selection<SVGGElement, unknown, null, undefined>;
  public lineGroups: any[] = [];
  public boundGroups: Selection<SVGPathElement, Datum[], null, undefined>[] = [];
  public changePoints?: Selection<SVGGElement, unknown, null, undefined>;

  private maxY = 0;

  constructor(public chartElem: ElementRef) {}

  public ngOnChanges(changes: SimpleChanges): void {
    d3.select(this.chartElem.nativeElement).select('.line-chart').select('svg').remove();

    if (this.data && this.data.length > 0) {
      this.initializeChart();
      this.drawChart();

      window.addEventListener('resize', () => this.drawChart());
    }
  }

  private initializeChart(): void {
    this.svg = d3
      .select(this.chartElem.nativeElement)
      .select('.line-chart')
      .append('svg')
      .attr('height', this.height);

    this.svgInner = this.svg
      .append('g')
      .style('transform', 'translate(' + this.margin + 'px, ' + this.margin + 'px)');

    const allValues = this.data.map((d) => d.values).flat();
    this.maxY = (d3.max(allValues, (d) => d.value) || 0) + 1;

    if (this.options.scale === 'linear') {
      this.yScale = d3
        .scaleLinear()
        .domain([this.maxY, 0])
        .range([0, this.height - 2 * this.margin]);
    } else if (this.options.scale === 'log') {
      this.yScale = d3
        .scaleLog()
        .domain([this.maxY, 1])
        .range([0, this.height - 2 * this.margin]);
    }

    this.yAxis = this.svgInner.append('g').style('transform', `translate(${this.margin}px,  0)`);

    const firstDates = this.data.map((s) => s.values.find((v) => !!v.date)?.date).filter(Boolean) as string[];
    const lastDates = this.data
      .map(
        (s) =>
          s.values
            .slice()
            .reverse()
            .find((v) => !!v.date)?.date,
      )
      .filter(Boolean) as string[];

    const domain = d3.extent([...firstDates, ...lastDates], (d) => parseISO(d)) as [Date, Date];
    this.xScale = d3.scaleTime().domain(domain);

    this.xAxis = this.svgInner
      .append('g')
      .attr('id', 'x-axis')
      .style('transform', `translate(0, ${this.height - 2 * this.margin}px)`);

    this.boundGroups = this.data
      .filter((line) => line.values.some((v) => v.upperBound != null && v.lowerBound != null))
      .map((line) =>
        this.svgInner
          .append('path')
          .datum(line.values)
          .attr('fill', '#0f5b6f')
          .attr('stroke', 'none')
          .style('fill-opacity', '.8'),
      );

    this.lineGroups = this.data.map((line) =>
      this.svgInner
        .append('g')
        .append('path')
        .style('fill', 'none')
        .style('stroke', line.color)
        .style('stroke-width', '2px')
        .style('stroke-dasharray', line.dashes),
    );

    this.changePoints = this.svgInner.append('g');
  }

  private drawChart(): void {
    this.width = this.chartElem.nativeElement.getBoundingClientRect().width;
    this.svg.attr('width', this.width);

    this.drawAxes();
    this.drawLines();
    this.drawBounds();
    this.drawTooltip();
    this.drawThresholdLine();

    // tslint:disable-next-line:no-string-literal
    if ((window as any)['prophectorShowChangePoints']) {
      // only draw change points when this variable is set
      this.drawChangePoints();
    }
  }

  private drawAxes(): void {
    this.xScale.range([this.margin, this.width - 2 * this.margin]);

    const xAxis = d3.axisBottom(this.xScale).ticks(10);

    this.xAxis.call(xAxis);

    const yAxis = d3.axisLeft(this.yScale);
    const yAxisSel = this.yAxis.call(yAxis);

    if (this.yLabel) {
      yAxisSel
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .style('fill', 'white')
        .text(this.yLabel);
    }
  }

  private drawLines(): void {
    this.data.forEach((lineConfig, i) => {
      const line = d3
        .line()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(d3.curveMonotoneX);

      const points: [number, number][] = lineConfig.values.map((d) => [
        this.xScale(new Date(d.date)),
        this.yScale(this.options.scale === 'log' ? Math.max(d.value, 1) : Math.max(d.value, 0)),
      ]);

      this.lineGroups[i].attr('d', line(points));
    });
  }

  private drawBounds(): void {
    const limit = (v: number | undefined) => Math.min(Math.max(v || 0, 0), this.maxY);
    this.data
      .filter((line) => line.values.some((v) => v.upperBound != null && v.lowerBound != null))
      .forEach((line, i) => {
        this.boundGroups[i].attr(
          'd',
          d3
            .area<Datum>()
            .x((d) => this.xScale(new Date(d.date)))
            .y0((d) => this.yScale(limit(d.lowerBound)))
            .y1((d) => this.yScale(limit(d.upperBound))),
        );
      });
  }

  private drawChangePoints(): void {
    this.changePoints?.selectAll('line').remove();
    this.data.forEach((d) =>
      d.values
        .filter((v) => v.isChangePoint)
        .forEach((v) => {
          const x = this.xScale(parseISO(v.date));
          this.changePoints
            ?.append('line')
            .style('stroke', 'red')
            .attr('y1', 0)
            .attr('y2', this.height - this.margin - this.margin)
            .attr('x1', x)
            .attr('x2', x);
        }),
    );
  }

  private drawTooltip(): void {
    const focus = this.svgInner.append('g').style('display', 'none');

    const tooltipLine = this.svgInner
      .append('line')
      .style('display', 'none')
      .attr('stroke', 'white')
      .attr('y1', 0)
      .attr('y2', this.height - this.margin - this.margin)
      .attr('x1', 0)
      .attr('x2', 0);

    const lineHeight = 18;
    const tooltipWidth = 250;
    const tooltipMargin = 10;
    focus
      .append('rect')
      .attr('class', 'chart-tooltip')
      .attr('width', tooltipWidth)
      .attr('height', 32 + this.data.length * lineHeight)
      .attr('x', tooltipMargin)
      .attr('y', -22)
      .style('fill', 'white')
      .style('stroke', 'white');

    focus.append('text').attr('class', 'tooltip-date').attr('x', 18).attr('y', -2);

    this.data.forEach((series, i) => {
      const y = lineHeight + i * lineHeight;
      focus.append('text').attr('class', `tooltip-value-${i}`).attr('x', 18).attr('y', y);
    });

    const bisectDate = d3.bisector<Datum, Date>((d) => new Date(d.date)).left;
    const dateFormatter = d3.timeFormat('%Y-%m-%d');

    this.svgInner
      .append('rect')
      .attr('class', 'overlay')
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .style('transform', 'translate(' + this.margin + 'px, 0)')
      .attr('width', this.width - this.margin - this.margin - this.margin)
      .attr('height', this.height - this.margin - this.margin)
      .on('mouseout', () => {
        focus.style('display', 'none');
        tooltipLine.style('display', 'none');
      })
      .on('mousemove', (event) => {
        const pointerX = d3.pointer(event)[0] + this.margin;
        const pointerY = d3.pointer(event)[1] - this.margin;
        const x0 = new Date(this.xScale.invert(pointerX));

        let boxX = pointerX;
        if (pointerX > this.width - tooltipWidth - this.margin - this.margin) {
          boxX -= tooltipWidth + tooltipMargin + tooltipMargin;
        }

        focus.style('display', null).attr('transform', `translate(${boxX}, ${pointerY})`);

        this.data.forEach((series, index) => {
          const i = bisectDate(series.values, x0, 1);
          if (series.values[i]?.date) {
            focus.select('.tooltip-date').text(dateFormatter(new Date(series.values[i]?.date)));
          }

          const precision =
            Math.floor(series.values[i]?.value) === series.values[i]?.value
              ? 0
              : Math.min(2, series.values[i]?.value.toString().split('.')[1].length) || 0;
          const formatValue = d3.format(`,.${Math.min(2, precision)}f`);

          const formattedValue = series.values[i]?.value ? formatValue(series.values[i]?.value) : 'n/a';
          focus.select(`.tooltip-value-${index}`).text(`${series.label}: ${formattedValue}`);
        });

        tooltipLine.style('display', null).attr('x1', pointerX).attr('x2', pointerX);
      });
  }

  private drawThresholdLine(): void {
    if (this.options.threshold === undefined) {
      return;
    }
    const y = this.yScale(this.options.threshold);
    this.svgInner
      .append('line')
      .attr('stroke', 'red')
      .attr('y1', y)
      .attr('y2', y)
      .attr('x1', this.margin)
      .attr('x2', this.width - this.margin - this.margin);
  }
}
