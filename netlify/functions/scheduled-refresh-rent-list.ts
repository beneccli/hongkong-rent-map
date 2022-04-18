import { schedule } from '@netlify/functions';
import * as airtable from 'airtable';
import { AirtableBase } from 'airtable/lib/airtable_base';
import { getBaseIdByLocation } from "netlify/utils/get-base-by-location";
import { getSteps } from "netlify/utils/get-step";
import { refreshRentList } from 'netlify/utils/refresh-rent-list';

const updateStatus = async (base: AirtableBase, schedulingStatus: any): Promise<void> => {
  const status = schedulingStatus.fields.status + 1;
  base('scheduling').update([{
    id: schedulingStatus.getId(),
    fields: { status: status === getSteps.length ? 0 : status }
  }]);
}

export const handler = schedule(
  "*/10 * * * *",
  async () => {
    const apiKey = 'key7n6E71OR94Ur7a';
    airtable.configure({ apiKey });
    const base = airtable.base(getBaseIdByLocation['kw']);

    const schedulingStatus = (await base('scheduling')
      .select({
        filterByFormula: `{Name} = 'refresh-rent-list'`
      }).all())[0];
    const currentStatus: number = schedulingStatus.fields.status;
    const currentStep = getSteps[currentStatus];
    updateStatus(base, schedulingStatus);

    await refreshRentList(
      currentStep.location,
      currentStep.lowPrice,
      currentStep.highPrice,
      5
    );

    return {
      statusCode: 200,
    };
  }
);
