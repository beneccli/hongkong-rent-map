import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  templateUrl: './map.page.html',
})
export class MapPage {
  public stateMessage = '';

  constructor(private http: HttpClient) {
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
      .subscribe((records) => {
        console.log('records:');
        console.log(records);
        this.stateMessage = `${records.length} records have been retrieved.`;
      });
  }
}
