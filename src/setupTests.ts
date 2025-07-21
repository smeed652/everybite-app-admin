import { config } from "dotenv";
config({ path: ".env.test" });
// Jest setup file
import "@testing-library/jest-dom";

// Mock Vite env variables for tests
if (typeof process !== "undefined" && process.env) {
  // Cast required because we're overwriting in a test-only context
  process.env = {
    ...process.env,
    VITE_GRAPHQL_URI:
      process.env.VITE_GRAPHQL_URI || "https://api.everybite.com/graphql",
    VITE_LOG_LEVEL: process.env.VITE_LOG_LEVEL || "debug",
  } as typeof process.env;
}
