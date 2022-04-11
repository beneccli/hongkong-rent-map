import { Handler } from "@netlify/functions";
import * as airtable from 'airtable';
import fetch from 'node-fetch';

const updateRecord = (base: any, recordId: string, coordinates: { lon: number, lat: number }) => {
  base('RentList').update([
    {
      id: recordId,
      fields: { coordinates: JSON.stringify(coordinates) }
    }
  ],
  function(err: any, records: any[]) {
    if (err) {
      console.error(err);
      return;
    }
  });
}

const findCoord = async (base: any, record: any) => {
  const requestOptions = {
    method: 'GET',
  };

  // const address = 'No.38 Fuk Chak Street, Hong Kong';
  // const test = 'No.38%20Fuk%20Chak%20Street%2C%20Hong%20Kong';
  const address = `${record.fields.address}, Hong Kong`;
  const url = `https://api.geoapify.com/v1/geocode/search?text=${address}&format=json&apiKey=0d16f52d3089433ea9ae026b69c79114`;

  console.log('Searching address: ' + address);

  fetch(url, requestOptions)
    .then((response) => response.json())
    .then((result: any) => {
      if (result.results?.length) {
        console.log('Selected result: ' + JSON.stringify(result.results[0]));
        const coordinates = {
          lon: result.results[0].lon,
          lat: result.results[0].lat
        };

        updateRecord(base, record.getId(), coordinates);
      } else {
        console.log('No result');
        console.log(result.resulsts);
      }
    })
    .catch((error) => console.log('error', error));
}

const error = (code: number, message: string, payload?: any) => {
  console.log('Error: ' + message);
  return { code, message, payload }
}

const start = async () => {
  const apiKey = 'key7n6E71OR94Ur7a';
  airtable.configure({ apiKey });
  const base = airtable.base('appSt8paRVfriWVnj');

  return new Promise(function(resolve, reject) {
    const recordsToUpdate: any[] = [];
    let updatedRecords: any[] = [];
    base('RentList').select({
      maxRecords: 15,
      filterByFormula: "AND({address} != '', {coordinates} = '')",
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
  let updatedRecords;
  try {
    updatedRecords = await start();
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
