import { NgModule } from '@angular/core';
import { ChartAnalysisPageComponent } from './chart-analysis-page/chart-analysis-page.component';
import { SharedModule } from '../shared/shared.module';
import { ChartOptionsComponent } from './chart-analysis-page/chart-options/chart-options.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterComponent } from './register/register.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { MapOptionsComponent } from './world-map/map-options/map-options.component';
import { WorldMapComponent } from './world-map/world-map.component';
import { PredictionOptionsComponent } from './chart-analysis-page/prediction-options/prediction-options.component';
import { DisplayOptionsComponent } from './chart-analysis-page/display-options/display-options.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { PredictionModelComponent } from './chart-analysis-page/prediction-model/prediction-model.component';
import { DataOptionsComponent } from './chart-analysis-page/data-options/data-options.component';
import { CountryDetailsComponent } from './world-map/country-details/country-details.component';

@NgModule({
  declarations: [
    ChartAnalysisPageComponent,
    ChartOptionsComponent,
    LoginPageComponent,
    RegisterComponent,
    ProfilePageComponent,
    MapOptionsComponent,
    WorldMapComponent,
    PredictionOptionsComponent,
    DisplayOptionsComponent,
    AboutPageComponent,
    PredictionModelComponent,
    DataOptionsComponent,
    CountryDetailsComponent,
  ],
  imports: [SharedModule],
})
export class PagesModule {}
