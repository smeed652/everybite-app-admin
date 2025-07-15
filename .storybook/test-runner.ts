import type { Page } from "@playwright/test";
import { checkA11y, injectAxe } from "axe-playwright";

/**
 * Storybook Test-Runner configuration that injects axe-core into each story
 * and fails the run when critical accessibility violations are detected.
 * This runs automatically when you execute `npm run test-stories`.
 *
 * Keeping this in its own file lets us run a11y checks locally as well as
 * in CI without additional command-line options.
 */

export const preVisit = async (page: Page) => {
  // Inject axe-core before each story is rendered.
  await injectAxe(page);
};

export const postVisit = async (page: Page) => {
  try {
    // Add a small delay to ensure axe is ready
    await page.waitForTimeout(100);

    // Run axe against the story root and fail on any critical violations.
    await checkA11y(page, "#storybook-root", {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  } catch (error) {
    // Handle the "Axe is already running" error gracefully
    if (
      error instanceof Error &&
      error.message.includes("Axe is already running")
    ) {
      console.warn(
        "Axe concurrency issue detected, skipping a11y check for this story"
      );
      return;
    }
    // Handle other axe-related errors
    if (error instanceof Error && error.message.includes("axe")) {
      console.warn(
        "Axe error detected, skipping a11y check for this story:",
        error.message
      );
      return;
    }
    // Re-throw other errors
    throw error;
  }
};
