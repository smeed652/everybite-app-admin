/*
 * Centralized Logger utility
 * Supports log levels: debug, info, warn, error.
 * Browser (Vite) + Node compatible.
 */

/* eslint-disable no-console */

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
  // Vite exposes env vars on import.meta.env
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viteLevel = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LOG_LEVEL) as string | undefined;
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
  },

  info(...args: unknown[]) {
    if (!shouldLog('info')) return;
    console.info(...formatArgs('info', args));
  },

  warn(...args: unknown[]) {
    if (!shouldLog('warn')) return;
    console.warn(...formatArgs('warn', args));
  },

  error(...args: unknown[]) {
    if (!shouldLog('error')) return;
    console.error(...formatArgs('error', args));
  },
};

export default logger;
