import { injectAxe, checkA11y } from 'axe-playwright';
import type { Page } from '@playwright/test';

/**
 * Storybook Test-Runner configuration that injects axe-core into each story
 * and fails the run when critical accessibility violations are detected.
 * This runs automatically when you execute `npm run test:stories`.
 *
 * Keeping this in its own file lets us run a11y checks locally as well as
 * in CI without additional command-line options.
 */

export const preRender = async (page: Page) => {
  // Inject axe-core before each story is rendered.
  await injectAxe(page);
};

export const postRender = async (page: Page) => {
  // Run axe against the story root and fail on any critical violations.
  await checkA11y(page, '#storybook-root', {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
};
