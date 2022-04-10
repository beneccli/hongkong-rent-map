import { Handler } from "@netlify/functions";
import * as airtable from 'airtable';
import fetch from 'node-fetch';
import parse from 'node-html-parser';

const extractAddress = async (record: any): Promise<string > => {
  const response = await fetch(record.get('detailUrl'));
  const html: string = await response.text();
  const root = parse(html);
  const result = root.querySelector('.ui.definition.table.tablePair tr:last-child td:last-child > div.pairValue');
  return result?.rawText || '';
}

const updateRecord = (base: any, recordId: string, address: string) => {
  base('RentList').update([
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

const updateRecords = (base: any, recordsToUpdate: any[]) => {
  if (recordsToUpdate.length) {
    const nbPages = Math.ceil(recordsToUpdate.length / 10);

    for (let i = 0 ; i < nbPages ; i++) {
      base('RentList').update(recordsToUpdate.slice(i*10, (i+1)*10).map((record: any) => (
        {
          id: record.recordId,
          fields: { address: record.address }
        }
      )),
      function(err: any, records: any[]) {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  }
}

const start = async () => {
  const apiKey = 'key7n6E71OR94Ur7a';
  airtable.configure({ apiKey });
  const base = airtable.base('appSt8paRVfriWVnj');

  return new Promise(function(resolve, reject) {
    const recordsToUpdate: any[] = [];
    let updatedRecords: any[] = [];
    base('RentList').select({
      maxRecords: 20,
      filterByFormula: "{address} = ''",
    }).eachPage((records: any[], fetchNextPage: () => void) => {
      updatedRecords = [ ...updatedRecords, ...records ];
      console.log('new records:cd ' + records.length);
      records.forEach(async (record) => {
        console.log('processing record ' + record.get('detailUrl'));
        const extractedAddress = await extractAddress(record);
        // recordsToUpdate.push({
        //   recordId: record.getId(),
        //   address: extractedAddress,
        // });
        updateRecord(base, record.getId(), extractedAddress);
      });
      fetchNextPage();
    }, function done(err: any) {
      // updateRecords(base, recordsToUpdate);
      if (err) { reject(err); }
      resolve(updatedRecords);
    });
  });
}

const handler: Handler = async (event, context) => {

  const updatedRecords = await start();

  return {
    statusCode: 200,
    body: JSON.stringify(updatedRecords),
  };
};

export { handler };
