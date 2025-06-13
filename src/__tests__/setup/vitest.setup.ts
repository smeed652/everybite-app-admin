// Setup file for Vitest
import { vi } from 'vitest';
import type { PluginOption } from 'vite';
import '@testing-library/jest-dom';

// Mock Vite env variables for tests
vi.mock('vite', async () => {
  const actual = await vi.importActual<typeof import('vite')>('vite');
  return {
    ...actual,
    loadEnv: () => ({
      VITE_GRAPHQL_URI: process.env.VITE_GRAPHQL_URI || 'https://api.everybite.com/graphql',
      VITE_LOG_LEVEL: process.env.VITE_LOG_LEVEL || 'debug',
    }),
  };
});
