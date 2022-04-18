import { Handler } from "@netlify/functions";
import { updateWorkTransitTime } from '../utils/update-work-transit-time';

const handler: Handler = async (event, context) => {
  const location: string = event?.queryStringParameters?.['location'] || 'hk';
  const priceRange: string = event?.queryStringParameters?.['priceRange'] || '15000-20000';
  const priceLow = priceRange.split('-')[0];
  const priceHigh = priceRange.split('-')[1];
  let updatedRecords;

  try {
    updatedRecords = await updateWorkTransitTime(location, priceLow, priceHigh);
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
