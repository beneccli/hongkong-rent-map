import { Handler } from "@netlify/functions";
import { RentListResult } from "netlify/interfaces/rent-list-result";
import fetch from 'node-fetch';
import parse from 'node-html-parser';

const retrievePrice = (htmlElement: any) => {
  const result = htmlElement.querySelector('.ui.right.floated.green.large.label');
  if (result) {
    const test = /HKD\$(\d+(,\d+)?)/.exec(result.rawText);
    if (test) {
      const price: number = test[1] ? parseInt(test[1].replace(',', '')) : 0;
      return price;
    }
  }

  return 0;
}

const retrieveArea = (htmlElement: any) => {
  const results = htmlElement.querySelectorAll('.areaUnitPrice > div');
  const result = { grossArea: 0, saleableArea: 0 };

  if (results) {
    // Gross area
    let test = /Gross Area: (\d+) ft/.exec(results[0].rawText);
    if (test) {
      result.grossArea = test[1] ? parseInt(test[1].replace(',', '')) : 0;
    }
    // Saleable area
    test = /Saleable Area: (\d+) ft/.exec(results[1].rawText);
    if (test) {
      result.saleableArea = test[1] ? parseInt(test[1].replace(',', '')) : 0;
    }
  }

  return result;
}

const retrieveDistrictAreas = (htmlElement: any) => {
  const results = htmlElement.querySelectorAll('.district_area.wHoverBlue > a');
  return results.map((res: any) => ({
    name: res.rawText,
    url: res.attributes.href
  }));
}

const retrieveNameAndDetailPageUrl = (htmlElement: any) => {
  const result = htmlElement.querySelector('.header.wHoverBlue > a.detail_page');
  return {
    name: result.rawText,
    detailUrl: result.attributes.href
  }
}

const retrieveDescriptions = (htmlElement: any) => {
  const results = htmlElement.querySelectorAll('.content > .description > .right.floated > .ui.label');
  return results.map((res: any) => res.rawText.trim());
}

const retrievePicture = (htmlElement: any) => {
  const result = htmlElement.querySelector('img.detail_page_img');
  const resultNb = result.nextElementSibling;
  return {
    thumbnail: result.attributes.src,
    total: parseInt(resultNb.querySelector('.ui.label').rawText.trim())
  };
}

const retrieveLabels = (htmlElement: any) => {
  const results = htmlElement.querySelectorAll('.extra .tagLabels > .ui.label');
  return results.map((res: any) => res.rawText.trim());
}

const extractData = (htmlElement: any) => {
  return {
    ...retrieveNameAndDetailPageUrl(htmlElement),
    price: retrievePrice(htmlElement),
    area: retrieveArea(htmlElement),
    picture: retrievePicture(htmlElement),
    districtAreas: retrieveDistrictAreas(htmlElement),
    descriptions: retrieveDescriptions(htmlElement),
    labels: retrieveLabels(htmlElement),
  }
}

const extractResult = async (currentPage: number, rentprice_low: number, rentprice_high: number): any[] => {
  const url = `https://www.28hse.com/en/property/dosearch?buyRent=rent&sortBy=&plan_id=0&plan_id_more_search_open=&page=${currentPage}&location=kw&district_ids=0&district_group_ids=0&cat_ids=&house_main_type_ids=&house_other_main_type_ids=&house_other_main_type_id_fix=0&house_other_sub_main_type_ids=&price_selection_index=0&price_low=0&price_high=0&rentprice_selection_index=3&rentprice_low=${rentprice_low}&rentprice_high=${rentprice_high}&area_selection_index=0&area_build_sales=sales&area_low=0&area_high=0&noOfRoom=&estate_age_low=0&estate_age_high=0&house_search_tag_ids=&myfav=&myvisited=&property_ids=&is_return_newmenu=0&is_grid_mode=0&landlordAgency=&estate_age_index=&floors=&temp_house_search_tag_ids=&search_words_value=&search_words_thing=&search_words=&sortByBuy=&sortByRent=`;
  const response = await fetch(url);
  const data = await response.json() as RentListResult;

  if (data.status !== 1) {
    throw new Error('Status is incorrect');
  }

  const html: string = data.data.results.resultData.showHtml;
  const root = parse(html);
  const results = root.querySelectorAll('.item.property_item');

  if (!results) {
    throw new Error('No result found');
  }

  // const pageLimit: number = parseInt(data.data.results.resultData.pageLimit);
  // const totalResult: number = data.data.results.resultData.ListingPaginator.count;
  // const totalPage: number = data.data.results.resultData.ListingPaginator.total_page;

  const extractedResult = results.map((res) => extractData(res));

  return extractedResult;
}

const handler: Handler = async (event, context) => {

  const rentprice_low = 10000;
  const rentprice_high = 15000;
  let extractedResult: any[] = [];

  for (let currentPage = 0 ; currentPage < 5 ; currentPage++) {
    extractedResult = [
      ...extractedResult,
      ...(await extractResult(currentPage, rentprice_low, rentprice_high))
    ];
  }

  console.log('Nb result: ' + extractedResult.length);

  return {
    statusCode: 200,
    body: JSON.stringify(extractedResult),
  };
};

export { handler };
