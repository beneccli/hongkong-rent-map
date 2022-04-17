import { schedule } from '@netlify/functions';
import { handler as parentHandler } from './remove-unavailable-ads';

export const handler = schedule(
  "@hourly",
  parentHandler
);
