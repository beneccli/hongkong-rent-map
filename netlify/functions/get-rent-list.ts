import { Handler } from "@netlify/functions";
import * as airtable from 'airtable';

const getRecords = async (): Promise<any[]> => {
  const apiKey = 'key7n6E71OR94Ur7a';
  airtable.configure({ apiKey });
  const base = airtable.base('appSt8paRVfriWVnj');

  return new Promise(function(resolve, reject) {
    let getRecords: any[] = [];
    base('RentList').select().eachPage((records: any[], fetchNextPage: () => void) => {
      getRecords = [ ...getRecords, ...records ];
      fetchNextPage();
    }, function done(err: any) {
      if (err) { reject(err); }
      resolve(getRecords);
    });
  });
}

const recordToObject = (record: any) => {
  const keysToParse = ['area', 'descriptions', 'districtAreas', 'labels', 'picture', 'coordinates'];
  keysToParse.map((key) => {
    record.fields[key] = record.fields[key] && JSON.parse(record.fields[key]) || '';
  });

  return record.fields;
}

const handler: Handler = async (event, context) => {
  const records: any[] = await getRecords();
  const rentList: any[] = records.map((e) => recordToObject(e));

  return {
    statusCode: 200,
    body: JSON.stringify(rentList),
  };
};

export { handler };
