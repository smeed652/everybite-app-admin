import type { Preview } from '@storybook/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ApolloProvider } from '@apollo/client';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import '../src/index.css'; // tailwind styles
import { client as apolloClient } from '../src/lib/apollo';

// Initialize MSW once
initialize({ onUnhandledRequest: 'warn' });

const globalDecorators: Preview['decorators'] = [
  // Tailwind styles are global via import above
  (Story) => (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ApolloProvider client={apolloClient}>
        <Story />
                </ApolloProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  ),
  mswDecorator,
];

// Export for Storybook to pick up
export const decorators = globalDecorators;

export const parameters: Preview['parameters'] = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const preview: Preview = {
  decorators: globalDecorators,
  parameters,
};

export default preview;
