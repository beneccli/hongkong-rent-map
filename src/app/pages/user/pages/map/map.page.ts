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
}
