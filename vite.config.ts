import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vite configuration for EveryBite Admin Panel
// This is minimal for now; additional aliases or env handling can be added later.
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  // Vitest configuration for unit tests
  test: {
    // run every *.test or *.spec file inside src
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'happy-dom',
    setupFiles: './src/setupTests.ts',
    globals: true,
  }
});
