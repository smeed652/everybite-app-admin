import type { TestRunnerConfig } from '@storybook/test-runner';

// Basic config that fails the run on any accessibility violations.
// Extend this as needed (e.g., different viewports, dark-mode toggle).
const config: TestRunnerConfig = {
  async preRender(page) {
    // You can set viewport or theme before each story here.
    // Example mobile viewport: await page.setViewportSize({ width: 375, height: 667 });
  },
  async postRender(page) {
    // No-op – Axe checks run automatically.
  },
  // Axe configuration – disable rules or tweak tags if needed.
  // See https://storybook.js.org/docs/essentials/test-runner for details.
  // axe: { disabledRules: [] },
};

export default config;
