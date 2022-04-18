import { Handler } from "@netlify/functions";
import { refreshRentList } from "netlify/utils/refresh-rent-list";


const handler: Handler = async (event, context) => {

  const location: string = event?.queryStringParameters?.['location'] || 'hk';
  const maxPage = 5;
  const priceRange: string = event?.queryStringParameters?.['priceRange'] || '15000-20000';
  const priceLow = priceRange.split('-')[0];
  const priceHigh = priceRange.split('-')[1];
  const extractedResult: any[] = await refreshRentList(location, priceLow, priceHigh, maxPage);

  return {
    statusCode: 200,
    body: JSON.stringify(extractedResult),
  };
};

export { handler };
