import { gql } from "@apollo/client";
import { WIDGET_ANALYTICS_FIELDS } from "../../../smartMenus/graphql/fragments";

// Dashboard widgets query (from api.everybite.com/graphql)
export const API_GET_ALL_WIDGETS = gql /* GraphQL */ `
  query GetAllWidgets {
    widgets {
      id
      createdAt
      publishedAt
      numberOfLocations
    }
  }
`;

// Player analytics query (from api.everybite.com/graphql)
export const API_GET_ALL_WIDGETS_BASICS = gql`
  query GetAllWidgetsBasics {
    widgets {
      ...WidgetAnalyticsFields
    }
  }
  ${WIDGET_ANALYTICS_FIELDS}
`;
