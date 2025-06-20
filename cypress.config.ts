import { defineConfig } from 'cypress';
import { config as loadEnv } from 'dotenv';

// Prefer .env.test; fallback to .env.local if vars missing
loadEnv({ path: '.env.test', override: false });
loadEnv({ path: '.env.local', override: false });

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    env: {
      username: process.env.CYPRESS_USERNAME,
      password: process.env.CYPRESS_PASSWORD,
    },
  },
});
