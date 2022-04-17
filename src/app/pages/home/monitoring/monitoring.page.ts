import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '@env/environment';
import { catchError, lastValueFrom, of } from 'rxjs';

@Component({
  templateUrl: './monitoring.page.html',
})
export class MonitoringPage {
  public priceRange = '15000-20000';
  public location = 'hk';
  public isLoading = false;
  public stateMessage = '';

  constructor(private http: HttpClient) {}

  public refreshRentList() {
    this.stateMessage = 'Refreshing rent list...';
    this.http
      .get(
        environment.apiUrl +
        '/refresh-rent-list' +
        '?location=' + this.location +
        '&priceRange=' + this.priceRange
      )
      .subscribe((response) => {
        this.stateMessage = 'Rent list has been refreshed!';
      });
  }

  public updateAddresses() {
    this.stateMessage = 'Updating addresses...';
    this.http
      .get<any[]>(
        environment.apiUrl +
        '/update-addresses' +
        '?location=' + this.location +
        '&priceRange=' + this.priceRange
      )
      .subscribe((updatedRecords) => {
        this.stateMessage = `Addresses have been updated for ${updatedRecords.length} records.`;
      });
  }

  public updateCoordinates() {
    this.stateMessage = 'Updating records\' coordinates...';
    this.http
      .get<any[]>(
        environment.apiUrl +
        '/update-coordinates' +
        '?location=' + this.location +
        '&priceRange=' + this.priceRange
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

  public updateTravelTime() {
    this.stateMessage = 'Updating records\' work travel time...';
    this.http
      .get<any[]>(
        environment.apiUrl +
        '/update-work-travel-time' +
        '?location=' + this.location +
        '&priceRange=' + this.priceRange
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

  private delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  public async removeUnavailableAds() {
    let nbOfProcessedAds = 1;

    while (nbOfProcessedAds != 0) {
      this.stateMessage = 'Removing unavailable records...';
      const request$ = this.http
        .get<any[]>(`${environment.apiUrl}/remove-unavailable-ads`)
        .pipe(catchError((err) => of(err.error.message)));
      const result = await lastValueFrom(request$);
      if (Array.isArray(result)) {
        nbOfProcessedAds = result.length;
        const nbOfRemovedAds = result.filter((e) => e.shouldBeRemoved).length;
        this.stateMessage = `${nbOfProcessedAds} records have been processed, ${nbOfRemovedAds} have been removed.`;
      } else {
        this.stateMessage = result;
      }
      await this.delay(3000);
    }
  }

}
