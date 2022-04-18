import { schedule } from '@netlify/functions';
import { removeUnavailableAds } from 'netlify/utils/remove-unavailable-ads';

export const handler = schedule(
  "@hourly",
  async () => {
    await removeUnavailableAds('hk');
    await removeUnavailableAds('kw');
    await removeUnavailableAds('nt');

    return {
      statusCode: 200,
    };
  }
);
