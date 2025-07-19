import { ApolloProvider } from "@apollo/client";
import type { Preview } from "@storybook/react";
import React from "react";
import "../src/index.css";
import { lambdaClient } from "../src/lib/datawarehouse-lambda-apollo";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ApolloProvider client={lambdaClient!}>
        <Story />
      </ApolloProvider>
    ),
  ],
};

export default preview;
