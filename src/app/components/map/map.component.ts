import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { environment } from '@env/environment';
import { faHashtag, faHeart, faHeartCircleCheck, faHeartCrack, faRulerCombined, faTrainSubway, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, catchError, combineLatest, debounceTime, delay, filter, of, Subject } from 'rxjs';

enum MarkerType {
  Ad,
  Group,
}

interface IMarker {
  position: google.maps.LatLngLiteral;
  type: MarkerType;
  data: any;
};

interface Criteria {
  priceRange: string;
  location: string;
  onlyRecent: boolean;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
})
export class MapComponent {
  @ViewChild(MapInfoWindow) infoWindow?: MapInfoWindow;
  @Input() set priceRange(value: string) {
    this._priceRange = value;
    this.pushCriteria();
  }
  @Input() set location(value: string) {
    this._location = value;
    this.pushCriteria();
  }
  @Input() set onlyRecent(value: boolean) {
    this._onlyRecent = value;
    this.pushCriteria();
  }
  @Input() set showAd(record: any) {
    record && this.newShowRecord$.next(record);
  }
  @Input() favoriteAdsIds: string[] = [];
  @Input() favoriteAds: Record<string, any> = {};

  @Output() actionAdd = new EventEmitter<void>(true);
  @Output() actionRemove = new EventEmitter<void>(true);
  @Output() addFavoriteAd = new EventEmitter<any>(true);
  @Output() removeFavoriteAd = new EventEmitter<any>(true);

  faTrainSubway = faTrainSubway;
  faRulerCombined = faRulerCombined;
  faUpRightFromSquare = faUpRightFromSquare;
  faHashtag = faHashtag;
  faHeart = faHeart;
  faHeartCrack = faHeartCrack;
  faHeartCircleCheck = faHeartCircleCheck;
  MarkerType = MarkerType;

  private criteria$: Subject<Criteria>  = new Subject();
  private newShowRecord$: Subject<any>  = new Subject();
  private requestComplete$: Subject<boolean>  = new Subject();
  private _priceRange = '15000-20000';
  private _location = 'hk';
  private _onlyRecent = false;

  public stateMessage = '';
  public records$ = new BehaviorSubject<any>([]);
  public markerOptions: google.maps.MarkerOptions = {draggable: false, clickable: true};
  public markerPositions: google.maps.LatLngLiteral[] = [];
  public markers: IMarker[] = [];
  public currentMarker: any;
  private mapStyle: any = window?.matchMedia('(prefers-color-scheme: dark)').matches ? [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative.country","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative.country","elementType":"labels.text","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative.province","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":"-100"},{"lightness":"30"}]},{"featureType":"administrative.neighborhood","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"simplified"},{"gamma":"0.00"},{"lightness":"74"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"lightness":"3"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}] : undefined;
  public options: google.maps.MapOptions = {
    center: {lat: 22.3193, lng: 114.1694},
    zoom: 13,
    styles: this.mapStyle
  };
  private icons = {
    blue: 'https://res.cloudinary.com/dmhcgihwc/image/upload/v1649938692/samples/blue-rect_dvvzqy.png',
    red: 'https://res.cloudinary.com/dmhcgihwc/image/upload/v1650051640/samples/red-rect_bny1ch.png',
    orange: 'https://res.cloudinary.com/dmhcgihwc/image/upload/v1650051640/samples/orange-rect_muv5d8.png',
    yellow: 'https://res.cloudinary.com/dmhcgihwc/image/upload/v1650051640/samples/yellow-rect_j7pc4q.png',
    green: 'https://res.cloudinary.com/dmhcgihwc/image/upload/v1650051640/samples/green-rect_q4j5qe.png',
    gray: 'https://res.cloudinary.com/dmhcgihwc/image/upload/v1650385555/samples/gray-rect_rzai8x.png',
    black: 'https://res.cloudinary.com/dmhcgihwc/image/upload/v1650385555/samples/black-rect_taftow.png'
  };

  private mapMarkers: Record<string, MapMarker> = {};

  constructor(private http: HttpClient) {
    this.records$
      .subscribe((records) => {
        this.markers = this.groupMarkersWithSamePosition(records);
      });
    this.favoriteAdsIds = JSON.parse(localStorage.getItem('favoriteAdsIds') || '[]');
    this.favoriteAds = JSON.parse(localStorage.getItem('favoriteAds') || '{}');
    this.criteria$
      .pipe(debounceTime(200))
      .subscribe((criteria: Criteria) => {
        this.retrieveRecords(criteria.location, criteria.priceRange, criteria.onlyRecent);
      });

    combineLatest([
      this.requestComplete$,
      this.newShowRecord$
    ])
      .pipe(
        delay(500),
        filter(([ requestComplete, ]) => requestComplete),
      )
      .subscribe(([ , record ]) => {
        const marker = this.markers.find((marker) => {
          if (marker.type === MarkerType.Ad) {
            return marker.data.id === record.id;
          } else {
            return !!marker.data.find((ad: any) => ad.id === record.id);
          }
        });

        if (marker) {
          this.currentMarker = marker;
          this.infoWindow?.open(this.mapMarkers[record.id]);
        }
      });
  }

  private pushCriteria(): void {
    this.criteria$.next({
      location: this._location,
      priceRange: this._priceRange,
      onlyRecent: this._onlyRecent,
    });
  }

  public addMapMarker(marker: any, mapMarker: MapMarker): void {
    if (marker.type === MarkerType.Ad) {
      this.mapMarkers[marker.data.id] = mapMarker;
    } else {
      for (const singleMarker of marker.data) {
        this.mapMarkers[singleMarker.id] = mapMarker;
      }
    }
  }

  public toggleFavorite(record: any): void {
    if (this.isAdFavorite(record.id)) {
      console.log('sohuld be removing: ' + record.id);
      this.removeFavoriteAd.emit(record.id);
    } else {
      this.addFavoriteAd.emit(record);
    }
  }

  public isAdFavorite(id: string): boolean {
    return !!this.favoriteAdsIds.find((e) => e === id);
  }

  private groupMarkersWithSamePosition(records: any[]) {
    return records
      .filter((record: any) => record.coordinates)
      .map((record: any) => {
        return {
          position: {lat: record.coordinates.lat, lng: record.coordinates.lon},
          type: MarkerType.Ad,
          data: record
        };
      })
      .reduce((acc: any[], record: any) => {
        const index: number = acc.findIndex((e) =>
          e.position.lat === record.position.lat &&
          e.position.lng === record.position.lng
        );

        if (index >= 0) {
          if (acc[index].type === MarkerType.Ad) {
            acc[index].type = MarkerType.Group;
            acc[index].data = [acc[index].data, record.data];
          } else {
            acc[index].data = [...acc[index].data, record.data];
          }
        } else {
          acc = [...acc, record];
        }

        return acc;
      }, []);
  }

  openInfoWindow(mapMarker: MapMarker, marker: any) {
    this.currentMarker = marker;
    this.infoWindow?.open(mapMarker);
  }

  public findLabel(marker: IMarker): string {
    return marker.type === MarkerType.Group
      ? marker.data.length.toString()
      : this.transformPrice(marker.data.price);
  }

  public transformPrice(price: number): string {
    const text = price?.toString();
    return isNaN(+text) ? text : (parseInt(text)/1000).toString().substring(0,4) + 'K';
  }

  public retrieveRecords(location?: string, priceRange?: string, onlyRecent?: boolean) {
    this.actionAdd.emit();
    this.stateMessage = 'Retrieving records...';
    this.requestComplete$.next(false);
    this.http
      .get<any[]>(
        environment.apiUrl +
        '/get-rent-list' +
        '?location=' + (location || this._location) +
        '&priceRange=' + (priceRange || this._priceRange) +
        '&recent=' + (onlyRecent || this._onlyRecent)
      )
      .pipe(catchError((err) => of(err.message)))
      .subscribe((result) => {
        this.actionRemove.emit();
        if (Array.isArray(result)) {
          this.records$.next(result);
          this.requestComplete$.next(true);
          this.stateMessage = `${result.length} records have been retrieved.`;
        } else {
          this.stateMessage = result;
        }
      });
  }

  public openUrl(url: string) {
    window?.open(url, '_blank')?.focus();
  }

  public timeToString(time?: number) {
    return !time ? 'No data' : `${Math.round(time / 60)}min`;
  }

  public findMarkerIcon(marker: any) {
    if (marker.type === MarkerType.Group) {
      return this.icons.black;
    } else if (marker.data.workTravelTime < 20*60) {
      return this.icons.green;
    } else if (marker.data.workTravelTime <= 40*60) {
      return this.icons.yellow;
    } else if (marker.data.workTravelTime <= 60*60) {
      return this.icons.orange;
    } else if (marker.data.workTravelTime > 60*60) {
      return this.icons.red;
    } else {
      return this.icons.gray;
    }
  }

  public findMarkerColor(marker: any) {
    if (marker.type === MarkerType.Group) {
      return 'white';
    } else if (marker.data.workTravelTime < 40*60) {
      return 'black';
    } else {
      return 'white';
    }
  }

  public isNewAd(marker: any): boolean {
    const today: Date = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const threeDaysAgoTimestamp: number = today.getTime() - (3*24*60*60*1000);
    const markerDateTimestamp: number = new Date(marker.data.createdDate).getTime();
    return markerDateTimestamp > threeDaysAgoTimestamp;
  }

  public diffDate(marker: any): string {
    if (marker.type === MarkerType.Ad) {
      const todayTimestamp: number = (new Date()).getTime();
      const markerDateTimestamp: number = new Date(marker.data.createdDate).getTime();
      const diffTimestamp = todayTimestamp - markerDateTimestamp;
      return Math.ceil(diffTimestamp/86400000) + ' days ago';
    }

    return '';
  }

}
