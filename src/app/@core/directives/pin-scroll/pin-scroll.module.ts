import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PinScrollDirective } from './pin-scroll.directive';

@NgModule({
  declarations: [PinScrollDirective],
  imports: [CommonModule],
  exports: [PinScrollDirective],
})
export class PinScrollModule {}
