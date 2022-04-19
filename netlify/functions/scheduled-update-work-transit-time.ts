import { schedule } from '@netlify/functions';
import * as airtable from 'airtable';
import { AirtableBase } from 'airtable/lib/airtable_base';
import { getBaseIdByLocation } from "netlify/utils/get-base-by-location";
import { getSteps } from "netlify/utils/get-step";
import { updateWorkTransitTime } from 'netlify/utils/update-work-transit-time';

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
        filterByFormula: `{Name} = 'update-work-transit-time'`
      }).all())[0];
    const currentStatus: number = schedulingStatus.fields.status;
    const currentStep = getSteps[currentStatus];
    updateStatus(base, schedulingStatus);

    console.log('Current step: ' + JSON.stringify(currentStep));

    await updateWorkTransitTime(
      currentStep.location,
      currentStep.lowPrice,
      currentStep.highPrice
    );

    return {
      statusCode: 200,
    };
  }
);
