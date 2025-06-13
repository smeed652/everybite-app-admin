// Jest setup file
import '@testing-library/jest-dom';

// Mock Vite env variables for tests
process.env = {
  ...process.env,
  VITE_GRAPHQL_URI: process.env.VITE_GRAPHQL_URI || 'https://api.everybite.com/graphql',
  VITE_LOG_LEVEL: process.env.VITE_LOG_LEVEL || 'debug',
};
