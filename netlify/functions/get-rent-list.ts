import { Handler } from "@netlify/functions";
import fetch from 'node-fetch';

const handler: Handler = async (event, context) => {

  const url = 'https://www.28hse.com/en/property/dosearch?buyRent=rent&sortBy=&plan_id=0&plan_id_more_search_open=&page=5&location=kw&district_ids=0&district_group_ids=0&cat_ids=&house_main_type_ids=&house_other_main_type_ids=&house_other_main_type_id_fix=0&house_other_sub_main_type_ids=&price_selection_index=0&price_low=0&price_high=0&rentprice_selection_index=3&rentprice_low=10000&rentprice_high=15000&area_selection_index=0&area_build_sales=sales&area_low=0&area_high=0&noOfRoom=&estate_age_low=0&estate_age_high=0&house_search_tag_ids=&myfav=&myvisited=&property_ids=&is_return_newmenu=0&is_grid_mode=0&landlordAgency=&estate_age_index=&floors=&temp_house_search_tag_ids=&search_words_value=&search_words_thing=&search_words=&sortByBuy=&sortByRent=';
  const response = await fetch(url);
  const data = await response.json() as any;

  console.log('=======');
  console.log(data);

  return {
    statusCode: 200,
    body: data,
  };
};

export { handler };
