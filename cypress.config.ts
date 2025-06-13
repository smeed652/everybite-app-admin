import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // adjust once Vite dev server is set
    supportFile: false,
  },
});
