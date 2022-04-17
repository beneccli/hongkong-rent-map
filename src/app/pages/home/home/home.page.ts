import { Component } from '@angular/core';
import { ThemeList, ThemeService } from '@core/services/theme';
import { ROUTER_UTILS } from '@core/utils/router.utils';

@Component({
  templateUrl: './home.page.html',
})
export class HomePage {
  path = ROUTER_UTILS.config;
  theme = ThemeList

  public priceRange = '15000-20000';
  public location = 'hk';
  public isLoading = false;
  private nbProcessingActions = 0;

  constructor(private themeService: ThemeService) {}

  onClickChangeTheme(theme: ThemeList): void {
    this.themeService.setTheme(theme);
  }

  onActionAdd() {
    this.nbProcessingActions += 1;
    this.isLoading = true;
  }

  onActionRemove() {
    this.nbProcessingActions -= 1;
    if (this.nbProcessingActions === 0) {
      this.isLoading = false;
    }
  }
}
