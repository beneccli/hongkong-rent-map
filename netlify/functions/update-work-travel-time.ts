import { Handler } from "@netlify/functions";
import * as airtable from 'airtable';
import fetch from 'node-fetch';

const updateRecord = (base: any, recordId: string, travelTime?: number) => {
  base('RentList').update([
    {
      id: recordId,
      fields: { workTravelTime: travelTime ? travelTime : 'KO' }
    }
  ],
  function(err: any, records: any[]) {
    if (err) {
      console.error(err);
      return;
    }
  });
}

const cleanAddress = (address: string) => {
  return address
    .trim()
    .toLowerCase()
    .split(' and ')[0]
    .replace('st.', 'street')
    .replace(/(.+) st$/i, '$1 street')
    .replace('no.', '')
    .replace('no:', '')
    .replace('nos.', '')
    .replace('rd.', 'road');
}

const generateTravelTime = async (base: any, record: any) => {
  const requestOptions = {
    method: 'GET',
  };

  const origins = `${cleanAddress(record.fields.address)}, Hong Kong`;
  const today = new Date();
  const departureTime = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1, 8, 0, 0);
  const destination = encodeURIComponent('Three Pacific Place, Wan Chai, Hong Kong');
  const mode = 'transit';
  const transitMode = 'train|tram|subway';
  const transitRoutingPreference = 'less_walking';
  const key = 'AIzaSyBAeLxrN6fF9XfPxuXHT-k_OX_2pI3JcYk';
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?departure_time=${departureTime}&destinations=${destination}&origins=${origins}&mode=${mode}&traffic_model=pessimistic&transit_mode=${transitMode}&transit_routing_preference=${transitRoutingPreference}&key=${key}`;

  console.log('Travel time from: ' + origins);

  fetch(url, requestOptions)
    .then((response) => response.json())
    .then((result: any) => {
      const travelResults = result?.rows;
      if (travelResults?.length && travelResults[0].elements?.length) {
        console.log('Selected result: ' + JSON.stringify(travelResults[0].elements[0]));
        const travelTime = travelResults[0].elements[0].duration.value; // seconds

        updateRecord(base, record.getId(), travelTime);
      } else {
        updateRecord(base, record.getId());
      }
    })
    .catch((error) => console.log('error', error));
}

const error = (code: number, message: string, payload?: any) => {
  console.log('Error: ' + message);
  return { code, message, payload }
}

const start = async (location: string, priceLow: string, priceHigh: string) => {
  const apiKey = 'key7n6E71OR94Ur7a';
  airtable.configure({ apiKey });
  const base = airtable.base('appSt8paRVfriWVnj');

  return new Promise(function(resolve, reject) {
    let updatedRecords: any[] = [];
    base('RentList').select({
      maxRecords: 15,
      filterByFormula: `AND(
        {address} != '',
        {address} != 'KO',
        {address} != '.',
        {address} != '-',
        {coordinates} != '',
        {coordinates} != 'KO',
        {workTravelTime} = '',
        {location} = '${location}',
        {price} >= ${priceLow},
        {price} <= ${priceHigh}
      )`,
    }).eachPage((records: any[], fetchNextPage: () => void) => {

      if (!records.length && !updatedRecords.length) {
        reject(error(1, 'No record with empty coordinates found.'));
      }

      updatedRecords = [ ...updatedRecords, ...records ];
      records.forEach(async (record) => {
        record = generateTravelTime(base, record);
      });
      fetchNextPage();
    }, function done(err: any) {
      if (err) { reject(error(2, 'Error happened while fetching data.', err)); }
      resolve(updatedRecords);
    });
  });
}

const handler: Handler = async (event, context) => {
  const location: string = event?.queryStringParameters?.['location'] || 'hk';
  const priceRange: string = event?.queryStringParameters?.['priceRange'] || '15000-20000';
  const priceLow = priceRange.split('-')[0];
  const priceHigh = priceRange.split('-')[1];
  let updatedRecords;

  try {
    updatedRecords = await start(location, priceLow, priceHigh);
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedRecords),
  };
};

export { handler };
