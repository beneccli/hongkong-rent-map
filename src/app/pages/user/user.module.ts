import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MapPage } from './pages/map/map.page';
import { MyProfilePage } from './pages/my-profile/my-profile.page';
import { OverviewPage } from './pages/overview/overview.page';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [MyProfilePage, OverviewPage, MapPage],
  imports: [CommonModule, UserRoutingModule],
})
export class UserModule {}
