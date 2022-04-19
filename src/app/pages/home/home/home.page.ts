import { Component } from '@angular/core';
import { ThemeList } from '@core/services/theme';
import { ROUTER_UTILS } from '@core/utils/router.utils';

@Component({
  templateUrl: './home.page.html',
})
export class HomePage {
  path = ROUTER_UTILS.config;
  theme = ThemeList

  public priceRange = '15000-20000';
  public location = 'hk';
  public favoriteAdsIds: string[] = [];
  public favoriteAds: Record<string, any> = {};
  public showAd: any = undefined;

  public isLoading = false;
  private nbProcessingActions = 0;

  constructor() {
    this.favoriteAdsIds = JSON.parse(localStorage.getItem('favoriteAdsIds') || '[]');
    this.favoriteAds = JSON.parse(localStorage.getItem('favoriteAds') || '{}');
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

  public onAddFavoriteAdsId(record: any): void {
    this.favoriteAdsIds.push(record.id);
    this.favoriteAds[record.id] = { criteria: { location: this.location, priceRange: this.priceRange }, data: record };
    localStorage.setItem('favoriteAdsIds', JSON.stringify(this.favoriteAdsIds));
    localStorage.setItem('favoriteAds', JSON.stringify(this.favoriteAds));
  }

  public onRemoveFavoriteAdsId(id: any): void {
    this.favoriteAdsIds = this.favoriteAdsIds.filter((e) => e !== id);
    this.favoriteAds[id] = undefined;
    localStorage.setItem('favoriteAdsIds', JSON.stringify(this.favoriteAdsIds));
    localStorage.setItem('favoriteAds', JSON.stringify(this.favoriteAds));
  }

  public onShowFavorite(record: any): void {
    if (record?.criteria?.priceRange && record?.criteria?.location) {
      this.priceRange = record.criteria.priceRange;
      this.location = record.criteria.location;
      this.showAd = record.data;
    } else {
      console.error('Criteria not available for given favorite');
    }
  }
}
