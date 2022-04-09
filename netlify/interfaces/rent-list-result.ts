export interface RentListResult {
  status:  number;
  result:  number;
  data:    Data;
  encrypt: number;
  debug:   string;
}

export interface Data {
  msg:     null;
  results: Results;
  encrypt: number;
}

export interface Results {
  resultContentHtml: string;
  resultData:        ResultData;
}

export interface ResultData {
  buyRent:                  string;
  hasCatPopularFeature:     boolean;
  mobilePageChannel:        string;
  isReturnNewMenu:          boolean;
  SearchParams:             SearchParams;
  SearchInputs:             SearchInputs;
  ListingMenu:              ListingMenu;
  baseUrl:                  string;
  params_show:              string;
  isMyListing:              boolean;
  plan_id:                  number;
  plan_id_more_search_open: boolean;
  ListingOwner:             null;
  PropertyCompanyDetail:    null;
  bannerHtml:               string;
  showAppDownloadLoadItem:  boolean;
  EstateDetail:             null;
  header_navigations:       any[];
  pageLimit:                string;
  ListingPaginator:         ListingPaginator;
  setForceMobilePagination: boolean;
  hidePagination:           boolean;
  searchDesc:               string;
  metaPageTitle:            string;
  metaPageDesc:             string;
  showHtml:                 string;
  pics:                     any[];
  search_render:            any[];
  detail_render:            any[];
  owner:                    any[];
  user:                     any[];
  items:                    any[];
  pagination:               any[];
  otherOutputArr:           any[];
  _dummy:                   string;
}

export interface ListingMenu {
  buyRent:                       string;
  sortBy:                        string;
  priceRanges:                   Range[];
  rentPriceRanges:               Range[];
  areaRanges:                    Range[];
  roomRanges:                    GreenWhiteForm[];
  landlordAgency:                GreenWhiteForm[];
  yearRanges:                    YearRange[];
  greenWhiteForm:                GreenWhiteForm[];
  sortings:                      GreenWhiteForm[];
  SortingMenuBuy:                SortingMenu;
  SortingMenuBuyHtml:            string;
  SortingMenuRent:               SortingMenu;
  SortingMenuRentHtml:           string;
  areaBuildSales:                string[];
  isMyListing:                   boolean;
  mobilePageChannel:             string;
  PropertyListingMenuPopularCat: null;
  clientStorageKeyPrefix:        string;
  isFromPropertySubscribe:       boolean;
  showHtml:                      string;
  floors:                        string;
}

export interface SortingMenu {
  buyRent:             string;
  sortBy:              string;
  myListingMode:       boolean;
  myListingSimpleMode: boolean;
  sortings:            GreenWhiteForm[];
  showHtml:            string;
}

export interface GreenWhiteForm {
  id:    number;
  name:  string;
  value: string;
}

export interface Range {
  id:   number;
  name: string;
  low:  number;
  high: number;
}

export interface YearRange {
  id:   number;
  name: string;
  low:  string;
  high: string;
}

export interface ListingPaginator {
  count:        number;
  page:         number;
  page_prev:    number;
  page_next:    number;
  total_page:   number;
  pages:        Page[];
  next:         number;
  prev:         number;
  current:      number;
  hideView:     boolean;
  hasFirstBtn:  boolean;
  firstPageUrl: string;
  prevPageUrl:  string;
  nextPageUrl:  string;
  showHtml:     string;
}

export interface Page {
  num:       number | string;
  url:       null | string;
  isCurrent: boolean;
}

export interface SearchInputs {
  histExcludeds:                 string[];
  buyRent:                       string;
  page:                          number;
  sortBy:                        string;
  is_grid_mode:                  boolean;
  myfav:                         boolean;
  myvisited:                     boolean;
  myitem:                        boolean;
  myitemMode:                    string;
  myResultEmpty:                 boolean;
  property_ids:                  any[];
  highlight_property_id:         number;
  location:                      string;
  district_group_ids:            any[];
  district_ids:                  any[];
  cat_ids:                       any[];
  search_words:                  string;
  search_words_value:            string;
  search_words_thing:            string;
  house_main_type_ids:           any[];
  house_other_main_type_id_fix:  number;
  house_other_main_type_ids:     any[];
  house_other_sub_main_type_ids: any[];
  house_search_tag_ids:          any[];
  price_selection_index:         number;
  price_str:                     string;
  price_low:                     number;
  price_high:                    number;
  rentprice_selection_index:     number;
  rentprice_str:                 string;
  rentprice_low:                 number;
  rentprice_high:                number;
  area_build_sales:              string;
  area_selection_index:          number;
  area_str:                      string;
  area_low:                      number;
  area_high:                     number;
  floors:                        string;
  floor_arr:                     any[];
  noOfRoom:                      any[];
  landlordAgency:                string;
  estate_age_str:                string;
  estate_age_index:              number;
  estate_age_low:                number;
  estate_age_high:               number;
  plan_id:                       number;
  mobilePageChannel:             string;
  mylisting_owner_id:            number;
}

export interface SearchParams {
  page:                     number;
  sortBy:                   string;
  adId:                     null;
  buyRent:                  string;
  searchWords:              null;
  searchWordsResultEmpty:   boolean;
  myResultEmpty:            boolean;
  searchTitle:              null;
  houseMainTypeIds:         any[];
  houseOtherMainTypeIds:    any[];
  houseOtherSubMainTypeIds: any[];
  houseSearchTagIds:        any[];
  fixedAdIdsSearch:         any[];
  Areas:                    Area[];
  DistrictGroups:           any[];
  Districts:                any[];
  Cats:                     any[];
  planId:                   null;
  urlSlug:                  string;
  TypeDetail:               null;
  price_range:              any[];
  rentprice_range:          number[];
  areabuild_range:          any[];
  areasales_range:          any[];
  noOfRoom:                 any[];
  landlordAgency:           string;
  estateAge_range:          any[];
  mobilePageChannel:        string;
  ownerId:                  number;
  myitemMode:               string;
  titleSimilarWords:        string;
  titleEngSimilarWords:     string;
  floors:                   string;
  floor_arr:                any[];
  createTimeAfter:          string;
}

export interface Area {
  cat_id:                string;
  cat_active:            string;
  cat_allow_ads:         string;
  cat_allow_ads_rent:    string;
  cat_is_district:       string;
  cat_centcode:          string;
  cat_estateid:          string;
  cat_fatherid:          string;
  cat_geoaddr:           string;
  cat_geoaddr_eng:       string;
  cat_geox:              string;
  cat_geoy:              string;
  cat_mainlocationid:    string;
  cat_maintype:          string;
  cat_midcode:           string;
  cat_name:              string;
  cat_name_alt:          string;
  cat_name_eng:          string;
  cat_onbuild:           string;
  cat_require_approval:  string;
  cat_seq:               string;
  cat_total_buy:         string;
  cat_total_rent:        string;
  cat_extra_currency_id: string;
  isDistrct:             number;
  isLastNode:            number;
  District:              null;
  ChildNodes:            null;
  Estate:                null;
  States:                any[];
}
