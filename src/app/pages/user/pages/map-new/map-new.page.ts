import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { environment } from '@env/environment';
import * as L from 'leaflet';
import { BehaviorSubject, catchError, of } from 'rxjs';

@Component({
  templateUrl: './map-new.page.html',
})
export class MapNewPage {
  @ViewChild(MapInfoWindow) infoWindow?: MapInfoWindow;

  public stateMessage = '';
  public records = new BehaviorSubject<any>([]);
  // public markers = [];
  public location$ = new BehaviorSubject<string>('hk');
  public priceRange$ = new BehaviorSubject<string>('15000-20000');
  public markerOptions: google.maps.MarkerOptions = {draggable: false, clickable: true};
  public markerPositions: google.maps.LatLngLiteral[] = [];
  public markers: {position: google.maps.LatLngLiteral, url: string, price: string | null | undefined}[] = [];
  public currentPrice: number | string = '';
  public currentPicture: { thumbnail: string, total: number } = { thumbnail: '', total: 0 };
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
    this.location$.subscribe((location) => this.retrieveRecords(location));
    this.priceRange$.subscribe(() => this.retrieveRecords());
  }

  openInfoWindow(mapMarker: MapMarker, marker: any) {
    console.log('marker');
    console.log(marker);
    this.currentPrice = marker.price;
    this.currentPicture = marker.picture;
    this.currentMarker = marker;
    this.infoWindow?.open(mapMarker);
  }

  public transformPrice(price: any) {
    const text = price?.toString();
    return isNaN(+text) ? text : (parseInt(text)/1000).toString().substring(0,4) + 'K';
  }

  private generateIcon(text: string, color?: string): L.Icon {
    const transformedPrice = isNaN(+text) ? text : (parseInt(text)/1000).toString().substring(0,4) + 'K';
    return L.icon({
      iconUrl: `https://api.geoapify.com/v1/icon/?type=awesome&color=${color || 'red' }&size=x-large&icon=cloud&iconType=awesome&text=${transformedPrice}&textSize=small&noWhiteCircle&apiKey=0d16f52d3089433ea9ae026b69c79114`,
      // iconUrl: `https://api.geoapify.com/v1/icon?size=xx-large&type=awesome&color=%233e9cfe&icon=paw&apiKey=0d16f52d3089433ea9ae026b69c79114`,
      iconSize: [40, 40], // size of the icon
      iconAnchor: [15.5, 42], // point of the icon which will correspond to marker's location
      popupAnchor: [0, -45] // point from which the popup should open relative to the iconAnchor
    });
  }

  public onMapReady(map: L.Map) {
    // L.marker([46.879966, -121.726909], { icon: this.generateIcon('13k') })
    //   .addTo(map)
    //   .on('mousedown', () => window?.open('https://youtube.com', '_blank')?.focus());

    L.marker([22.276899, 114.16795195527641], { icon: this.generateIcon('SG', 'blue') }).addTo(map);
  }

  public refreshRentList(location?: string, priceRange?: string) {
    this.stateMessage = 'Refreshing rent list...';
    this.http
      .get(
        environment.apiUrl +
        '/refresh-rent-list' +
        '?location=' + (location || this.location$.getValue()) +
        '&priceRange=' + (priceRange || this.priceRange$.getValue())
      )
      .subscribe((response) => {
        this.stateMessage = 'Rent list has been refreshed!';
      });
  }

  public updateAddresses(location?: string, priceRange?: string) {
    this.stateMessage = 'Updating addresses...';
    this.http
      .get<any[]>(
        environment.apiUrl +
        '/update-addresses' +
        '?location=' + (location || this.location$.getValue()) +
        '&priceRange=' + (priceRange || this.priceRange$.getValue())
      )
      .subscribe((updatedRecords) => {
        this.stateMessage = `Addresses have been updated for ${updatedRecords.length} records.`;
      });
  }

  public retrieveRecords(location?: string, priceRange?: string) {
    this.stateMessage = 'Retrieving records...';
    this.http
      .get<any[]>(
        environment.apiUrl +
        '/get-rent-list' +
        '?location=' + (location || this.location$.getValue()) +
        '&priceRange=' + (priceRange || this.priceRange$.getValue())
      )
      .pipe(catchError((err) => of(err.message)))
      .subscribe((result) => {
        if (Array.isArray(result)) {
          this.records.next(result);
          this.stateMessage = `${result.length} records have been retrieved.`;
        } else {
          this.stateMessage = result;
        }
      });
  }

  public updateCoordinates(location?: string, priceRange?: string) {
    this.stateMessage = 'Updating records\' coordinates...';
    this.http
      .get<any[]>(
        environment.apiUrl +
        '/update-coordinates' +
        '?location=' + (location || this.location$.getValue()) +
        '&priceRange=' + (priceRange || this.priceRange$.getValue())
      )
      .pipe(catchError((err) => of(err.error.message)))
      .subscribe((result) => {
        if (Array.isArray(result)) {
          this.stateMessage = `${result.length} records have seen their coordinates being updated.`;
        } else {
          this.stateMessage = result;
        }
      });
  }

  public updateTravelTime(location?: string, priceRange?: string) {
    this.stateMessage = 'Updating records\' work travel time...';
    this.http
      .get<any[]>(
        environment.apiUrl +
        '/update-work-transit-time' +
        '?location=' + (location || this.location$.getValue()) +
        '&priceRange=' + (priceRange || this.priceRange$.getValue())
      )
      .pipe(catchError((err) => of(err.error.message)))
      .subscribe((result) => {
        if (Array.isArray(result)) {
          this.stateMessage = `${result.length} records have seen their travel time being updated.`;
        } else {
          this.stateMessage = result;
        }
      });
  }

  public onNewLocation(event?: any) {
    this.location$.next(event.target.value);
  }

  public onNewPriceRange(event?: any) {
    this.priceRange$.next(event.target.value);
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

}
