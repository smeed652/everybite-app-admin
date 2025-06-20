/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

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
    "\n  query GetAllWidgetsBasics {\n    widgets {\n      id\n      publishedAt\n      displayImages\n      layout\n      isOrderButtonEnabled\n      isByoEnabled\n    }\n  }\n": typeof types.GetAllWidgetsBasicsDocument,
    "\n  query GetSmartMenus {\n    widgets {\n      id\n      name\n      slug\n      updatedAt\n      publishedAt\n      displayImages\n      isOrderButtonEnabled\n      layout\n      primaryBrandColor\n      highlightColor\n      backgroundColor\n      orderUrl\n    }\n  }\n": typeof types.GetSmartMenusDocument,
    "\n  query GetWidget($id: ID!) {\n    widget(id: $id) {\n      id\n      name\n      slug\n      layout\n      displayImages\n      isActive\n      isOrderButtonEnabled\n      primaryBrandColor\n      highlightColor\n      backgroundColor\n      orderUrl\n      supportedDietaryPreferences\n      displayIngredients\n      supportedAllergens\n      displayNutrientPreferences\n      displayMacronutrients\n      isByoEnabled\n      # CTA flags\n      displaySoftSignUp\n      displayNotifyMeBanner\n      displayGiveFeedbackBanner\n      displayFeedbackButton\n      displayDishDetailsLink\n      updatedAt\n      publishedAt\n    }\n  }\n": typeof types.GetWidgetDocument,
    "\n  query GetAllWidgets {\n    widgets {\n      id\n      createdAt\n      publishedAt\n    }\n  }\n": typeof types.GetAllWidgetsDocument,
};
const documents: Documents = {
    "\n  query GetAllWidgetsBasics {\n    widgets {\n      id\n      publishedAt\n      displayImages\n      layout\n      isOrderButtonEnabled\n      isByoEnabled\n    }\n  }\n": types.GetAllWidgetsBasicsDocument,
    "\n  query GetSmartMenus {\n    widgets {\n      id\n      name\n      slug\n      updatedAt\n      publishedAt\n      displayImages\n      isOrderButtonEnabled\n      layout\n      primaryBrandColor\n      highlightColor\n      backgroundColor\n      orderUrl\n    }\n  }\n": types.GetSmartMenusDocument,
    "\n  query GetWidget($id: ID!) {\n    widget(id: $id) {\n      id\n      name\n      slug\n      layout\n      displayImages\n      isActive\n      isOrderButtonEnabled\n      primaryBrandColor\n      highlightColor\n      backgroundColor\n      orderUrl\n      supportedDietaryPreferences\n      displayIngredients\n      supportedAllergens\n      displayNutrientPreferences\n      displayMacronutrients\n      isByoEnabled\n      # CTA flags\n      displaySoftSignUp\n      displayNotifyMeBanner\n      displayGiveFeedbackBanner\n      displayFeedbackButton\n      displayDishDetailsLink\n      updatedAt\n      publishedAt\n    }\n  }\n": types.GetWidgetDocument,
    "\n  query GetAllWidgets {\n    widgets {\n      id\n      createdAt\n      publishedAt\n    }\n  }\n": types.GetAllWidgetsDocument,
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
export function gql(source: "\n  query GetAllWidgetsBasics {\n    widgets {\n      id\n      publishedAt\n      displayImages\n      layout\n      isOrderButtonEnabled\n      isByoEnabled\n    }\n  }\n"): (typeof documents)["\n  query GetAllWidgetsBasics {\n    widgets {\n      id\n      publishedAt\n      displayImages\n      layout\n      isOrderButtonEnabled\n      isByoEnabled\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetSmartMenus {\n    widgets {\n      id\n      name\n      slug\n      updatedAt\n      publishedAt\n      displayImages\n      isOrderButtonEnabled\n      layout\n      primaryBrandColor\n      highlightColor\n      backgroundColor\n      orderUrl\n    }\n  }\n"): (typeof documents)["\n  query GetSmartMenus {\n    widgets {\n      id\n      name\n      slug\n      updatedAt\n      publishedAt\n      displayImages\n      isOrderButtonEnabled\n      layout\n      primaryBrandColor\n      highlightColor\n      backgroundColor\n      orderUrl\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetWidget($id: ID!) {\n    widget(id: $id) {\n      id\n      name\n      slug\n      layout\n      displayImages\n      isActive\n      isOrderButtonEnabled\n      primaryBrandColor\n      highlightColor\n      backgroundColor\n      orderUrl\n      supportedDietaryPreferences\n      displayIngredients\n      supportedAllergens\n      displayNutrientPreferences\n      displayMacronutrients\n      isByoEnabled\n      # CTA flags\n      displaySoftSignUp\n      displayNotifyMeBanner\n      displayGiveFeedbackBanner\n      displayFeedbackButton\n      displayDishDetailsLink\n      updatedAt\n      publishedAt\n    }\n  }\n"): (typeof documents)["\n  query GetWidget($id: ID!) {\n    widget(id: $id) {\n      id\n      name\n      slug\n      layout\n      displayImages\n      isActive\n      isOrderButtonEnabled\n      primaryBrandColor\n      highlightColor\n      backgroundColor\n      orderUrl\n      supportedDietaryPreferences\n      displayIngredients\n      supportedAllergens\n      displayNutrientPreferences\n      displayMacronutrients\n      isByoEnabled\n      # CTA flags\n      displaySoftSignUp\n      displayNotifyMeBanner\n      displayGiveFeedbackBanner\n      displayFeedbackButton\n      displayDishDetailsLink\n      updatedAt\n      publishedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAllWidgets {\n    widgets {\n      id\n      createdAt\n      publishedAt\n    }\n  }\n"): (typeof documents)["\n  query GetAllWidgets {\n    widgets {\n      id\n      createdAt\n      publishedAt\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;