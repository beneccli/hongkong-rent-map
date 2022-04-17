import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapComponent } from '@components/map/map.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'ng2-tooltip-directive-ng13fix';
import { HomeRoutingModule } from './home-routing.module';
import { HomePage } from './home/home.page';
import { MonitoringPage } from './monitoring/monitoring.page';
@NgModule({
  declarations: [HomePage, MapComponent, MonitoringPage],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    GoogleMapsModule,
    FontAwesomeModule,
    TooltipModule,
  ],
})
export class HomeModule {}
