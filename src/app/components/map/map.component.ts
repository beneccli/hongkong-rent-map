import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { environment } from '@env/environment';
import { faRulerCombined, faTrainSubway, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, catchError, of } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
})
export class MapComponent {
  @ViewChild(MapInfoWindow) infoWindow?: MapInfoWindow;
  @Input() set priceRange(value: string) {
    this._priceRange = value;
    this.retrieveRecords();
  }
  @Input() set location(value: string) {
    this._location = value;
    this.retrieveRecords();
  }

  @Output() actionAdd = new EventEmitter<void>(true);
  @Output() actionRemove = new EventEmitter<void>(true);

  faTrainSubway = faTrainSubway;
  faRulerCombined = faRulerCombined;
  faUpRightFromSquare = faUpRightFromSquare;

  private _priceRange = '15000-20000';
  private _location = 'hk';

  public stateMessage = '';
  public records = new BehaviorSubject<any>([]);
  public markerOptions: google.maps.MarkerOptions = {draggable: false, clickable: true};
  public markerPositions: google.maps.LatLngLiteral[] = [];
  public markers: {position: google.maps.LatLngLiteral, url: string, price: string | null | undefined}[] = [];
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
    green: 'https://res.cloudinary.com/dmhcgihwc/image/upload/v1650051640/samples/green-rect_q4j5qe.png'
  };

  constructor(private http: HttpClient) {
    this.records
      .subscribe((records) => {
        this.markers = records
          .filter((record: any) => record.coordinates)
          .map((record: any) => {
            return {
              url: record.detailUrl,
              position: {lat: record.coordinates.lat, lng: record.coordinates.lon},
              ...record
            };
            // return L
            //   .marker([record.coordinates.lat, record.coordinates.lon], { icon: this.generateIcon(record.price) })
            //   .on('mousedown', () => window?.open(record.detailUrl, '_blank')?.focus());
          })
      });
  }

  openInfoWindow(mapMarker: MapMarker, marker: any) {
    this.currentMarker = marker;
    this.infoWindow?.open(mapMarker);
  }

  public transformPrice(price: any) {
    const text = price?.toString();
    return isNaN(+text) ? text : (parseInt(text)/1000).toString().substring(0,4) + 'K';
  }

  public retrieveRecords(location?: string, priceRange?: string) {
    this.actionAdd.emit();
    this.stateMessage = 'Retrieving records...';
    this.http
      .get<any[]>(
        environment.apiUrl +
        '/get-rent-list' +
        '?location=' + (location || this._location) +
        '&priceRange=' + (priceRange || this._priceRange)
      )
      .pipe(catchError((err) => of(err.message)))
      .subscribe((result) => {
        this.actionRemove.emit();
        if (Array.isArray(result)) {
          this.records.next(result);
          this.stateMessage = `${result.length} records have been retrieved.`;
        } else {
          this.stateMessage = result;
        }
      });
  }

  public openUrl(url: string) {
    console.log('opening: ' + url);
    window?.open(url, '_blank')?.focus();
  }

  public timeToString(time?: number) {
    return !time ? '' : `${Math.round(time / 60)}min`;
  }

  public findMarkerIcon(marker: any) {
    if (marker.workTravelTime < 20*60) {
      return this.icons.green;
    } else if (marker.workTravelTime < 40*60) {
      return this.icons.yellow;
    } else if (marker.workTravelTime < 60*60) {
      return this.icons.orange;
    } else {
      return this.icons.red;
    }
  }

  public findMarkerColor(marker: any) {
    if (marker.workTravelTime < 40*60) {
      return 'black';
    } else {
      return 'white';
    }
  }

  public isNewAd(marker: any): boolean {
    const today: Date = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const threeDaysAgoTimestamp: number = today.getTime() - (3*24*60*60*1000);
    const markerDateTimestamp: number = new Date(marker.createdDate).getTime();
    return markerDateTimestamp > threeDaysAgoTimestamp;
  }

  public diffDate(marker: any): number {
    const todayTimestamp: number = (new Date()).getTime();
    const markerDateTimestamp: number = new Date(marker.createdDate).getTime();
    const diffTimestamp = todayTimestamp - markerDateTimestamp;
    return Math.ceil(diffTimestamp/86400000);
  }

}
