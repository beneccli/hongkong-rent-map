import { Handler } from "@netlify/functions";
import * as airtable from 'airtable';
import fetch from 'node-fetch';

const updateRecord = (base: any, recordId: string, coordinates?: { lon: number, lat: number }) => {
  base('RentList').update([
    {
      id: recordId,
      fields: { coordinates: coordinates ? JSON.stringify(coordinates) : 'KO' }
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
    .split('and')[0]
    .replace('st.', 'street')
    .replace(/(.+) st$/i, '$1 street')
    .replace('no.', '')
    .replace('no:', '')
    .replace('nos.', '')
    .replace('rd.', 'road');
}

const findCoordGeoapify = async (base: any, record: any) => {
  const requestOptions = {
    method: 'GET',
  };

  // const address = 'No.38 Fuk Chak Street, Hong Kong';
  // const test = 'No.38%20Fuk%20Chak%20Street%2C%20Hong%20Kong';
  const address = `${cleanAddress(record.fields.address)}, Hong Kong`;
  const url = `https://api.geoapify.com/v1/geocode/search?text=${address}&format=json&apiKey=0d16f52d3089433ea9ae026b69c79114`;

  console.log('Searching address: ' + address);

  fetch(url, requestOptions)
    .then((response) => response.json())
    .then((result: any) => {
      console.log(result.results);
      const rankedResults = result?.results?.filter((e: any) => e.rank.confidence > 0);
      if (rankedResults?.length) {
        console.log('Selected result: ' + JSON.stringify(rankedResults[0]));
        const coordinates = {
          lon: rankedResults[0].lon,
          lat: rankedResults[0].lat
        };

        updateRecord(base, record.getId(), coordinates);
      } else {
        updateRecord(base, record.getId());
      }
    })
    .catch((error) => console.log('error', error));
}

const findCoord = async (base: any, record: any) => {
  const requestOptions = {
    method: 'GET',
  };
  const isInteger = (num: any) => /^-?[0-9]+$/.test(num+'');

  if (record.fields.address === 'KO' || isInteger(record.fields.address)) {
    updateRecord(base, record.getId());
  }

  const address = `${cleanAddress(record.fields.address)}, Hong Kong`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyBAeLxrN6fF9XfPxuXHT-k_OX_2pI3JcYk`;

  console.log('Searching address: ' + address);

  fetch(url, requestOptions)
    .then((response) => response.json())
    .then((result: any) => {
      const rankedResults = result?.results;
      if (rankedResults?.length) {
        console.log('Selected result: ' + JSON.stringify(rankedResults[0]));
        const coordinates = {
          lon: rankedResults[0].geometry.location.lng,
          lat: rankedResults[0].geometry.location.lat
        };

        updateRecord(base, record.getId(), coordinates);
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
    const recordsToUpdate: any[] = [];
    let updatedRecords: any[] = [];
    base('RentList').select({
      maxRecords: 15,
      filterByFormula: `AND(
        {address} != '',
        {address} != 'KO',
        {address} != '.',
        {address} != '-',
        {coordinates} = '',
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
        record = findCoord(base, record);
        // recordsToUpdate.push({
        //   recordId: record.getId(),
        //   address: extractedAddress,
        // });
        // updateRecord(base, record.getId(), extractedAddress);
      });
      fetchNextPage();
    }, function done(err: any) {
      // updateRecords(base, recordsToUpdate);
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
