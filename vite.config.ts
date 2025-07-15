import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Vite configuration for EveryBite Admin Panel
// This is minimal for now; additional aliases or env handling can be added later.

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  // Vitest configuration for unit tests
  test: {
    // run every *.test or *.spec file inside src
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/src/stories/**", "**/.storybook/**"],
    environment: "happy-dom",
    setupFiles: "./src/setupTests.ts",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "**/*.stories.tsx",
        "**/*.d.ts",
        "src/generated/**",
        "**/node_modules/**",
        "**/.storybook/**",
      ],
    },
  },
});
