/* eslint-disable @typescript-eslint/ban-ts-comment */
// Provide lightweight logger for Node (serverless functions) to avoid ESM issues
if (typeof window === 'undefined') {
  const nodeLogger = {
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  } as const;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore – CommonJS override
  module.exports = nodeLogger;
  // terminate evaluation for Node context
}

/*
 * Centralized Logger utility
 * Supports log levels: debug, info, warn, error.
 * Browser (Vite) + Node compatible.
 * Integrated with Sentry for error tracking.
 */

// Dynamically load Sentry only in the browser to avoid ESM/CJS conflicts in serverless functions.
// This keeps Node (API routes) tree-shaken clean while enabling full telemetry in the React bundle.
// Minimal subset of Sentry API we call
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SentryModule = { captureMessage?: (...args: any[]) => unknown; captureException?: (...args: any[]) => unknown };

let sentry: SentryModule | null = null;
// Guard `import.meta` usage so TS doesn't error under CommonJS build
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const metaEnv: Partial<Record<string, string>> | undefined = typeof import.meta === 'object' &&
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (import.meta as { env?: Record<string, string> }).env
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ? (import.meta as { env?: Record<string, string> }).env
    : undefined;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async function initSentry() {
  if (typeof window === 'undefined') return; // SSR / API – skip
  const dsn = metaEnv?.VITE_SENTRY_DSN;
  if (!dsn) return;
  try {
    const SentryMod = await import('@sentry/react');
    const { BrowserTracing } = await import('@sentry/tracing');
    SentryMod.init({
      dsn,
      // BrowserTracing implements Integration but typings may mismatch when imported dynamically
      integrations: [new BrowserTracing() as unknown as import('@sentry/types').Integration],
      tracesSampleRate: 0.2,
      release: metaEnv?.VITE_APP_VERSION ?? 'dev',
      environment: metaEnv?.VITE_ENV ?? 'development',
    });
    sentry = SentryMod;
  } catch {
    // swallow – keep logging local only
  }
})();
/* eslint-disable no-console */
// Resolve env vars safely in both ESM (browser) and CommonJS (Jest/node)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – typeof import.meta only allowed in ESM, will be tree-shaken by Vite


/** Available log levels */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Ordered list to compare severity */
const levelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error'];

/**
 * Resolve the active log level from environment.
 * In browser (Vite) we read `import.meta.env.VITE_LOG_LEVEL`.
 * In Node we fallback to `process.env.NODE_LOG_LEVEL`.
 * Defaults to 'info'.
 */
function resolveEnvLogLevel(): LogLevel {
  const viteLevel = metaEnv?.VITE_LOG_LEVEL as string | undefined;
  const nodeLevel = typeof process !== 'undefined' ? process.env.NODE_LOG_LEVEL : undefined;
  const level = (viteLevel || nodeLevel || 'info').toLowerCase();
  return (['debug', 'info', 'warn', 'error'] as LogLevel[]).includes(level as LogLevel)
    ? (level as LogLevel)
    : 'info';
}

let currentLevel: LogLevel = resolveEnvLogLevel();

/** ANSI colors for Node / CSS colors for browser */
const styles = {
  debug: 'color: #6b7280', // gray-500
  info: 'color: #2563eb', // blue-600
  warn: 'color: #d97706', // amber-600
  error: 'color: #dc2626' // red-600
};

/** Optional remote log endpoint e.g., Sentry proxy or custom API */
const REMOTE_URL =
  (metaEnv?.VITE_LOG_REMOTE_URL as string | undefined) ||
  (typeof process !== 'undefined' ? process.env.NODE_LOG_REMOTE_URL : undefined);

function sendRemote(level: LogLevel, args: unknown[]) {
  // Forward to Sentry if configured
  if (sentry && typeof sentry.captureMessage === 'function') {
    try {
      if (level === 'error') {
        // Treat first arg as possible Error
        const maybeErr = args[0] instanceof Error ? (args[0] as Error) : new Error(String(args[0]));
        sentry.captureException?.(maybeErr);
      } else {
        sentry.captureMessage?.(args.map(String).join(' '), level);
      }
    } catch {
      /* swallow */
    }
  }
  if (!REMOTE_URL) return;
  try {
    const payload = {
      level,
      ts: Date.now(),
      message: args
        .map((a) => {
          if (typeof a === 'string') return a;
          try {
            return JSON.stringify(a);
          } catch {
            return String(a);
          }
        })
        .join(' '),
    };
    // Use navigator.sendBeacon when available for non-blocking fire-and-forget
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(REMOTE_URL, JSON.stringify(payload));
    } else if (typeof fetch !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – Node global fetch may not exist depending on version
      fetch(REMOTE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* swallow */
  }
}

function shouldLog(level: LogLevel): boolean {
  return levelOrder.indexOf(level) >= levelOrder.indexOf(currentLevel);
}

function formatArgs(level: LogLevel, args: unknown[]): unknown[] {
  if (
    typeof window !== 'undefined' &&
    typeof window.console !== 'undefined' &&
    typeof console.log === 'function'
  ) {
    // Browser: use CSS color styling
    return [`[%c${level.toUpperCase()}%c]`, styles[level], 'color:inherit', ...args];
  }
  // Node: simple prefix
  return [`[${level.toUpperCase()}]`, ...args];
}

export const logger = {
  setLevel(newLevel: LogLevel) {
    currentLevel = newLevel;
  },

  debug(...args: unknown[]) {
    if (!shouldLog('debug')) return;
    console.debug(...formatArgs('debug', args));
    sendRemote('debug', args);
  },

  info(...args: unknown[]) {
    if (!shouldLog('info')) return;
    console.info(...formatArgs('info', args));
    sendRemote('info', args);
  },

  warn(...args: unknown[]) {
    if (!shouldLog('warn')) return;
    console.warn(...formatArgs('warn', args));
    sendRemote('warn', args);
  },

  error(...args: unknown[]) {
    if (!shouldLog('error')) return;
    console.error(...formatArgs('error', args));
    sendRemote('error', args);
  },
};

export default logger;
