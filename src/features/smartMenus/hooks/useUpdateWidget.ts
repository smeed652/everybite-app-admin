import { gql, useApolloClient } from "@apollo/client";
import type { UpdateWidget, Widget } from "../../../generated/graphql";

// GraphQL fragment to get widget fields - aligned with the actual GraphQL schema
const WIDGET_FIELDS = gql`
  fragment WidgetFields on Widget {
    id
    name
    slug
    layout
    displayImages
    isActive
    isOrderButtonEnabled
    primaryBrandColor
    highlightColor
    backgroundColor
    orderUrl
    supportedDietaryPreferences
    displayIngredients
    supportedAllergens
    displayNutrientPreferences
    displayMacronutrients
    isByoEnabled
    displaySoftSignUp
    displayNotifyMeBanner
    displayGiveFeedbackBanner
    displayFeedbackButton
    displayDishDetailsLink
    displayFooter
    displayNavbar
    usePagination
    publishedAt
    updatedAt
    __typename
  }
`;

export function useUpdateWidget() {
  const client = useApolloClient();

  const updateWidgetFields = (id: string, data: Partial<Widget>) => {
    // backend uses dedicated mutations for sync
    // remove isSyncEnabled if present
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (data as Partial<Widget> & { isSyncEnabled?: unknown })
      .isSyncEnabled;
    const allowed: Partial<Widget> = {};
    const cacheId = client.cache.identify({ __typename: "Widget", id });

    // Read existing data from cache using a proper fragment
    const existing = cacheId
      ? (client.readFragment<Widget>({
          id: cacheId,
          fragment: WIDGET_FIELDS,
        }) as Widget | null)
      : null;

    type WidgetKey = keyof Widget;
    Object.entries(data).forEach(([k, v]) => {
      if (v === undefined) return;
      const prev = existing
        ? (existing as Record<string, unknown>)[k]
        : undefined;
      // Only include the field if it's actually different from the existing value
      if (JSON.stringify(v) !== JSON.stringify(prev)) {
        (allowed as Partial<Widget>)[k as WidgetKey] = v as Widget[WidgetKey];
      }
    });

    if (Object.keys(allowed).length === 0) return Promise.resolve();

    // Debug logging to see what's being sent
    console.log("[useUpdateWidget] Sending mutation with:", {
      id,
      allowed,
      keys: Object.keys(allowed),
      input: { id, ...allowed },
    });

    // Use a fixed mutation that matches our WIDGET_FIELDS fragment
    const MUTATION = gql`
      mutation UpdateWidget($input: UpdateWidget!) {
        updateWidget(input: $input) {
          id
          name
          slug
          layout
          displayImages
          isActive
          isOrderButtonEnabled
          primaryBrandColor
          highlightColor
          backgroundColor
          orderUrl
          supportedDietaryPreferences
          displayIngredients
          supportedAllergens
          displayNutrientPreferences
          displayMacronutrients
          isByoEnabled
          displaySoftSignUp
          displayNotifyMeBanner
          displayGiveFeedbackBanner
          displayFeedbackButton
          displayDishDetailsLink
          displayFooter
          displayNavbar
          usePagination
          publishedAt
          updatedAt
          __typename
        }
      }
    `;

    return client
      .mutate<{ updateWidget: Widget }, { input: UpdateWidget }>({
        mutation: MUTATION,
        variables: {
          input: { id, ...allowed } as UpdateWidget,
        },
        optimisticResponse: {
          updateWidget: (() => {
            const existing = client.readFragment<Widget>({
              id: client.cache.identify({ __typename: "Widget", id }),
              fragment: WIDGET_FIELDS,
            }) as Widget | null;
            return {
              __typename: "Widget",
              ...(existing ?? { id }),
              ...allowed, // Only use the fields that are actually being sent
              updatedAt: new Date().toISOString(),
            } as Widget;
          })(),
        },
      })
      .catch((error) => {
        console.error("[useUpdateWidget] GraphQL Error:", {
          error,
          message: error.message,
          graphQLErrors: error.graphQLErrors,
          networkError: error.networkError,
          input: { id, ...allowed },
        });
        throw error;
      });
  };

  return { updateWidgetFields };
}
