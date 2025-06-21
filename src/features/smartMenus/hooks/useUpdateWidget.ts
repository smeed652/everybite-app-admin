import { gql, useApolloClient } from '@apollo/client';
import { Widget, UpdateWidget } from '../../../generated/graphql';

// GraphQL fragment to get widget fields
const WIDGET_FIELDS = gql`
  fragment WidgetFields on Widget {
    id
    primaryBrandColor
    highlightColor
    backgroundColor
    __typename
    updatedAt
  }
`;

export function useUpdateWidget() {
  const client = useApolloClient();

  const updateWidgetFields = (id: string, data: Partial<Widget>) => {
    // backend uses dedicated mutations for sync
    // remove isSyncEnabled if present
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (data as Partial<Widget> & { isSyncEnabled?: unknown }).isSyncEnabled;
    const allowed: Partial<Widget> = {};
    const cacheId = client.cache.identify({ __typename: 'Widget', id });
    const existing = cacheId
      ? (client.readFragment<Widget>({ id: cacheId, fragment: gql`fragment _Compare on Widget { ${Object.keys(data).join(' ')} }` }) as Widget | null)
      : null;

    type WidgetKey = keyof Widget;
    Object.entries(data).forEach(([k, v]) => {
      if (v === undefined) return;
      const prev = existing ? (existing as Record<string, unknown>)[k] : undefined;
      if (v !== prev) {
        (allowed as Partial<Widget>)[k as WidgetKey] = v as Widget[WidgetKey];
      }
    });
    if (Object.keys(allowed).length === 0) return Promise.resolve();
    // build mutation on the fly so selection set mirrors input keys
    const keys = Object.keys(allowed) as (keyof Widget)[];
    const selection = ['id', ...keys, '__typename'].join('\n      ');
    const MUTATION = gql`mutation UpdateWidget($input: UpdateWidget!) {\n  updateWidget(input: $input) {\n      ${selection}\n  }\n}`;
    return client.mutate<{ updateWidget: Widget }, { input: UpdateWidget }>({
      mutation: MUTATION,
      variables: {
        input: { id, ...allowed } as UpdateWidget,
      },
      optimisticResponse: {
        updateWidget: (() => {
          const existing = client.readFragment<Widget>({
            id: client.cache.identify({ __typename: 'Widget', id }),
            fragment: WIDGET_FIELDS,
          }) as Widget | null;
          return {
            __typename: 'Widget',
            ...(existing ?? { id }),
            ...data,
            updatedAt: new Date().toISOString(),
          } as Widget;
        })(),
      },
    });
  };

  return { updateWidgetFields };
}
