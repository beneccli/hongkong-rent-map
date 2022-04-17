import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { MonitoringPage } from './monitoring/monitoring.page';

const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'monitoring', component: MonitoringPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
