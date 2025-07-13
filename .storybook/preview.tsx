import type { Preview } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import '../src/index.css'; // tailwind styles
import { apolloClient } from '../src/lib/apollo';

// Initialize MSW once
initialize({ onUnhandledRequest: 'warn' });

const decorators: Preview['decorators'] = [
  // Tailwind styles are global via import above
  (Story) => (
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <Story />
      </ApolloProvider>
    </BrowserRouter>
  ),
  mswDecorator,
];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators,
};

export default preview;
