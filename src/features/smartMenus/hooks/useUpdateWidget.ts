import { gql, useApolloClient } from "@apollo/client";
import type { UpdateWidget, Widget } from "../../../generated/graphql";
import { logger } from "../../../lib/logger";
import { WIDGET_FIELDS } from "../graphql/fragments";

export function useUpdateWidget() {
  const client = useApolloClient();

  const updateWidgetFields = (id: string, data: Partial<Widget>) => {
    // backend uses dedicated mutations for sync
    // remove isSyncEnabled if present
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (data as Partial<Widget> & { isSyncEnabled?: unknown })
      .isSyncEnabled;
    // The data passed in is already filtered by useWidgetDiff to only include changed fields
    // No need to do additional comparison here
    const allowed = data;

    if (Object.keys(allowed).length === 0) return Promise.resolve();

    // Debug logging to see what's being sent
    logger.debug("[useUpdateWidget] Sending mutation with:", {
      id,
      allowed,
      keys: Object.keys(allowed),
      input: { id, ...allowed },
    });

    // build mutation on the fly so selection set mirrors input keys
    const keys = Object.keys(allowed) as (keyof Widget)[];
    const selection = ["id", ...keys, "__typename"].join("\n      ");
    const MUTATION = gql`mutation UpdateWidget($input: UpdateWidget!) {\n  updateWidget(input: $input) {\n      ${selection}\n  }\n}`;

    // Log the actual GraphQL mutation being sent
    logger.debug(
      "[useUpdateWidget] GraphQL Mutation:",
      MUTATION.loc?.source.body
    );

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
        logger.error("[useUpdateWidget] GraphQL Error:", {
          error,
          message: error.message,
          graphQLErrors: error.graphQLErrors,
          networkError: error.networkError,
          input: { id, ...allowed },
        });

        // Log the full error response if available
        if (error.networkError) {
          logger.error("[useUpdateWidget] Network Error Details:", {
            statusCode: error.networkError.statusCode,
            bodyText: error.networkError.bodyText,
            result: error.networkError.result,
            name: error.networkError.name,
            message: error.networkError.message,
            stack: error.networkError.stack,
          });
        }

        // Also log the full error object to see what's available
        logger.error(
          "[useUpdateWidget] Full Error Object:",
          JSON.stringify(error, null, 2)
        );

        throw error;
      });
  };

  return { updateWidgetFields };
}
