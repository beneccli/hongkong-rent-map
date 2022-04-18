import * as airtable from 'airtable';
import fetch from 'node-fetch';
import parse from 'node-html-parser';
import { getBaseIdByLocation } from './get-base-by-location';

const extractAddress = async (record: any): Promise<string> => {
  if (!record) {
    return '';
  }

  const response = await fetch(record.get('detailUrl'));
  const html: string = await response.text();
  const root = parse(html);
  let result = root.querySelector('.ui.definition.table.tablePair tr:last-child td:last-child > div.pairValue')?.rawText;
  console.log('result: ' + result);

  if (!result) {
    const test = root.querySelectorAll('div.ui.content_body_outer div.eleven.wide.column > div > div > table tr > td:nth-child(1)');
    result = test.find((e) => e?.rawText?.trim().toLowerCase() === 'address')?.nextSibling?.rawText;
  }

  return result || '';
}

const updateRecord = (base: any, location: string, recordId: string, address: string) => {
  base(location).update([
    {
      id: recordId,
      fields: { address: address || 'KO' }
    }
  ],
  function(err: any, records: any[]) {
    if (err) {
      console.error(err);
      return;
    }
  });
}

const updateAddresses = async (location: string, priceLow: string, priceHigh: string) => {
  const apiKey = 'key7n6E71OR94Ur7a';
  airtable.configure({ apiKey });
  const base = airtable.base(getBaseIdByLocation[location]);

  return new Promise(function(resolve, reject) {
    let updatedRecords: any[] = [];
    base(location).select({
      maxRecords: 12,
      filterByFormula: `AND({address} = '', {location} = '${location}', {price} >= ${priceLow}, {price} <= ${priceHigh})`,
    }).eachPage(async (records: any[], fetchNextPage: () => void) => {
      updatedRecords = [ ...updatedRecords, ...records ];
      const max = 3;
      for (let i = 0; i < records.length; i += max) {
        const indexes = Array.from(Array(i+max > records.length ? max : records.length - i).keys());
        const promisedRecords = indexes.map((j) => extractAddress(records[i+j])).filter((e) => e);
        const recordsResult = await Promise.all(promisedRecords);
        const extractedAddresses = indexes.map((j) => recordsResult[j]);
        extractedAddresses.map((extractedAddress, j) => records[i+j] && updateRecord(base, location, records[i+j].getId(), extractedAddress));
      }
      fetchNextPage();
    }, function done(err: any) {
      if (err) { reject(err); }
      resolve(updatedRecords);
    });
  });
}

export { updateAddresses };
