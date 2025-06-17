/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Universal Sentry wrapper for the browser bundle.
 *  – In production (`import.meta.env.PROD`) and when `VITE_SENTRY_DSN` is set,
 *    we dynamically import `@sentry/react` + `@sentry/tracing` so that the
 *    SDK code is tree-shaken out of local dev builds, avoiding ESM ↔ CJS issues.
 *  – In all other cases we export a no-op stub so callers can safely invoke
 *    `captureException` / `captureMessage` without null-checks.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
let Sentry: any = {
  init: () => {},
  captureException: () => {},
  captureMessage: () => {},
};

const { VITE_SENTRY_DSN, VITE_APP_VERSION, VITE_ENV } = import.meta.env;

if (typeof window !== 'undefined' && import.meta.env.PROD && VITE_SENTRY_DSN) {
  // Dynamically import so dev builds don't pull Sentry + avoid ESM/CJS mismatch
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    try {
      const SentryMod = await import('@sentry/react');
      const { BrowserTracing } = await import('@sentry/tracing');
      SentryMod.init({
        dsn: VITE_SENTRY_DSN,
        integrations: [new BrowserTracing() as any],
        tracesSampleRate: 0.2,
        release: VITE_APP_VERSION ?? 'dev',
        environment: VITE_ENV ?? 'development',
      });
      Sentry = SentryMod;
    } catch {
      // swallow – fallback to stub
    }
  })();
}


// Resolve env safely
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – typeof import.meta only valid in ESM
const metaEnv: any | undefined = typeof import.meta === 'object' && (import.meta as any).env ? (import.meta as any).env : undefined;
const SENTRY_DSN = (metaEnv?.VITE_SENTRY_DSN as string | undefined) || (typeof process !== 'undefined' ? process.env.NODE_SENTRY_DSN : undefined);

// Initialize only in browser and if DSN provided
if (typeof window !== 'undefined' && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2, // configurable
    release: metaEnv?.VITE_APP_VERSION ?? 'dev',
    environment: metaEnv?.VITE_ENV ?? 'development',
  });
}

export { Sentry };
