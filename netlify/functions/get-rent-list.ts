import { Handler } from "@netlify/functions";
import * as airtable from 'airtable';
import { getBaseIdByLocation } from "netlify/utils/get-base-by-location";

const getRecords = async (location: string, priceLow: string, priceHigh: string, onlyRecent: boolean): Promise<any[]> => {
  const apiKey = 'key7n6E71OR94Ur7a';
  airtable.configure({ apiKey });
  const base = airtable.base(getBaseIdByLocation[location]);
  const dateCriteria = onlyRecent ? ", IS_AFTER({createdDate}, DATEADD(TODAY(), -2, 'days'))" : '';

  return new Promise(function(resolve, reject) {
    let getRecords: any[] = [];
    base(location).select({
      filterByFormula:
        `AND(
          {location} = '${location || 'hk'}',
          {price} >= ${priceLow || '15000'},
          {price} <= ${priceHigh || '20000'},
          {address} != '',
          {address} != 'KO',
          {coordinates} != '',
          {coordinates} != 'KO'
          ${dateCriteria}
        )`
    })
    .eachPage((records: any[], fetchNextPage: () => void) => {
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
    if (record.fields[key] === 'KO') {
      record.fields[key] = '';
    } else {
      record.fields[key] = record.fields[key] && JSON.parse(record.fields[key]) || '';
    }
  });

  return record.fields;
}

const handler: Handler = async (event, context) => {
  const location: string = event?.queryStringParameters?.['location'] || 'hk';
  const priceRange: string = event?.queryStringParameters?.['priceRange'] || '15000-20000';
  const onlyRecent: boolean = event?.queryStringParameters?.['recent'] === 'true';
  const priceLow = priceRange.split('-')[0];
  const priceHigh = priceRange.split('-')[1];

  const records: any[] = await getRecords(location, priceLow, priceHigh, onlyRecent);
  const rentList: any[] = records.map((e) => recordToObject(e));

  return {
    statusCode: 200,
    body: JSON.stringify(rentList),
  };
};

export { handler };
