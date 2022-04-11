import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '@env/environment';
import * as L from 'leaflet';
import { BehaviorSubject, catchError, of } from 'rxjs';

@Component({
  templateUrl: './map.page.html',
})
export class MapPage {
  public stateMessage = '';
  public records = new BehaviorSubject<any>([]);
  public markers = [];
  public options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 13,
    center: L.latLng(22.3193, 114.1694)
  };

  constructor(private http: HttpClient) {
    this.retrieveRecords();
    this.records
      .subscribe((records) => {
        this.markers = records
          .filter((record: any) => record.coordinates)
          .map((record: any) => {
            return L
              .marker([record.coordinates.lat, record.coordinates.lon], { icon: this.generateIcon(record.price) })
              .on('mousedown', () => window?.open('https://youtube.com', '_blank')?.focus());
          })
      });
  }

  private generateIcon(text: string): L.Icon {
    return L.icon({
      iconUrl: `https://api.geoapify.com/v1/icon/?type=circle&color=red&size=x-large&icon=cloud&iconType=awesome&text=${text}&textSize=small&noWhiteCircle&apiKey=0d16f52d3089433ea9ae026b69c79114`,
      // iconUrl: `https://api.geoapify.com/v1/icon?size=xx-large&type=awesome&color=%233e9cfe&icon=paw&apiKey=0d16f52d3089433ea9ae026b69c79114`,
      iconSize: [40, 30], // size of the icon
      iconAnchor: [15.5, 42], // point of the icon which will correspond to marker's location
      popupAnchor: [0, -45] // point from which the popup should open relative to the iconAnchor
    });
  }

  public onMapReady(map: L.Map) {
    L.marker([46.879966, -121.726909], { icon: this.generateIcon('13k') })
      .addTo(map)
      .on('mousedown', () => window?.open('https://youtube.com', '_blank')?.focus());

    L.marker([46.889966, -121.726909], { icon: this.generateIcon('17k') })
      .addTo(map)
      .on('mousedown', () => window?.open('https://google.com', '_blank')?.focus());

  }

  public refreshRentList() {
    this.stateMessage = 'Refreshing rent list...';
    this.http
      .get(environment.apiUrl + '/refresh-rent-list')
      .subscribe((response) => {
        this.stateMessage = 'Rent list has been refreshed!';
      });
  }

  public updateAddresses() {
    this.stateMessage = 'Updating addresses...';
    this.http
      .get<any[]>(environment.apiUrl + '/update-addresses')
      .subscribe((updatedRecords) => {
        this.stateMessage = `Addresses have been updated for ${updatedRecords.length} records.`;
      });
  }

  public retrieveRecords() {
    this.stateMessage = 'Retrieving records...';
    this.http
      .get<any[]>(environment.apiUrl + '/get-rent-list')
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

  public updateCoordinates() {
    this.stateMessage = 'Updating records\' coordinates...';
    this.http
      .get<any[]>(environment.apiUrl + '/update-coordinates')
      .pipe(catchError((err) => of(err.error.message)))
      .subscribe((result) => {
        if (Array.isArray(result)) {
          this.stateMessage = `${result.length} records have seen their coordinates being updated.`;
        } else {
          this.stateMessage = result;
        }
      });
  }
}
