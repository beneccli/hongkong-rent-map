import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  templateUrl: './map.page.html',
})
export class MapPage {
  constructor(private http: HttpClient) {
    this.http
      .get(environment.apiUrl + '/get-rent-list')
      .subscribe((response) => {
        console.log('response');
        console.log(response);
      });
  }
}
