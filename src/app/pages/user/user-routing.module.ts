import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { MapNewPage } from './pages/map-new/map-new.page';
import { MapPage } from './pages/map/map.page';
import { MyProfilePage } from './pages/my-profile/my-profile.page';
import { OverviewPage } from './pages/overview/overview.page';

const routes: Routes = [
  { path: ROUTER_UTILS.config.user.map, component: MapPage },
  { path: ROUTER_UTILS.config.user.mapNew, component: MapNewPage },
  { path: ROUTER_UTILS.config.user.profile, component: MyProfilePage },
  { path: ROUTER_UTILS.config.user.overview, component: OverviewPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
