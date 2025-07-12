/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vite configuration for EveryBite Admin Panel
// This is minimal for now; additional aliases or env handling can be added later.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true
  },
  // Vitest configuration for unit tests
  test: {
    // run every *.test or *.spec file inside src
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/src/stories/**', '**/.storybook/**'],
    environment: 'happy-dom',
    setupFiles: './src/setupTests.ts',
    globals: true
  }
});