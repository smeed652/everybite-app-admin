import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Resolve env safely
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – typeof import.meta only valid in ESM
const metaEnv: any | undefined = typeof import.meta === 'object' && (import.meta as any).env ? (import.meta as any).env : undefined;
const SENTRY_DSN = (metaEnv?.VITE_SENTRY_DSN as string | undefined) || (typeof process !== 'undefined' ? process.env.NODE_SENTRY_DSN : undefined);

// Initialize only in browser and if DSN provided
if (typeof window !== 'undefined' && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.2, // configurable
    release: metaEnv?.VITE_APP_VERSION ?? 'dev',
    environment: metaEnv?.VITE_ENV ?? 'development',
  });
}

export { Sentry };
