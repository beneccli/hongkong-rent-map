import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { RouterModule } from '@angular/router';
import { MapComponent } from '@components/map/map.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'ng2-tooltip-directive-ng13fix';
import { HomePage } from './home.page';

@NgModule({
  declarations: [HomePage, MapComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage,
        data: {
          title: 'Home',
          description:
            'Angular starter for enterprise-grade front-end projects, built under a clean architecture that helps to scale and maintain a fast workflow.',
          robots: 'index, follow',
        },
      },
    ]),
    FormsModule,
    GoogleMapsModule,
    FontAwesomeModule,
    TooltipModule,
  ],
})
export class HomeModule {}
