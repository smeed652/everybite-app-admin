import { defineConfig } from "cypress";
import { config as loadEnv } from "dotenv";

// Prefer .env.test; fallback to .env.local if vars missing
loadEnv({ path: ".env.test", override: false });
loadEnv({ path: ".env.local", override: false });

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    // Performance optimizations
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    // Reduce video recording overhead
    video: false,
    // Reduce screenshot overhead
    screenshotOnRunFailure: false,
    env: {
      username: process.env.CYPRESS_USERNAME,
      password: process.env.CYPRESS_PASSWORD,
    },
  },
});
