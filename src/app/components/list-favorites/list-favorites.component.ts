import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faDollarSign, faLocationDot, faRulerCombined, faTrainSubway } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-list-favorites',
  templateUrl: './list-favorites.component.html',
})
export class ListFavoritesComponent {
  @Input() priceRange = '15000-20000';
  @Input() location = 'hk';
  @Input() favoriteAdsIds: string[] = [];
  @Input() favoriteAds: Record<string, any> = {};
  @Output() addFavoriteAd = new EventEmitter<any>(true);
  @Output() removeFavoriteAd = new EventEmitter<any>(true);
  @Output() showFavorite = new EventEmitter<any>(true);

  faRulerCombined = faRulerCombined;
  faTrainSubway = faTrainSubway;
  faLocationDot = faLocationDot;
  faDollar = faDollarSign;

  public timeToString(time?: number) {
    return !time ? 'No data' : `${Math.round(time / 60)}min`;
  }

}
