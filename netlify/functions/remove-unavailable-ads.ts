import { Handler } from "@netlify/functions";
import { removeUnavailableAds } from "netlify/utils/remove-unavailable-ads";

const handler: Handler = async (event, context) => {

  const location: string = event?.queryStringParameters?.['location'] || 'hk';
  const updatedRecords = await removeUnavailableAds(location);

  return {
    statusCode: 200,
    body: JSON.stringify(updatedRecords),
  };
};

export { handler };
