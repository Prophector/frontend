import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MapComponent } from './map/map.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NumberOnlyDirective } from './number-only.directive';
import { LineChartComponent } from './line-chart/line-chart.component';
import { AccordionItemComponent } from './accordion-item/accordion-item.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FooterComponent } from './footer/footer.component';
import { DpDatePickerModule } from 'ng2-date-picker';
import { TooltipDirective } from './tooltip.directive';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule, DpDatePickerModule],
  declarations: [
    MapComponent,
    HeaderComponent,
    NumberOnlyDirective,
    LineChartComponent,
    AccordionItemComponent,
    FooterComponent,
    TooltipDirective,
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MapComponent,
    FontAwesomeModule,
    DpDatePickerModule,
    HeaderComponent,
    NumberOnlyDirective,
    LineChartComponent,
    AccordionItemComponent,
    FooterComponent,
    TooltipDirective,
  ],
  providers: [DecimalPipe, DatePipe],
})
export class SharedModule {}
