import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapNewPage } from './pages/map-new/map-new.page';
import { MapPage } from './pages/map/map.page';
import { MyProfilePage } from './pages/my-profile/my-profile.page';
import { OverviewPage } from './pages/overview/overview.page';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [MyProfilePage, OverviewPage, MapPage, MapNewPage],
  imports: [CommonModule, UserRoutingModule, GoogleMapsModule, LeafletModule, FormsModule],
})
export class UserModule {}
