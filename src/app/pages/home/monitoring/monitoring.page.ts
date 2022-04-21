import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '@env/environment';
import { catchError, lastValueFrom, of } from 'rxjs';
import { formatDate } from '../utils/formatDate';

enum MessageLogType {
  Default,
  Primary,
  Error
}
interface MessageLog {
  text: string;
  datetime: Date;
  type?: MessageLogType;
}

@Component({
  templateUrl: './monitoring.page.html',
})
export class MonitoringPage {
  formatDate = formatDate;
  MessageLogType = MessageLogType;

  public priceRange = '15000-20000';
  public location = 'hk';
  public offset = 0;
  public isLoading = false;
  public stateMessage = '';
  public listMessages: MessageLog[] = [];

  constructor(private http: HttpClient) {}

  public async refreshRentList(location?: string, priceRange?: string, offset?: number) {
    this.listMessages.push({
      text: 'Starting refreshing rent list',
      datetime: new Date(),
      type: MessageLogType.Primary,
    });
    this.http
    const request$ = this.http.get(
      environment.apiUrl +
      '/refresh-rent-list' +
      '?location=' + (location || this.location) +
      '&priceRange=' + (priceRange || this.priceRange) +
      '&offset=' + (offset || this.offset)
    );
    await lastValueFrom(request$);
    this.listMessages.push({
      text: 'Finished refreshing rent list',
      datetime: new Date(),
      type: MessageLogType.Primary,
    });
  }

  public async updateAddresses(location?: string, priceRange?: string) {
    // this.stateMessage = 'Updating addresses...';
    this.listMessages.push({
      text: 'Starting updating addresses',
      datetime: new Date(),
      type: MessageLogType.Primary,
    });

    let nbOfProcessedAds = 1;

    while (nbOfProcessedAds != 0) {
      const request$ = this.http
        .get<any[]>(
          environment.apiUrl +
          '/update-addresses' +
          '?location=' + (location || this.location) +
          '&priceRange=' + (priceRange || this.priceRange)
        );
      const updatedRecords = await lastValueFrom(request$);
      nbOfProcessedAds = updatedRecords.length;
      this.listMessages.push({
        text: `Addresses have been updated for ${updatedRecords.length} records.`,
        datetime: new Date()
      });

      if (nbOfProcessedAds != 0) {
        await this.delay(1000);
      }
    }

    this.listMessages.push({
      text: 'Finished updating addresses',
      datetime: new Date(),
      type: MessageLogType.Primary,
    });
  }

  public async updateCoordinates(location?: string, priceRange?: string) {
    // this.stateMessage = 'Updating records\' coordinates...';
    this.listMessages.push({
      text: 'Starting updating coordinates',
      datetime: new Date(),
      type: MessageLogType.Primary,
    });

    let nbOfProcessedAds = 1;

    while (nbOfProcessedAds != 0) {
      const request$ = this.http
        .get<any[]>(
          environment.apiUrl +
          '/update-coordinates' +
          '?location=' + (location || this.location) +
          '&priceRange=' + (priceRange || this.priceRange)
        )
        .pipe(catchError((err) => of(err.error.message)));

      const result = await lastValueFrom(request$);

      if (Array.isArray(result)) {
        nbOfProcessedAds = result.length;
        this.listMessages.push({
          text: `${nbOfProcessedAds} records have seen their coordinates being updated.`,
          datetime: new Date()
        });
      } else {
        nbOfProcessedAds = 0;
        this.listMessages.push({ text: result, datetime: new Date() });
      }

      if (nbOfProcessedAds != 0) {
        await this.delay(1000);
      }
    }

    this.listMessages.push({
      text: 'Finished updating coordinates',
      datetime: new Date(),
      type: MessageLogType.Primary,
    });
  }

  public async updateTravelTime(location?: string, priceRange?: string) {
    this.listMessages.push({
      text: 'Starting updating transit time',
      datetime: new Date(),
      type: MessageLogType.Primary,
    });

    let nbOfProcessedAds = 1;

    while (nbOfProcessedAds != 0) {
      // this.stateMessage = 'Updating records\' work travel time...';
      const request$ = this.http
        .get<any[]>(
          environment.apiUrl +
          '/update-work-transit-time' +
          '?location=' + (location || this.location) +
          '&priceRange=' + (priceRange || this.priceRange)
        )
        .pipe(catchError((err) => of(err.error.message)));
      const result = await lastValueFrom(request$);

      if (Array.isArray(result)) {
        nbOfProcessedAds = result.length;
        this.listMessages.push({
          text: `${nbOfProcessedAds} records have seen their travel time being updated.`,
          datetime: new Date()
        });
      } else {
        nbOfProcessedAds = 0;
        this.listMessages.push({ text: result, datetime: new Date() });
      }

      if (nbOfProcessedAds != 0) {
        await this.delay(1000);
      }
    }

    this.listMessages.push({
      text: 'Finished updating transit time',
      datetime: new Date(),
      type: MessageLogType.Primary,
    });
  }

  private delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  public async removeUnavailableAds(location?: string) {
    this.listMessages.push({
      text: 'Starting removing unavailable ads',
      datetime: new Date(),
      type: MessageLogType.Primary,
    });

    let nbOfProcessedAds = 1;

    while (nbOfProcessedAds != 0) {
      // this.stateMessage = 'Removing unavailable records...';
      const request$ = this.http
        .get<any[]>(`${environment.apiUrl}/remove-unavailable-ads?location=${(location || this.location)}`)
        .pipe(catchError((err) => of(err.error.message)));
      const result = await lastValueFrom(request$);

      if (Array.isArray(result)) {
        nbOfProcessedAds = result.length;
        const nbOfRemovedAds = result.filter((e) => e.shouldBeRemoved).length;
        // this.stateMessage = `${nbOfProcessedAds} records have been processed, ${nbOfRemovedAds} have been removed.`;
        this.listMessages.push({
          text: `${nbOfProcessedAds} records have been processed, ${nbOfRemovedAds} have been removed.`,
          datetime: new Date()
        });
      } else {
        nbOfProcessedAds = 0;
        this.listMessages.push({ text: result, datetime: new Date() });
      }

      if (nbOfProcessedAds != 0) {
        await this.delay(1000);
      }
    }

    this.listMessages.push({
      text: 'Finished removing unavailable ads',
      datetime: new Date(),
      type: MessageLogType.Primary,
    });
  }

  public clearLogs() {
    this.listMessages = [];
    this.stateMessage = '';
  }

  public async startFullRefresh(): Promise<void> {
    const locationList = ['hk', 'kw', 'nt', 'islands'];
    const priceRangeList = ['5000-10000', '10000-15000', '15000-20000', '20000-40000'];
    const nbStepPerRound = 9;
    const nbRound = locationList.length * priceRangeList.length;
    const nbTotalSteps = nbStepPerRound * nbRound;
    let i = 1;

    for (const location of locationList) {
      for (const priceRange of priceRangeList) {
        this.stateMessage = `Step ${i++}/${nbTotalSteps}`;
        await this.refreshRentList(location, priceRange, 0);
        this.stateMessage = `Step ${i++}/${nbTotalSteps}`;
        await this.refreshRentList(location, priceRange, 1);
        this.stateMessage = `Step ${i++}/${nbTotalSteps}`;
        await this.refreshRentList(location, priceRange, 2);
        this.stateMessage = `Step ${i++}/${nbTotalSteps}`;
        await this.refreshRentList(location, priceRange, 3);
        this.stateMessage = `Step ${i++}/${nbTotalSteps}`;
        await this.refreshRentList(location, priceRange, 4);
        this.stateMessage = `Step ${i++}/${nbTotalSteps}`;
        await this.updateAddresses(location, priceRange);
        this.stateMessage = `Step ${i++}/${nbTotalSteps}`;
        await this.updateCoordinates(location, priceRange);
        this.stateMessage = `Step ${i++}/${nbTotalSteps}`;
        await this.updateTravelTime(location, priceRange);
        this.stateMessage = `Step ${i++}/${nbTotalSteps}`;
        await this.removeUnavailableAds(location);
      }
    }
  }

}
