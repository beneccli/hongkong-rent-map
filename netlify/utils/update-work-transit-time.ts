import * as airtable from 'airtable';
import fetch from 'node-fetch';

const updateRecord = (base: any, location: string, recordId: string, travelTime?: number) => {
  base(location).update([
    {
      id: recordId,
      fields: { workTravelTime: travelTime ? travelTime : 0 }
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

const generateTravelTime = async (base: any, location: string, record: any) => {
  const requestOptions = {
    method: 'GET',
  };

  const origins = `${cleanAddress(record.fields.address)}, Hong Kong`;
  const today = new Date();
  const departureTime: number = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1, 8, 0, 0) / 1000;
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
        if  (['ZERO_RESULTS', 'NOT_FOUND'].includes(travelResults[0].elements[0].status)) {
          updateRecord(base, location, record.getId());
        } else {
          const travelTime = travelResults[0].elements[0].duration.value; // seconds
          updateRecord(base, location, record.getId(), travelTime);
        }
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

const updateWorkTransitTime = async (location: string, priceLow: string, priceHigh: string) => {
  const apiKey = 'key7n6E71OR94Ur7a';
  airtable.configure({ apiKey });
  const base = airtable.base('appSt8paRVfriWVnj');

  return new Promise(function(resolve, reject) {
    let updatedRecords: any[] = [];
    base(location).select({
      maxRecords: 15,
      filterByFormula: `AND(
        {address} != '',
        {address} != 'KO',
        {address} != '.',
        {address} != '-',
        {coordinates} != '',
        {coordinates} != 'KO',
        {workTravelTime} = '',
        {workTravelTime} != 0,
        {location} = '${location}',
        {price} >= ${priceLow},
        {price} <= ${priceHigh}
      )`,
    }).eachPage((records: any[], fetchNextPage: () => void) => {

      if (!records.length && !updatedRecords.length) {
        reject(error(1, 'No eligible record found.'));
      }

      updatedRecords = [ ...updatedRecords, ...records ];
      records.forEach(async (record) => {
        record = generateTravelTime(base, location, record);
      });
      fetchNextPage();
    }, function done(err: any) {
      if (err) { reject(error(2, 'Error happened while fetching data.', err)); }
      resolve(updatedRecords);
    });
  });
}

export { updateWorkTransitTime };
