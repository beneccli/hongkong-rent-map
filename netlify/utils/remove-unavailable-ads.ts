import * as airtable from 'airtable';
import fetch from 'node-fetch';
import parse from 'node-html-parser';
import { getBaseIdByLocation } from './get-base-by-location';

interface RecordToRemove {
  recordId: string;
  shouldBeRemoved: boolean;
}

const checkRecordsAvailability = async (record: any): Promise<RecordToRemove> => {
  if (!record) {
    return { recordId: '', shouldBeRemoved: false };
  }

  const response = await fetch(record.get('detailUrl'));
  const html: string = await response.text();
  const root = parse(html);
  const result = root.querySelector('div.ui.content_body_outer > div > div > .ui.error.message > div.header');
  return <RecordToRemove>{
    recordId: record.getId(),
    shouldBeRemoved: !!result
  };
}

const destroyRecords = (base: any, location: string, recordsToRemove: RecordToRemove[]) => {
  if (recordsToRemove?.length) {
    return base(location).destroy(recordsToRemove.map((e) => e.recordId));
  }

  return [];
}

const updateRecords = async (base: any, location: string, recordsToUpdate: RecordToRemove[]) => {
  if (recordsToUpdate?.length) {
    const today: Date = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return base(location).update(recordsToUpdate.map((e) => ({ id: e.recordId, fields: { lastAvailabilityCheckDate: today }})),);
  }

  return [];
}

const removeUnavailableAds = async (location: string) => {
  const apiKey = 'key7n6E71OR94Ur7a';
  airtable.configure({ apiKey });
  const base = airtable.base(getBaseIdByLocation[location]);

  return new Promise(function(resolve, reject) {
    let processedRecords: any[] = [];
    base(location).select({
      maxRecords: 10,
      filterByFormula: `OR(
        {lastAvailabilityCheckDate} = '',
        IS_BEFORE({lastAvailabilityCheckDate}, DATEADD(TODAY(), -1, 'days'))
      )`,
      // filterByFormula: `IS_BEFORE({lastAvailabilityCheckDate}, DATEADD(TODAY(), -1, 'days'))`,
    }).eachPage(async (records: any[], fetchNextPage: () => void) => {
      const max = 5;
      for (let i = 0; i < records.length; i += max) {
        const indexes = Array.from(Array(i+max < records.length ? max : records.length - i).keys());
        const promisedRecords: Promise<RecordToRemove>[] =
          indexes.map((j) => checkRecordsAvailability(records[i+j]));
        const currentProcessedRecords = (await Promise.all(promisedRecords)).filter((e) => e.recordId);
        processedRecords = [ ...processedRecords, ...currentProcessedRecords ];
        const unavailableRecords = currentProcessedRecords.filter((e) => e.shouldBeRemoved);
        const availableRecords = currentProcessedRecords.filter((e) => !e.shouldBeRemoved);
        // console.log('currentProcessedRecords');
        // console.log(currentProcessedRecords);
        destroyRecords(base, location, unavailableRecords);
        updateRecords(base, location, availableRecords);
        // await Promise.all([
        //   destroyRecords(base, unavailableRecords),
        //   updateRecords(base, availableRecords)
        // ]);
      }
      fetchNextPage();
    }, function done(err: any) {
      if (err) { reject(err); }
      resolve(processedRecords);
    });
  });
}

export { removeUnavailableAds };
