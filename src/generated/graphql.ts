/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** A supported font */
  Font: { input: any; output: any; }
  /** A field whose value is a hex color code: https://en.wikipedia.org/wiki/Web_colors. */
  HexColorCode: { input: any; output: any; }
  Hours: { input: any; output: any; }
  Minutes: { input: any; output: any; }
  /** A string that cannot be passed as an empty value */
  NonEmptyString: { input: any; output: any; }
  Slug: { input: any; output: any; }
  /** A field whose value conforms to the standard URL format as specified in RFC3986: https://www.ietf.org/rfc/rfc3986.txt. */
  URL: { input: any; output: any; }
};

/** Represents a dish allergen. */
export type Allergen = Node & {
  __typename?: 'Allergen';
  confidence?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/** Exclude dishes that have these allergens. */
export type AllergenFilter = {
  names: Array<AllergenType>;
};

export enum AllergenType {
  Dairy = 'Dairy',
  Egg = 'Egg',
  Fish = 'Fish',
  Peanut = 'Peanut',
  Sesame = 'Sesame',
  Shellfish = 'Shellfish',
  Soy = 'Soy',
  TreeNut = 'TreeNut',
  Wheat = 'Wheat'
}

export type Banner = {
  day?: Maybe<Day>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  hourEnd?: Maybe<Scalars['Hours']['output']>;
  hourStart?: Maybe<Scalars['Hours']['output']>;
  id: Scalars['ID']['output'];
  isEnabled: Scalars['Boolean']['output'];
  minutesEnd?: Maybe<Scalars['Minutes']['output']>;
  minutesStart?: Maybe<Scalars['Minutes']['output']>;
  position: BannerPosition;
  startDate?: Maybe<Scalars['DateTime']['output']>;
};

export enum BannerPosition {
  AboveThePreferenceBar = 'AboveThePreferenceBar',
  BelowThePreferenceBar = 'BelowThePreferenceBar'
}

export type BasicBanner = Banner & {
  __typename?: 'BasicBanner';
  backgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  ctaButtonAction?: Maybe<Scalars['String']['output']>;
  ctaButtonBackgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  ctaButtonText?: Maybe<Scalars['String']['output']>;
  ctaButtonTextColor?: Maybe<Scalars['HexColorCode']['output']>;
  ctaButtonTextFont?: Maybe<Scalars['String']['output']>;
  day?: Maybe<Day>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  hourEnd?: Maybe<Scalars['Hours']['output']>;
  hourStart?: Maybe<Scalars['Hours']['output']>;
  iconColor?: Maybe<Scalars['HexColorCode']['output']>;
  iconURL?: Maybe<Scalars['URL']['output']>;
  id: Scalars['ID']['output'];
  isEnabled: Scalars['Boolean']['output'];
  minutesEnd?: Maybe<Scalars['Minutes']['output']>;
  minutesStart?: Maybe<Scalars['Minutes']['output']>;
  position: BannerPosition;
  secondaryButtonAction?: Maybe<Scalars['String']['output']>;
  secondaryButtonBackgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  secondaryButtonText?: Maybe<Scalars['String']['output']>;
  secondaryButtonTextColor?: Maybe<Scalars['HexColorCode']['output']>;
  secondaryButtonTextFont?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  textColor?: Maybe<Scalars['HexColorCode']['output']>;
  textFont?: Maybe<Scalars['String']['output']>;
};

export type CarouselBanner = Banner & {
  __typename?: 'CarouselBanner';
  backgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  day?: Maybe<Day>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  fwdBwdColor?: Maybe<Scalars['HexColorCode']['output']>;
  fwdBwdIconColor?: Maybe<Scalars['HexColorCode']['output']>;
  hourEnd?: Maybe<Scalars['Hours']['output']>;
  hourStart?: Maybe<Scalars['Hours']['output']>;
  id: Scalars['ID']['output'];
  isEnabled: Scalars['Boolean']['output'];
  minutesEnd?: Maybe<Scalars['Minutes']['output']>;
  minutesStart?: Maybe<Scalars['Minutes']['output']>;
  position: BannerPosition;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  subtext?: Maybe<Scalars['String']['output']>;
  subtextColor?: Maybe<Scalars['HexColorCode']['output']>;
  subtextFont?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  textColor?: Maybe<Scalars['HexColorCode']['output']>;
  textFont?: Maybe<Scalars['String']['output']>;
};

/** Represents chain. */
export type Chain = Node & {
  __typename?: 'Chain';
  id: Scalars['ID']['output'];
  /** The name of the restaurants' chain. */
  name: Scalars['String']['output'];
  /** The list of the restaurants in the chain. */
  restaurants?: Maybe<RestaurantConnection>;
};


/** Represents chain. */
export type ChainRestaurantsArgs = {
  args?: InputMaybe<PaginationArgs>;
};

/** Represents a cuisine. */
export type Cuisine = Node & {
  __typename?: 'Cuisine';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parent?: Maybe<ParentCuisine>;
};

export enum Day {
  Friday = 'Friday',
  Monday = 'Monday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
  Thursday = 'Thursday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday'
}

/** Represents a dish diet. */
export type Diet = Node & {
  __typename?: 'Diet';
  confidence?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/** Diets that a dish must be a part of. */
export type DietFilter = {
  names: Array<DietType>;
};

export enum DietType {
  Pescatarian = 'Pescatarian',
  Vegan = 'Vegan',
  Vegetarian = 'Vegetarian'
}

/** Represents a restaurant dish. */
export type Dish = Node & {
  __typename?: 'Dish';
  /** A list of added ingredients. */
  addedIngredients: Array<Maybe<Ingredient>>;
  /** A list of dish allergens. */
  allergens: Array<Maybe<Allergen>>;
  calcium?: Maybe<Scalars['String']['output']>;
  caloriesFromFat?: Maybe<Scalars['String']['output']>;
  caloriesTotal?: Maybe<Scalars['String']['output']>;
  carbohydrates?: Maybe<Scalars['String']['output']>;
  cholesterol?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** A list of dish cuisines. */
  cuisines: Array<Maybe<Cuisine>>;
  description?: Maybe<Scalars['String']['output']>;
  dietaryFiber?: Maybe<Scalars['String']['output']>;
  /** A list of dish diets. */
  diets: Array<Maybe<Diet>>;
  fatSaturated?: Maybe<Scalars['String']['output']>;
  fatTotal?: Maybe<Scalars['String']['output']>;
  fatTrans?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  iron?: Maybe<Scalars['String']['output']>;
  /** Dish menu. */
  menu?: Maybe<Menu>;
  name: Scalars['String']['output'];
  /** A list of dish preparation types. */
  preparationTypes: Array<Maybe<PreparationType>>;
  protein?: Maybe<Scalars['String']['output']>;
  /** A list of removed ingredients. */
  removedIngredients: Array<Maybe<Ingredient>>;
  servingSize?: Maybe<Scalars['String']['output']>;
  servingSizeInGrams?: Maybe<Scalars['Float']['output']>;
  sodium?: Maybe<Scalars['String']['output']>;
  /** A list of dish styles. */
  styles: Array<Maybe<Style>>;
  /** A list of dish substitutions. */
  substitutions: Array<Maybe<Dish>>;
  sugar?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  vitaminA?: Maybe<Scalars['String']['output']>;
  vitaminC?: Maybe<Scalars['String']['output']>;
};

export type DishConnection = PagedConnection & {
  __typename?: 'DishConnection';
  /** A list of dish edges. */
  edges?: Maybe<Array<DishEdge>>;
  /** A list of dish nodes. */
  nodes?: Maybe<Array<Dish>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of a restaurants dishes. */
  total: Scalars['Int']['output'];
};

/** Dish filter and search criteria. */
export type DishCriteria = {
  allergens?: InputMaybe<AllergenFilter>;
  /** Range of total calories for a dish. */
  calories?: InputMaybe<RangeFilter>;
  category?: InputMaybe<MenuFilter>;
  diets?: InputMaybe<DietFilter>;
  nutrients?: InputMaybe<NutrientsFilter>;
  styles?: InputMaybe<StyleFilter>;
  /** Search term that matches keywords in dish name. */
  term?: InputMaybe<Scalars['String']['input']>;
};

export type DishEdge = PagedEdge & {
  __typename?: 'DishEdge';
  /** A cursor for use in pagination. Generated using Base64 encoding the tag's ID. */
  cursor: Scalars['String']['output'];
  /** The dish at the end of Edge. */
  node: Dish;
};

/** Input type for dish query. */
export type DishInput = {
  dish: Scalars['ID']['input'];
  restaurant: Scalars['ID']['input'];
};

export type ImageBanner = Banner & {
  __typename?: 'ImageBanner';
  backgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  buttonAction?: Maybe<Scalars['String']['output']>;
  buttonBackgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  buttonText?: Maybe<Scalars['String']['output']>;
  buttonTextColor?: Maybe<Scalars['HexColorCode']['output']>;
  buttonTextFont?: Maybe<Scalars['String']['output']>;
  day?: Maybe<Day>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  hourEnd?: Maybe<Scalars['Hours']['output']>;
  hourStart?: Maybe<Scalars['Hours']['output']>;
  id: Scalars['ID']['output'];
  imageURL?: Maybe<Scalars['URL']['output']>;
  isEnabled: Scalars['Boolean']['output'];
  minutesEnd?: Maybe<Scalars['Minutes']['output']>;
  minutesStart?: Maybe<Scalars['Minutes']['output']>;
  position: BannerPosition;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  subtext?: Maybe<Scalars['String']['output']>;
  subtextColor?: Maybe<Scalars['HexColorCode']['output']>;
  subtextFont?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  textColor?: Maybe<Scalars['HexColorCode']['output']>;
  textFont?: Maybe<Scalars['String']['output']>;
};

/** Represents a dish ingredient. */
export type Ingredient = Node & {
  __typename?: 'Ingredient';
  amountGrams: Scalars['Int']['output'];
  brand?: Maybe<Scalars['String']['output']>;
  calciumPer100g?: Maybe<Scalars['String']['output']>;
  caloriesFromFatPer100g?: Maybe<Scalars['String']['output']>;
  caloriesTotalPer100g?: Maybe<Scalars['String']['output']>;
  carbohydratesPer100g?: Maybe<Scalars['String']['output']>;
  cholesterolPer100g?: Maybe<Scalars['String']['output']>;
  containsEgg?: Maybe<Scalars['Boolean']['output']>;
  containsFish?: Maybe<Scalars['Boolean']['output']>;
  containsMilk?: Maybe<Scalars['Boolean']['output']>;
  containsSesame?: Maybe<Scalars['Boolean']['output']>;
  containsShellfish?: Maybe<Scalars['Boolean']['output']>;
  containsWheat?: Maybe<Scalars['Boolean']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fatSaturatedPer100g?: Maybe<Scalars['String']['output']>;
  fatTotalPer100g?: Maybe<Scalars['String']['output']>;
  fatTransPer100g?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  ironPer100g?: Maybe<Scalars['String']['output']>;
  isKeyIngredient: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  proteinPer100g?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['String']['output'];
  sugarPer100g?: Maybe<Scalars['String']['output']>;
  supplier?: Maybe<Scalars['String']['output']>;
  unit: Scalars['String']['output'];
  vitaminAPer100g?: Maybe<Scalars['String']['output']>;
  vitaminCPer100g?: Maybe<Scalars['String']['output']>;
};

export enum Layout {
  Card = 'Card',
  Table = 'Table'
}

/** Represents a restaurant menu. */
export type Menu = Node & {
  __typename?: 'Menu';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/** A menu that must contain a dish. */
export type MenuFilter = {
  id: Scalars['ID']['input'];
};

export type MenuItem = {
  __typename?: 'MenuItem';
  name: Scalars['NonEmptyString']['output'];
  url: Scalars['URL']['output'];
};

export type MenuItemInput = {
  name: Scalars['NonEmptyString']['input'];
  url: Scalars['URL']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  activateWidget?: Maybe<Widget>;
  activateWidgetSync?: Maybe<Widget>;
  deactivateWidget?: Maybe<Widget>;
  deactivateWidgetSync?: Maybe<Widget>;
  syncWidget?: Maybe<Scalars['Boolean']['output']>;
  updateBanner?: Maybe<Banner>;
  updateWidget?: Maybe<Widget>;
};


export type MutationActivateWidgetArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateWidgetSyncArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateWidgetArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateWidgetSyncArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSyncWidgetArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateBannerArgs = {
  input: UpdateBanner;
};


export type MutationUpdateWidgetArgs = {
  input: UpdateWidget;
};

export type Node = {
  id: Scalars['ID']['output'];
};

/** Ranges of various dish nutrients. */
export type NutrientsFilter = {
  carbohydrates?: InputMaybe<RangeFilter>;
  cholesterol?: InputMaybe<RangeFilter>;
  fats?: InputMaybe<RangeFilter>;
  fiber?: InputMaybe<RangeFilter>;
  proteins?: InputMaybe<RangeFilter>;
  sodium?: InputMaybe<RangeFilter>;
  sugar?: InputMaybe<RangeFilter>;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Pageable = Dish | Restaurant;

export type PagedConnection = {
  /** A list of edges. */
  edges?: Maybe<Array<PagedEdge>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Pageable>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  total: Scalars['Int']['output'];
};

export type PagedEdge = {
  /** A cursor for use in pagination. Generated using Base64 encoding the tag's ID. */
  cursor: Scalars['String']['output'];
  /** The item at the end of Edge. */
  node: Pageable;
};

export type PaginationArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Represents a parent cuisine. */
export type ParentCuisine = Node & {
  __typename?: 'ParentCuisine';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/** Represents a dish preparation type. */
export type PreparationType = Node & {
  __typename?: 'PreparationType';
  confidence?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/**
 * The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start.
 * Specify an access token in the 'authorization' header.
 */
export type Query = {
  __typename?: 'Query';
  /** Returns info about the chain. */
  chain: Chain;
  /** Returns info about a specific dish in a chains restaurant location. */
  dish: Dish;
  /** Returns info about a specific chain restaurant location. */
  restaurant: Restaurant;
  /** Returns a single widget. */
  widget: Widget;
  /** Returns available widgets. */
  widgets: Array<Maybe<Widget>>;
};


/**
 * The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start.
 * Specify an access token in the 'authorization' header.
 */
export type QueryDishArgs = {
  input: DishInput;
};


/**
 * The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start.
 * Specify an access token in the 'authorization' header.
 */
export type QueryRestaurantArgs = {
  id: Scalars['ID']['input'];
};


/**
 * The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start.
 * Specify an access token in the 'authorization' header.
 */
export type QueryWidgetArgs = {
  id: Scalars['ID']['input'];
};


/**
 * The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start.
 * Specify an access token in the 'authorization' header.
 */
export type QueryWidgetsArgs = {
  term?: InputMaybe<Scalars['String']['input']>;
};

export type RangeFilter = {
  max?: InputMaybe<Scalars['Float']['input']>;
  min?: InputMaybe<Scalars['Float']['input']>;
};

/** Represents a restaurant. */
export type Restaurant = Node & {
  __typename?: 'Restaurant';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  countryCode?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  /** A list of restaurant cuisines. */
  cuisines: Array<Maybe<Cuisine>>;
  description?: Maybe<Scalars['String']['output']>;
  /** A list of restaurant dishes. Can be filtered by menu. */
  dishes?: Maybe<DishConnection>;
  id: Scalars['ID']['output'];
  isPermanentlyClosed?: Maybe<Scalars['Boolean']['output']>;
  latitude: Scalars['Float']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  longitude: Scalars['Float']['output'];
  /** A list of restaurant menus. */
  menus: Array<Maybe<Menu>>;
  operatingHours: Array<Maybe<WorkingHours>>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  stateCode?: Maybe<Scalars['String']['output']>;
  street: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  websiteUrl?: Maybe<Scalars['String']['output']>;
  zipCode: Scalars['String']['output'];
};


/** Represents a restaurant. */
export type RestaurantDishesArgs = {
  args?: InputMaybe<PaginationArgs>;
  criteria?: InputMaybe<DishCriteria>;
};

export type RestaurantConnection = PagedConnection & {
  __typename?: 'RestaurantConnection';
  /** A list of restaurant edges. */
  edges?: Maybe<Array<RestaurantEdge>>;
  /** A list of restaurant nodes. */
  nodes?: Maybe<Array<Restaurant>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of restaurants. */
  total: Scalars['Int']['output'];
};

export type RestaurantEdge = PagedEdge & {
  __typename?: 'RestaurantEdge';
  /** A cursor for use in pagination. Generated using Base64 encoding the tag's ID. */
  cursor: Scalars['String']['output'];
  /** The restaurant at the end of Edge. */
  node: Restaurant;
};

export type ScaleLabels = {
  __typename?: 'ScaleLabels';
  end: Scalars['String']['output'];
  start: Scalars['String']['output'];
};

/** Represents a dish style. */
export type Style = Node & {
  __typename?: 'Style';
  confidence?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/** Styles that dishes must have. */
export type StyleFilter = {
  ids: Array<Scalars['ID']['input']>;
};

export type SurveyBanner = Banner & {
  __typename?: 'SurveyBanner';
  backgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  buttonAction?: Maybe<Scalars['String']['output']>;
  buttonBackgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  buttonText?: Maybe<Scalars['String']['output']>;
  buttonTextColor?: Maybe<Scalars['HexColorCode']['output']>;
  buttonTextFont?: Maybe<Scalars['String']['output']>;
  day?: Maybe<Day>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  hourEnd?: Maybe<Scalars['Hours']['output']>;
  hourStart?: Maybe<Scalars['Hours']['output']>;
  id: Scalars['ID']['output'];
  isEnabled: Scalars['Boolean']['output'];
  minutesEnd?: Maybe<Scalars['Minutes']['output']>;
  minutesStart?: Maybe<Scalars['Minutes']['output']>;
  options?: Maybe<Array<SurveyOption>>;
  position: BannerPosition;
  scaleLabels?: Maybe<ScaleLabels>;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  subtext?: Maybe<Scalars['String']['output']>;
  subtextColor?: Maybe<Scalars['HexColorCode']['output']>;
  subtextFont?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  textColor?: Maybe<Scalars['HexColorCode']['output']>;
  textFont?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type SurveyOption = {
  __typename?: 'SurveyOption';
  label: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type TimePeriod = {
  __typename?: 'TimePeriod';
  from: Array<Maybe<Scalars['Int']['output']>>;
  to: Array<Maybe<Scalars['Int']['output']>>;
};

export type UpdateBanner = {
  day?: InputMaybe<Day>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  hourEnd?: InputMaybe<Scalars['Hours']['input']>;
  hourStart?: InputMaybe<Scalars['Hours']['input']>;
  id: Scalars['ID']['input'];
  isEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  minutesEnd?: InputMaybe<Scalars['Minutes']['input']>;
  minutesStart?: InputMaybe<Scalars['Minutes']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateWidget = {
  backgroundColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  buttonBackgroundColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  buttonBorderRadius?: InputMaybe<Scalars['Int']['input']>;
  buttonFont?: InputMaybe<Scalars['Font']['input']>;
  buttonTextColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  categoryTitleFont?: InputMaybe<Scalars['Font']['input']>;
  categoryTitleTextColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  contentAreaColumnHeaderColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  contentAreaGlobalColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  displayDishDetailsLink?: InputMaybe<Scalars['Boolean']['input']>;
  displayFeedbackButton?: InputMaybe<Scalars['Boolean']['input']>;
  displayFooter?: InputMaybe<Scalars['Boolean']['input']>;
  displayGiveFeedbackBanner?: InputMaybe<Scalars['Boolean']['input']>;
  displayImages?: InputMaybe<Scalars['Boolean']['input']>;
  displayIngredients?: InputMaybe<Scalars['Boolean']['input']>;
  displayMacronutrients?: InputMaybe<Scalars['Boolean']['input']>;
  displayNavbar?: InputMaybe<Scalars['Boolean']['input']>;
  displayNotifyMeBanner?: InputMaybe<Scalars['Boolean']['input']>;
  displayNutrientPreferences?: InputMaybe<Scalars['Boolean']['input']>;
  displaySoftSignUp?: InputMaybe<Scalars['Boolean']['input']>;
  faviconUrl?: InputMaybe<Scalars['URL']['input']>;
  fontFamily?: InputMaybe<Scalars['Font']['input']>;
  footerText?: InputMaybe<Scalars['String']['input']>;
  highlightColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  htmlTitleText?: InputMaybe<Scalars['NonEmptyString']['input']>;
  id: Scalars['ID']['input'];
  isByoEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isOrderButtonEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  layout?: InputMaybe<Layout>;
  logoUrl?: InputMaybe<Scalars['URL']['input']>;
  logoWidth?: InputMaybe<Scalars['Int']['input']>;
  menuItems?: InputMaybe<Array<MenuItemInput>>;
  menuItemsTextColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  menuItemsTextHoverColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  name?: InputMaybe<Scalars['NonEmptyString']['input']>;
  navbarBackgroundColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  navbarFont?: InputMaybe<Scalars['Font']['input']>;
  navbarFontSize?: InputMaybe<Scalars['Int']['input']>;
  numberOfLocations?: InputMaybe<Scalars['Int']['input']>;
  numberOfLocationsSource?: InputMaybe<Scalars['String']['input']>;
  orderUrl?: InputMaybe<Scalars['URL']['input']>;
  pageTitleText?: InputMaybe<Scalars['NonEmptyString']['input']>;
  pageTitleTextColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  primaryBrandColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['Slug']['input']>;
  subheaderAdditionalTextColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  subheaderFont?: InputMaybe<Scalars['Font']['input']>;
  subheaderLocationTextColor?: InputMaybe<Scalars['HexColorCode']['input']>;
  supportedAllergens?: InputMaybe<Array<AllergenType>>;
  supportedDietaryPreferences?: InputMaybe<Array<DietType>>;
  usePagination?: InputMaybe<Scalars['Boolean']['input']>;
  widgetLogoUrl?: InputMaybe<Scalars['URL']['input']>;
  widgetUrl?: InputMaybe<Scalars['URL']['input']>;
};

export type Widget = Node & {
  __typename?: 'Widget';
  backgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  banners: Array<Maybe<Banner>>;
  buttonBackgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  buttonBorderRadius?: Maybe<Scalars['Int']['output']>;
  buttonFont?: Maybe<Scalars['Font']['output']>;
  buttonTextColor?: Maybe<Scalars['HexColorCode']['output']>;
  categoryTitleFont?: Maybe<Scalars['Font']['output']>;
  categoryTitleTextColor?: Maybe<Scalars['HexColorCode']['output']>;
  contentAreaColumnHeaderColor?: Maybe<Scalars['HexColorCode']['output']>;
  contentAreaGlobalColor?: Maybe<Scalars['HexColorCode']['output']>;
  createdAt: Scalars['DateTime']['output'];
  displayDishDetailsLink: Scalars['Boolean']['output'];
  displayFeedbackButton: Scalars['Boolean']['output'];
  displayFooter: Scalars['Boolean']['output'];
  displayGiveFeedbackBanner: Scalars['Boolean']['output'];
  displayImages: Scalars['Boolean']['output'];
  displayIngredients: Scalars['Boolean']['output'];
  displayMacronutrients: Scalars['Boolean']['output'];
  displayNavbar?: Maybe<Scalars['Boolean']['output']>;
  displayNotifyMeBanner: Scalars['Boolean']['output'];
  displayNutrientPreferences: Scalars['Boolean']['output'];
  displaySoftSignUp: Scalars['Boolean']['output'];
  faviconUrl?: Maybe<Scalars['URL']['output']>;
  fontFamily?: Maybe<Scalars['Font']['output']>;
  footerText?: Maybe<Scalars['String']['output']>;
  highlightColor?: Maybe<Scalars['HexColorCode']['output']>;
  htmlTitleText: Scalars['NonEmptyString']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isByoEnabled: Scalars['Boolean']['output'];
  isOrderButtonEnabled: Scalars['Boolean']['output'];
  isSyncEnabled: Scalars['Boolean']['output'];
  lastSyncedAt: Scalars['DateTime']['output'];
  layout: Layout;
  logoUrl?: Maybe<Scalars['URL']['output']>;
  logoWidth?: Maybe<Scalars['Int']['output']>;
  menuItems?: Maybe<Array<MenuItem>>;
  menuItemsTextColor?: Maybe<Scalars['HexColorCode']['output']>;
  menuItemsTextHoverColor?: Maybe<Scalars['HexColorCode']['output']>;
  name?: Maybe<Scalars['NonEmptyString']['output']>;
  navbarBackgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  navbarFont?: Maybe<Scalars['Font']['output']>;
  navbarFontSize?: Maybe<Scalars['Int']['output']>;
  numberOfLocations?: Maybe<Scalars['Int']['output']>;
  numberOfLocationsSource?: Maybe<Scalars['String']['output']>;
  orderUrl?: Maybe<Scalars['URL']['output']>;
  pageTitleText?: Maybe<Scalars['NonEmptyString']['output']>;
  pageTitleTextColor?: Maybe<Scalars['HexColorCode']['output']>;
  primaryBrandColor?: Maybe<Scalars['HexColorCode']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  slug?: Maybe<Scalars['Slug']['output']>;
  subheaderAdditionalTextColor?: Maybe<Scalars['HexColorCode']['output']>;
  subheaderFont?: Maybe<Scalars['Font']['output']>;
  subheaderLocationTextColor?: Maybe<Scalars['HexColorCode']['output']>;
  supportedAllergens: Array<AllergenType>;
  supportedDietaryPreferences: Array<DietType>;
  updatedAt: Scalars['DateTime']['output'];
  usePagination: Scalars['Boolean']['output'];
  widgetLogoUrl?: Maybe<Scalars['URL']['output']>;
  widgetUrl?: Maybe<Scalars['URL']['output']>;
};

export type WorkingHours = {
  __typename?: 'WorkingHours';
  day: Day;
  period?: Maybe<TimePeriod>;
};

export type GetPrefsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPrefsQuery = { __typename?: 'Query', widget: { __typename?: 'Widget', id: string, supportedDietaryPreferences: Array<DietType> } };

export type GetAllWidgetsBasicsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllWidgetsBasicsQuery = { __typename?: 'Query', widgets: Array<(
    { __typename?: 'Widget' }
    & { ' $fragmentRefs'?: { 'WidgetAnalyticsFieldsFragment': WidgetAnalyticsFieldsFragment } }
  ) | null> };

export type WidgetFieldsFragment = { __typename: 'Widget', id: string, name?: any | null, slug?: any | null, layout: Layout, displayImages: boolean, isActive: boolean, isOrderButtonEnabled: boolean, isByoEnabled: boolean, primaryBrandColor?: any | null, highlightColor?: any | null, backgroundColor?: any | null, orderUrl?: any | null, logoUrl?: any | null, logoWidth?: number | null, faviconUrl?: any | null, widgetLogoUrl?: any | null, widgetUrl?: any | null, supportedDietaryPreferences: Array<DietType>, supportedAllergens: Array<AllergenType>, displayIngredients: boolean, displayNutrientPreferences: boolean, displayMacronutrients: boolean, displaySoftSignUp: boolean, displayNotifyMeBanner: boolean, displayGiveFeedbackBanner: boolean, displayFeedbackButton: boolean, displayDishDetailsLink: boolean, displayNavbar?: boolean | null, usePagination: boolean, displayFooter: boolean, footerText?: string | null, buttonFont?: any | null, buttonBackgroundColor?: any | null, buttonTextColor?: any | null, buttonBorderRadius?: number | null, categoryTitleFont?: any | null, categoryTitleTextColor?: any | null, contentAreaGlobalColor?: any | null, contentAreaColumnHeaderColor?: any | null, subheaderFont?: any | null, subheaderLocationTextColor?: any | null, subheaderAdditionalTextColor?: any | null, navbarFont?: any | null, navbarFontSize?: number | null, navbarBackgroundColor?: any | null, htmlTitleText: any, pageTitleText?: any | null, pageTitleTextColor?: any | null, numberOfLocations?: number | null, numberOfLocationsSource?: string | null, createdAt: any, updatedAt: any, publishedAt?: any | null } & { ' $fragmentName'?: 'WidgetFieldsFragment' };

export type WidgetBasicFieldsFragment = { __typename: 'Widget', id: string, name?: any | null, slug?: any | null, layout: Layout, displayImages: boolean, isOrderButtonEnabled: boolean, isByoEnabled: boolean, primaryBrandColor?: any | null, highlightColor?: any | null, backgroundColor?: any | null, orderUrl?: any | null, updatedAt: any, publishedAt?: any | null, isSyncEnabled: boolean } & { ' $fragmentName'?: 'WidgetBasicFieldsFragment' };

export type WidgetDashboardFieldsFragment = { __typename: 'Widget', id: string, name?: any | null, isActive: boolean, isSyncEnabled: boolean, lastSyncedAt: any, publishedAt?: any | null, updatedAt: any } & { ' $fragmentName'?: 'WidgetDashboardFieldsFragment' };

export type WidgetAnalyticsFieldsFragment = { __typename: 'Widget', id: string, publishedAt?: any | null, displayImages: boolean, layout: Layout, isOrderButtonEnabled: boolean, isByoEnabled: boolean } & { ' $fragmentName'?: 'WidgetAnalyticsFieldsFragment' };

export type GetSmartMenusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSmartMenusQuery = { __typename?: 'Query', widgets: Array<(
    { __typename?: 'Widget' }
    & { ' $fragmentRefs'?: { 'WidgetBasicFieldsFragment': WidgetBasicFieldsFragment } }
  ) | null> };

export type SyncWidgetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SyncWidgetMutation = { __typename?: 'Mutation', syncWidget?: boolean | null };

export type ActivateWidgetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateWidgetMutation = { __typename?: 'Mutation', activateWidget?: (
    { __typename?: 'Widget' }
    & { ' $fragmentRefs'?: { 'WidgetFieldsFragment': WidgetFieldsFragment } }
  ) | null };

export type DeactivateWidgetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateWidgetMutation = { __typename?: 'Mutation', deactivateWidget?: (
    { __typename?: 'Widget' }
    & { ' $fragmentRefs'?: { 'WidgetFieldsFragment': WidgetFieldsFragment } }
  ) | null };

export type ActivateWidgetSyncMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateWidgetSyncMutation = { __typename?: 'Mutation', activateWidgetSync?: { __typename?: 'Widget', id: string, isSyncEnabled: boolean } | null };

export type DeactivateWidgetSyncMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateWidgetSyncMutation = { __typename?: 'Mutation', deactivateWidgetSync?: { __typename?: 'Widget', id: string, isSyncEnabled: boolean } | null };

export type GetWidgetQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetWidgetQuery = { __typename?: 'Query', widget: (
    { __typename?: 'Widget' }
    & { ' $fragmentRefs'?: { 'WidgetFieldsFragment': WidgetFieldsFragment } }
  ) };

export type GetAllWidgetsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllWidgetsQuery = { __typename?: 'Query', widgets: Array<{ __typename?: 'Widget', id: string, createdAt: any, publishedAt?: any | null } | null> };

export const WidgetFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Widget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"layout"}},{"kind":"Field","name":{"kind":"Name","value":"displayImages"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderButtonEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isByoEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"primaryBrandColor"}},{"kind":"Field","name":{"kind":"Name","value":"highlightColor"}},{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"orderUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoWidth"}},{"kind":"Field","name":{"kind":"Name","value":"faviconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"widgetLogoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"widgetUrl"}},{"kind":"Field","name":{"kind":"Name","value":"supportedDietaryPreferences"}},{"kind":"Field","name":{"kind":"Name","value":"supportedAllergens"}},{"kind":"Field","name":{"kind":"Name","value":"displayIngredients"}},{"kind":"Field","name":{"kind":"Name","value":"displayNutrientPreferences"}},{"kind":"Field","name":{"kind":"Name","value":"displayMacronutrients"}},{"kind":"Field","name":{"kind":"Name","value":"displaySoftSignUp"}},{"kind":"Field","name":{"kind":"Name","value":"displayNotifyMeBanner"}},{"kind":"Field","name":{"kind":"Name","value":"displayGiveFeedbackBanner"}},{"kind":"Field","name":{"kind":"Name","value":"displayFeedbackButton"}},{"kind":"Field","name":{"kind":"Name","value":"displayDishDetailsLink"}},{"kind":"Field","name":{"kind":"Name","value":"displayNavbar"}},{"kind":"Field","name":{"kind":"Name","value":"usePagination"}},{"kind":"Field","name":{"kind":"Name","value":"displayFooter"}},{"kind":"Field","name":{"kind":"Name","value":"footerText"}},{"kind":"Field","name":{"kind":"Name","value":"buttonFont"}},{"kind":"Field","name":{"kind":"Name","value":"buttonBackgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"buttonTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"buttonBorderRadius"}},{"kind":"Field","name":{"kind":"Name","value":"categoryTitleFont"}},{"kind":"Field","name":{"kind":"Name","value":"categoryTitleTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"contentAreaGlobalColor"}},{"kind":"Field","name":{"kind":"Name","value":"contentAreaColumnHeaderColor"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderFont"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderLocationTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderAdditionalTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"navbarFont"}},{"kind":"Field","name":{"kind":"Name","value":"navbarFontSize"}},{"kind":"Field","name":{"kind":"Name","value":"navbarBackgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"htmlTitleText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitleText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitleTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfLocations"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfLocationsSource"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<WidgetFieldsFragment, unknown>;
export const WidgetBasicFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetBasicFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Widget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"layout"}},{"kind":"Field","name":{"kind":"Name","value":"displayImages"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderButtonEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isByoEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"primaryBrandColor"}},{"kind":"Field","name":{"kind":"Name","value":"highlightColor"}},{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"orderUrl"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSyncEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<WidgetBasicFieldsFragment, unknown>;
export const WidgetDashboardFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetDashboardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Widget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSyncEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"lastSyncedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<WidgetDashboardFieldsFragment, unknown>;
export const WidgetAnalyticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Widget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"displayImages"}},{"kind":"Field","name":{"kind":"Name","value":"layout"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderButtonEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isByoEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<WidgetAnalyticsFieldsFragment, unknown>;
export const GetPrefsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPrefs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"widget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"StringValue","value":"1","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"supportedDietaryPreferences"}}]}}]}}]} as unknown as DocumentNode<GetPrefsQuery, GetPrefsQueryVariables>;
export const GetAllWidgetsBasicsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllWidgetsBasics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"widgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAnalyticsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Widget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"displayImages"}},{"kind":"Field","name":{"kind":"Name","value":"layout"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderButtonEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isByoEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<GetAllWidgetsBasicsQuery, GetAllWidgetsBasicsQueryVariables>;
export const GetSmartMenusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSmartMenus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"widgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetBasicFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetBasicFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Widget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"layout"}},{"kind":"Field","name":{"kind":"Name","value":"displayImages"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderButtonEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isByoEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"primaryBrandColor"}},{"kind":"Field","name":{"kind":"Name","value":"highlightColor"}},{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"orderUrl"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSyncEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<GetSmartMenusQuery, GetSmartMenusQueryVariables>;
export const SyncWidgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncWidget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncWidget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<SyncWidgetMutation, SyncWidgetMutationVariables>;
export const ActivateWidgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateWidget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateWidget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Widget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"layout"}},{"kind":"Field","name":{"kind":"Name","value":"displayImages"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderButtonEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isByoEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"primaryBrandColor"}},{"kind":"Field","name":{"kind":"Name","value":"highlightColor"}},{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"orderUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoWidth"}},{"kind":"Field","name":{"kind":"Name","value":"faviconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"widgetLogoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"widgetUrl"}},{"kind":"Field","name":{"kind":"Name","value":"supportedDietaryPreferences"}},{"kind":"Field","name":{"kind":"Name","value":"supportedAllergens"}},{"kind":"Field","name":{"kind":"Name","value":"displayIngredients"}},{"kind":"Field","name":{"kind":"Name","value":"displayNutrientPreferences"}},{"kind":"Field","name":{"kind":"Name","value":"displayMacronutrients"}},{"kind":"Field","name":{"kind":"Name","value":"displaySoftSignUp"}},{"kind":"Field","name":{"kind":"Name","value":"displayNotifyMeBanner"}},{"kind":"Field","name":{"kind":"Name","value":"displayGiveFeedbackBanner"}},{"kind":"Field","name":{"kind":"Name","value":"displayFeedbackButton"}},{"kind":"Field","name":{"kind":"Name","value":"displayDishDetailsLink"}},{"kind":"Field","name":{"kind":"Name","value":"displayNavbar"}},{"kind":"Field","name":{"kind":"Name","value":"usePagination"}},{"kind":"Field","name":{"kind":"Name","value":"displayFooter"}},{"kind":"Field","name":{"kind":"Name","value":"footerText"}},{"kind":"Field","name":{"kind":"Name","value":"buttonFont"}},{"kind":"Field","name":{"kind":"Name","value":"buttonBackgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"buttonTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"buttonBorderRadius"}},{"kind":"Field","name":{"kind":"Name","value":"categoryTitleFont"}},{"kind":"Field","name":{"kind":"Name","value":"categoryTitleTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"contentAreaGlobalColor"}},{"kind":"Field","name":{"kind":"Name","value":"contentAreaColumnHeaderColor"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderFont"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderLocationTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderAdditionalTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"navbarFont"}},{"kind":"Field","name":{"kind":"Name","value":"navbarFontSize"}},{"kind":"Field","name":{"kind":"Name","value":"navbarBackgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"htmlTitleText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitleText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitleTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfLocations"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfLocationsSource"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<ActivateWidgetMutation, ActivateWidgetMutationVariables>;
export const DeactivateWidgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateWidget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateWidget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Widget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"layout"}},{"kind":"Field","name":{"kind":"Name","value":"displayImages"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderButtonEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isByoEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"primaryBrandColor"}},{"kind":"Field","name":{"kind":"Name","value":"highlightColor"}},{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"orderUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoWidth"}},{"kind":"Field","name":{"kind":"Name","value":"faviconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"widgetLogoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"widgetUrl"}},{"kind":"Field","name":{"kind":"Name","value":"supportedDietaryPreferences"}},{"kind":"Field","name":{"kind":"Name","value":"supportedAllergens"}},{"kind":"Field","name":{"kind":"Name","value":"displayIngredients"}},{"kind":"Field","name":{"kind":"Name","value":"displayNutrientPreferences"}},{"kind":"Field","name":{"kind":"Name","value":"displayMacronutrients"}},{"kind":"Field","name":{"kind":"Name","value":"displaySoftSignUp"}},{"kind":"Field","name":{"kind":"Name","value":"displayNotifyMeBanner"}},{"kind":"Field","name":{"kind":"Name","value":"displayGiveFeedbackBanner"}},{"kind":"Field","name":{"kind":"Name","value":"displayFeedbackButton"}},{"kind":"Field","name":{"kind":"Name","value":"displayDishDetailsLink"}},{"kind":"Field","name":{"kind":"Name","value":"displayNavbar"}},{"kind":"Field","name":{"kind":"Name","value":"usePagination"}},{"kind":"Field","name":{"kind":"Name","value":"displayFooter"}},{"kind":"Field","name":{"kind":"Name","value":"footerText"}},{"kind":"Field","name":{"kind":"Name","value":"buttonFont"}},{"kind":"Field","name":{"kind":"Name","value":"buttonBackgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"buttonTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"buttonBorderRadius"}},{"kind":"Field","name":{"kind":"Name","value":"categoryTitleFont"}},{"kind":"Field","name":{"kind":"Name","value":"categoryTitleTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"contentAreaGlobalColor"}},{"kind":"Field","name":{"kind":"Name","value":"contentAreaColumnHeaderColor"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderFont"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderLocationTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderAdditionalTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"navbarFont"}},{"kind":"Field","name":{"kind":"Name","value":"navbarFontSize"}},{"kind":"Field","name":{"kind":"Name","value":"navbarBackgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"htmlTitleText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitleText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitleTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfLocations"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfLocationsSource"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<DeactivateWidgetMutation, DeactivateWidgetMutationVariables>;
export const ActivateWidgetSyncDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateWidgetSync"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateWidgetSync"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isSyncEnabled"}}]}}]}}]} as unknown as DocumentNode<ActivateWidgetSyncMutation, ActivateWidgetSyncMutationVariables>;
export const DeactivateWidgetSyncDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateWidgetSync"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateWidgetSync"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isSyncEnabled"}}]}}]}}]} as unknown as DocumentNode<DeactivateWidgetSyncMutation, DeactivateWidgetSyncMutationVariables>;
export const GetWidgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWidget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"widget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Widget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"layout"}},{"kind":"Field","name":{"kind":"Name","value":"displayImages"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderButtonEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isByoEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"primaryBrandColor"}},{"kind":"Field","name":{"kind":"Name","value":"highlightColor"}},{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"orderUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoWidth"}},{"kind":"Field","name":{"kind":"Name","value":"faviconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"widgetLogoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"widgetUrl"}},{"kind":"Field","name":{"kind":"Name","value":"supportedDietaryPreferences"}},{"kind":"Field","name":{"kind":"Name","value":"supportedAllergens"}},{"kind":"Field","name":{"kind":"Name","value":"displayIngredients"}},{"kind":"Field","name":{"kind":"Name","value":"displayNutrientPreferences"}},{"kind":"Field","name":{"kind":"Name","value":"displayMacronutrients"}},{"kind":"Field","name":{"kind":"Name","value":"displaySoftSignUp"}},{"kind":"Field","name":{"kind":"Name","value":"displayNotifyMeBanner"}},{"kind":"Field","name":{"kind":"Name","value":"displayGiveFeedbackBanner"}},{"kind":"Field","name":{"kind":"Name","value":"displayFeedbackButton"}},{"kind":"Field","name":{"kind":"Name","value":"displayDishDetailsLink"}},{"kind":"Field","name":{"kind":"Name","value":"displayNavbar"}},{"kind":"Field","name":{"kind":"Name","value":"usePagination"}},{"kind":"Field","name":{"kind":"Name","value":"displayFooter"}},{"kind":"Field","name":{"kind":"Name","value":"footerText"}},{"kind":"Field","name":{"kind":"Name","value":"buttonFont"}},{"kind":"Field","name":{"kind":"Name","value":"buttonBackgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"buttonTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"buttonBorderRadius"}},{"kind":"Field","name":{"kind":"Name","value":"categoryTitleFont"}},{"kind":"Field","name":{"kind":"Name","value":"categoryTitleTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"contentAreaGlobalColor"}},{"kind":"Field","name":{"kind":"Name","value":"contentAreaColumnHeaderColor"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderFont"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderLocationTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"subheaderAdditionalTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"navbarFont"}},{"kind":"Field","name":{"kind":"Name","value":"navbarFontSize"}},{"kind":"Field","name":{"kind":"Name","value":"navbarBackgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"htmlTitleText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitleText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitleTextColor"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfLocations"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfLocationsSource"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<GetWidgetQuery, GetWidgetQueryVariables>;
export const GetAllWidgetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllWidgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"widgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}}]}}]} as unknown as DocumentNode<GetAllWidgetsQuery, GetAllWidgetsQueryVariables>;