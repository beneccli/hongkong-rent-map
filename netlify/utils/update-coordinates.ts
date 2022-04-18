import * as airtable from 'airtable';
import fetch from 'node-fetch';
import { getBaseIdByLocation } from './get-base-by-location';

const updateRecord = (base: any, location: string, recordId: string, coordinates?: { lon: number, lat: number }) => {
  base(location).update([
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
  address = address.trim().toLowerCase();
  const split = address.split(' and ');

  return split[split.length-1]
    .replace('st.', 'street')
    .replace(/(.+) st$/i, '$1 street')
    .replace('no.', '')
    .replace('no:', '')
    .replace('nos.', '')
    .replace('rd.', 'road');
}

const findCoord = async (base: any, location: string, record: any) => {
  const requestOptions = {
    method: 'GET',
  };
  const isInteger = (num: any) => /^-?[0-9]+$/.test(num+'');

  if (record.fields.address === 'KO' || isInteger(record.fields.address)) {
    updateRecord(base, location, record.getId());
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

        updateRecord(base, location, record.getId(), coordinates);
      } else {
        updateRecord(base, location, record.getId());
      }
    })
    .catch((error) => console.log('error', error));
}

const error = (code: number, message: string, payload?: any) => {
  console.log('Error: ' + message);
  return { code, message, payload }
}

const updateCoordinates = async (location: string, priceLow: string, priceHigh: string) => {
  const apiKey = 'key7n6E71OR94Ur7a';
  airtable.configure({ apiKey });
  const base = airtable.base(getBaseIdByLocation[location]);

  return new Promise(function(resolve, reject) {
    const recordsToUpdate: any[] = [];
    let updatedRecords: any[] = [];
    base(location).select({
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
        record = findCoord(base, location, record);
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

export { updateCoordinates };
