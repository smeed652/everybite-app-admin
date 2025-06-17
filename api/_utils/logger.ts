/*
 * Lightweight logger for Vercel serverless (CommonJS) context.
 * Avoids dynamic-import / ESM pitfalls. Provides same API subset used in API routes.
 */
import { Sentry } from './sentry';

const noop = (..._args: unknown[]) => undefined;

export default {
  debug: noop,
  info: noop,
  warn: (...args: unknown[]) => {
    console.warn('[api]', ...args);
    Sentry.captureMessage(args.map(String).join(' '), 'warning');
  },
  error: (...args: unknown[]) => {
    console.error('[api]', ...args);
    const maybeErr = args[0] instanceof Error ? (args[0] as Error) : new Error(String(args[0]));
    Sentry.captureException(maybeErr);
  },
} as const;
