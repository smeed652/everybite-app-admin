import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger, LogLevel } from '../logger';

// Spy on console methods
const methodMap: Record<LogLevel, keyof Console> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

describe('logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Ensure we log everything for test
    logger.setLevel('debug');
  });

  (Object.keys(methodMap) as LogLevel[]).forEach((level) => {
    it(`logs ${level} when currentLevel <= ${level}`, () => {
      const spy = vi.spyOn(console, methodMap[level]).mockImplementation(() => {});
      logger[level]('hello', 'world');
      expect(spy).toHaveBeenCalled();
    });
  });

  it('respects log level threshold', () => {
    logger.setLevel('error');
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('should not output');
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
