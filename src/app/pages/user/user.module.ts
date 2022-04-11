import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapPage } from './pages/map/map.page';
import { MyProfilePage } from './pages/my-profile/my-profile.page';
import { OverviewPage } from './pages/overview/overview.page';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [MyProfilePage, OverviewPage, MapPage],
  imports: [CommonModule, UserRoutingModule, GoogleMapsModule, LeafletModule],
})
export class UserModule {}
