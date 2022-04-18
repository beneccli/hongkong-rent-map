import { Handler } from "@netlify/functions";
import { updateAddresses } from "netlify/utils/update-addresses";


const handler: Handler = async (event, context) => {

  const location: string = event?.queryStringParameters?.['location'] || 'hk';
  const priceRange: string = event?.queryStringParameters?.['priceRange'] || '15000-20000';
  const priceLow = priceRange.split('-')[0];
  const priceHigh = priceRange.split('-')[1];
  const updatedRecords = await updateAddresses(location, priceLow, priceHigh);

  return {
    statusCode: 200,
    body: JSON.stringify(updatedRecords),
  };
};

export { handler };
