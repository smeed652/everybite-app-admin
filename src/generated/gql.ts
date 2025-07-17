/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import * as types from "./graphql";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n  query GetPrefs {\n    widget(id: "1") {\n      id\n      supportedDietaryPreferences\n    }\n  }\n': typeof types.GetPrefsDocument;
  "\n  query GetAllWidgetsBasics {\n    widgets {\n      ...WidgetAnalyticsFields\n    }\n  }\n  \n": typeof types.GetAllWidgetsBasicsDocument;
  "\n  fragment WidgetFields on Widget {\n    # Core identification\n    id\n    name\n    slug\n\n    # Layout and display\n    layout\n    displayImages\n    isActive\n    isOrderButtonEnabled\n    isByoEnabled\n\n    # Colors and branding\n    primaryBrandColor\n    highlightColor\n    backgroundColor\n\n    # URLs and links\n    orderUrl\n    logoUrl\n    logoWidth\n    faviconUrl\n    widgetLogoUrl\n    widgetUrl\n\n    # Dietary and allergen preferences\n    supportedDietaryPreferences\n    supportedAllergens\n    displayIngredients\n    displayNutrientPreferences\n    displayMacronutrients\n\n    # CTA and feedback flags\n    displaySoftSignUp\n    displayNotifyMeBanner\n    displayGiveFeedbackBanner\n    displayFeedbackButton\n    displayDishDetailsLink\n\n    # Navigation and pagination\n    displayNavbar\n    usePagination\n    displayFooter\n    footerText\n\n    # Button styling\n    buttonFont\n    buttonBackgroundColor\n    buttonTextColor\n    buttonBorderRadius\n\n    # Typography and text colors\n    categoryTitleFont\n    categoryTitleTextColor\n    contentAreaGlobalColor\n    contentAreaColumnHeaderColor\n    subheaderFont\n    subheaderLocationTextColor\n    subheaderAdditionalTextColor\n    navbarFont\n    navbarFontSize\n    navbarBackgroundColor\n\n    # Page content\n    htmlTitleText\n    pageTitleText\n    pageTitleTextColor\n\n    # Location and metadata\n    numberOfLocations\n    numberOfLocationsSource\n\n    # Timestamps\n    createdAt\n    updatedAt\n    publishedAt\n\n    # Required for Apollo Client\n    __typename\n  }\n": typeof types.WidgetFieldsFragmentDoc;
  "\n  fragment WidgetBasicFields on Widget {\n    id\n    name\n    slug\n    layout\n    displayImages\n    isOrderButtonEnabled\n    isByoEnabled\n    primaryBrandColor\n    highlightColor\n    backgroundColor\n    orderUrl\n    updatedAt\n    publishedAt\n    isSyncEnabled\n    __typename\n  }\n": typeof types.WidgetBasicFieldsFragmentDoc;
  "\n  fragment WidgetDashboardFields on Widget {\n    id\n    name\n    isActive\n    isSyncEnabled\n    lastSyncedAt\n    publishedAt\n    updatedAt\n    __typename\n  }\n": typeof types.WidgetDashboardFieldsFragmentDoc;
  "\n  fragment WidgetAnalyticsFields on Widget {\n    id\n    publishedAt\n    displayImages\n    layout\n    isOrderButtonEnabled\n    isByoEnabled\n    __typename\n  }\n": typeof types.WidgetAnalyticsFieldsFragmentDoc;
  "\n  query GetSmartMenus {\n    widgets {\n      ...WidgetBasicFields\n    }\n  }\n  \n": typeof types.GetSmartMenusDocument;
  "\n  mutation SyncWidget($id: ID!) {\n    syncWidget(id: $id)\n  }\n": typeof types.SyncWidgetDocument;
  "\n  mutation ActivateWidget($id: ID!) {\n    activateWidget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n": typeof types.ActivateWidgetDocument;
  "\n  mutation DeactivateWidget($id: ID!) {\n    deactivateWidget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n": typeof types.DeactivateWidgetDocument;
  "\n  mutation ActivateWidgetSync($id: ID!) {\n    activateWidgetSync(id: $id) {\n      id\n      isSyncEnabled\n    }\n  }\n": typeof types.ActivateWidgetSyncDocument;
  "\n  mutation DeactivateWidgetSync($id: ID!) {\n    deactivateWidgetSync(id: $id) {\n      id\n      isSyncEnabled\n    }\n  }\n": typeof types.DeactivateWidgetSyncDocument;
  "\n  query GetWidget($id: ID!) {\n    widget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n": typeof types.GetWidgetDocument;
  "\n  query GetAllWidgets {\n    widgets {\n      id\n      createdAt\n      publishedAt\n    }\n  }\n": typeof types.GetAllWidgetsDocument;
  "\n  query MetabaseUsers($page: Int, $pageSize: Int) {\n    metabaseUsers(page: $page, pageSize: $pageSize) {\n      users {\n        id\n        email\n        firstName\n        lastName\n        name\n        dateJoined\n        lastLogin\n        isActive\n        isSuperuser\n        isQbnewb\n        locale\n        ssoSource\n      }\n      total\n    }\n  }\n": typeof types.MetabaseUsersDocument;
};
const documents: Documents = {
  '\n  query GetPrefs {\n    widget(id: "1") {\n      id\n      supportedDietaryPreferences\n    }\n  }\n':
    types.GetPrefsDocument,
  "\n  query GetAllWidgetsBasics {\n    widgets {\n      ...WidgetAnalyticsFields\n    }\n  }\n  \n":
    types.GetAllWidgetsBasicsDocument,
  "\n  fragment WidgetFields on Widget {\n    # Core identification\n    id\n    name\n    slug\n\n    # Layout and display\n    layout\n    displayImages\n    isActive\n    isOrderButtonEnabled\n    isByoEnabled\n\n    # Colors and branding\n    primaryBrandColor\n    highlightColor\n    backgroundColor\n\n    # URLs and links\n    orderUrl\n    logoUrl\n    logoWidth\n    faviconUrl\n    widgetLogoUrl\n    widgetUrl\n\n    # Dietary and allergen preferences\n    supportedDietaryPreferences\n    supportedAllergens\n    displayIngredients\n    displayNutrientPreferences\n    displayMacronutrients\n\n    # CTA and feedback flags\n    displaySoftSignUp\n    displayNotifyMeBanner\n    displayGiveFeedbackBanner\n    displayFeedbackButton\n    displayDishDetailsLink\n\n    # Navigation and pagination\n    displayNavbar\n    usePagination\n    displayFooter\n    footerText\n\n    # Button styling\n    buttonFont\n    buttonBackgroundColor\n    buttonTextColor\n    buttonBorderRadius\n\n    # Typography and text colors\n    categoryTitleFont\n    categoryTitleTextColor\n    contentAreaGlobalColor\n    contentAreaColumnHeaderColor\n    subheaderFont\n    subheaderLocationTextColor\n    subheaderAdditionalTextColor\n    navbarFont\n    navbarFontSize\n    navbarBackgroundColor\n\n    # Page content\n    htmlTitleText\n    pageTitleText\n    pageTitleTextColor\n\n    # Location and metadata\n    numberOfLocations\n    numberOfLocationsSource\n\n    # Timestamps\n    createdAt\n    updatedAt\n    publishedAt\n\n    # Required for Apollo Client\n    __typename\n  }\n":
    types.WidgetFieldsFragmentDoc,
  "\n  fragment WidgetBasicFields on Widget {\n    id\n    name\n    slug\n    layout\n    displayImages\n    isOrderButtonEnabled\n    isByoEnabled\n    primaryBrandColor\n    highlightColor\n    backgroundColor\n    orderUrl\n    updatedAt\n    publishedAt\n    isSyncEnabled\n    __typename\n  }\n":
    types.WidgetBasicFieldsFragmentDoc,
  "\n  fragment WidgetDashboardFields on Widget {\n    id\n    name\n    isActive\n    isSyncEnabled\n    lastSyncedAt\n    publishedAt\n    updatedAt\n    __typename\n  }\n":
    types.WidgetDashboardFieldsFragmentDoc,
  "\n  fragment WidgetAnalyticsFields on Widget {\n    id\n    publishedAt\n    displayImages\n    layout\n    isOrderButtonEnabled\n    isByoEnabled\n    __typename\n  }\n":
    types.WidgetAnalyticsFieldsFragmentDoc,
  "\n  query GetSmartMenus {\n    widgets {\n      ...WidgetBasicFields\n    }\n  }\n  \n":
    types.GetSmartMenusDocument,
  "\n  mutation SyncWidget($id: ID!) {\n    syncWidget(id: $id)\n  }\n":
    types.SyncWidgetDocument,
  "\n  mutation ActivateWidget($id: ID!) {\n    activateWidget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n":
    types.ActivateWidgetDocument,
  "\n  mutation DeactivateWidget($id: ID!) {\n    deactivateWidget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n":
    types.DeactivateWidgetDocument,
  "\n  mutation ActivateWidgetSync($id: ID!) {\n    activateWidgetSync(id: $id) {\n      id\n      isSyncEnabled\n    }\n  }\n":
    types.ActivateWidgetSyncDocument,
  "\n  mutation DeactivateWidgetSync($id: ID!) {\n    deactivateWidgetSync(id: $id) {\n      id\n      isSyncEnabled\n    }\n  }\n":
    types.DeactivateWidgetSyncDocument,
  "\n  query GetWidget($id: ID!) {\n    widget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n":
    types.GetWidgetDocument,
  "\n  query GetAllWidgets {\n    widgets {\n      id\n      createdAt\n      publishedAt\n    }\n  }\n":
    types.GetAllWidgetsDocument,
  "\n  query MetabaseUsers($page: Int, $pageSize: Int) {\n    metabaseUsers(page: $page, pageSize: $pageSize) {\n      users {\n        id\n        email\n        firstName\n        lastName\n        name\n        dateJoined\n        lastLogin\n        isActive\n        isSuperuser\n        isQbnewb\n        locale\n        ssoSource\n      }\n      total\n    }\n  }\n":
    types.MetabaseUsersDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: '\n  query GetPrefs {\n    widget(id: "1") {\n      id\n      supportedDietaryPreferences\n    }\n  }\n'
): (typeof documents)['\n  query GetPrefs {\n    widget(id: "1") {\n      id\n      supportedDietaryPreferences\n    }\n  }\n'];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetAllWidgetsBasics {\n    widgets {\n      ...WidgetAnalyticsFields\n    }\n  }\n  \n"
): (typeof documents)["\n  query GetAllWidgetsBasics {\n    widgets {\n      ...WidgetAnalyticsFields\n    }\n  }\n  \n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment WidgetFields on Widget {\n    # Core identification\n    id\n    name\n    slug\n\n    # Layout and display\n    layout\n    displayImages\n    isActive\n    isOrderButtonEnabled\n    isByoEnabled\n\n    # Colors and branding\n    primaryBrandColor\n    highlightColor\n    backgroundColor\n\n    # URLs and links\n    orderUrl\n    logoUrl\n    logoWidth\n    faviconUrl\n    widgetLogoUrl\n    widgetUrl\n\n    # Dietary and allergen preferences\n    supportedDietaryPreferences\n    supportedAllergens\n    displayIngredients\n    displayNutrientPreferences\n    displayMacronutrients\n\n    # CTA and feedback flags\n    displaySoftSignUp\n    displayNotifyMeBanner\n    displayGiveFeedbackBanner\n    displayFeedbackButton\n    displayDishDetailsLink\n\n    # Navigation and pagination\n    displayNavbar\n    usePagination\n    displayFooter\n    footerText\n\n    # Button styling\n    buttonFont\n    buttonBackgroundColor\n    buttonTextColor\n    buttonBorderRadius\n\n    # Typography and text colors\n    categoryTitleFont\n    categoryTitleTextColor\n    contentAreaGlobalColor\n    contentAreaColumnHeaderColor\n    subheaderFont\n    subheaderLocationTextColor\n    subheaderAdditionalTextColor\n    navbarFont\n    navbarFontSize\n    navbarBackgroundColor\n\n    # Page content\n    htmlTitleText\n    pageTitleText\n    pageTitleTextColor\n\n    # Location and metadata\n    numberOfLocations\n    numberOfLocationsSource\n\n    # Timestamps\n    createdAt\n    updatedAt\n    publishedAt\n\n    # Required for Apollo Client\n    __typename\n  }\n"
): (typeof documents)["\n  fragment WidgetFields on Widget {\n    # Core identification\n    id\n    name\n    slug\n\n    # Layout and display\n    layout\n    displayImages\n    isActive\n    isOrderButtonEnabled\n    isByoEnabled\n\n    # Colors and branding\n    primaryBrandColor\n    highlightColor\n    backgroundColor\n\n    # URLs and links\n    orderUrl\n    logoUrl\n    logoWidth\n    faviconUrl\n    widgetLogoUrl\n    widgetUrl\n\n    # Dietary and allergen preferences\n    supportedDietaryPreferences\n    supportedAllergens\n    displayIngredients\n    displayNutrientPreferences\n    displayMacronutrients\n\n    # CTA and feedback flags\n    displaySoftSignUp\n    displayNotifyMeBanner\n    displayGiveFeedbackBanner\n    displayFeedbackButton\n    displayDishDetailsLink\n\n    # Navigation and pagination\n    displayNavbar\n    usePagination\n    displayFooter\n    footerText\n\n    # Button styling\n    buttonFont\n    buttonBackgroundColor\n    buttonTextColor\n    buttonBorderRadius\n\n    # Typography and text colors\n    categoryTitleFont\n    categoryTitleTextColor\n    contentAreaGlobalColor\n    contentAreaColumnHeaderColor\n    subheaderFont\n    subheaderLocationTextColor\n    subheaderAdditionalTextColor\n    navbarFont\n    navbarFontSize\n    navbarBackgroundColor\n\n    # Page content\n    htmlTitleText\n    pageTitleText\n    pageTitleTextColor\n\n    # Location and metadata\n    numberOfLocations\n    numberOfLocationsSource\n\n    # Timestamps\n    createdAt\n    updatedAt\n    publishedAt\n\n    # Required for Apollo Client\n    __typename\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment WidgetBasicFields on Widget {\n    id\n    name\n    slug\n    layout\n    displayImages\n    isOrderButtonEnabled\n    isByoEnabled\n    primaryBrandColor\n    highlightColor\n    backgroundColor\n    orderUrl\n    updatedAt\n    publishedAt\n    isSyncEnabled\n    __typename\n  }\n"
): (typeof documents)["\n  fragment WidgetBasicFields on Widget {\n    id\n    name\n    slug\n    layout\n    displayImages\n    isOrderButtonEnabled\n    isByoEnabled\n    primaryBrandColor\n    highlightColor\n    backgroundColor\n    orderUrl\n    updatedAt\n    publishedAt\n    isSyncEnabled\n    __typename\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment WidgetDashboardFields on Widget {\n    id\n    name\n    isActive\n    isSyncEnabled\n    lastSyncedAt\n    publishedAt\n    updatedAt\n    __typename\n  }\n"
): (typeof documents)["\n  fragment WidgetDashboardFields on Widget {\n    id\n    name\n    isActive\n    isSyncEnabled\n    lastSyncedAt\n    publishedAt\n    updatedAt\n    __typename\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment WidgetAnalyticsFields on Widget {\n    id\n    publishedAt\n    displayImages\n    layout\n    isOrderButtonEnabled\n    isByoEnabled\n    __typename\n  }\n"
): (typeof documents)["\n  fragment WidgetAnalyticsFields on Widget {\n    id\n    publishedAt\n    displayImages\n    layout\n    isOrderButtonEnabled\n    isByoEnabled\n    __typename\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetSmartMenus {\n    widgets {\n      ...WidgetBasicFields\n    }\n  }\n  \n"
): (typeof documents)["\n  query GetSmartMenus {\n    widgets {\n      ...WidgetBasicFields\n    }\n  }\n  \n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation SyncWidget($id: ID!) {\n    syncWidget(id: $id)\n  }\n"
): (typeof documents)["\n  mutation SyncWidget($id: ID!) {\n    syncWidget(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation ActivateWidget($id: ID!) {\n    activateWidget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n"
): (typeof documents)["\n  mutation ActivateWidget($id: ID!) {\n    activateWidget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation DeactivateWidget($id: ID!) {\n    deactivateWidget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n"
): (typeof documents)["\n  mutation DeactivateWidget($id: ID!) {\n    deactivateWidget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation ActivateWidgetSync($id: ID!) {\n    activateWidgetSync(id: $id) {\n      id\n      isSyncEnabled\n    }\n  }\n"
): (typeof documents)["\n  mutation ActivateWidgetSync($id: ID!) {\n    activateWidgetSync(id: $id) {\n      id\n      isSyncEnabled\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation DeactivateWidgetSync($id: ID!) {\n    deactivateWidgetSync(id: $id) {\n      id\n      isSyncEnabled\n    }\n  }\n"
): (typeof documents)["\n  mutation DeactivateWidgetSync($id: ID!) {\n    deactivateWidgetSync(id: $id) {\n      id\n      isSyncEnabled\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetWidget($id: ID!) {\n    widget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n"
): (typeof documents)["\n  query GetWidget($id: ID!) {\n    widget(id: $id) {\n      ...WidgetFields\n    }\n  }\n  \n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetAllWidgets {\n    widgets {\n      id\n      createdAt\n      publishedAt\n    }\n  }\n"
): (typeof documents)["\n  query GetAllWidgets {\n    widgets {\n      id\n      createdAt\n      publishedAt\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
