// Lightweight Sentry wrapper for Vercel serverless (CommonJS) functions.
// Attempts to require('@sentry/node') dynamically and initialise if a DSN is provided.
// Exports a stub object if the SDK cannot be loaded so that callers can use it safely.
// This keeps build fast locally and avoids ESM/CJS conflicts.

/* eslint-disable @typescript-eslint/no-var-requires */
let Sentry: any = {
  captureException: () => {},
  captureMessage: () => {},
};

try {
  // eslint-disable-next-line global-require
  const sdk = require('@sentry/node');
  const dsn = process.env.SENTRY_DSN;
  if (dsn) {
    sdk.init({
      dsn,
      tracesSampleRate: 0.2,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    });
  }
  Sentry = sdk;
} catch {
  // ignore – SDK not installed in dev or other error
}

export { Sentry };
