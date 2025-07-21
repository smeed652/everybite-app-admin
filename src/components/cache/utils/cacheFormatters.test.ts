import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  formatAge,
  formatTimeUntil,
  formatTTL,
  formatTTLMs,
} from "./cacheFormatters";

describe("cacheFormatters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatAge", () => {
    it("should format minutes correctly", () => {
      expect(formatAge(30)).toBe("30m ago");
      expect(formatAge(59)).toBe("59m ago");
    });

    it("should format hours correctly", () => {
      expect(formatAge(60)).toBe("1h ago");
      expect(formatAge(120)).toBe("2h ago");
      expect(formatAge(1439)).toBe("23h ago");
    });

    it("should format days correctly", () => {
      expect(formatAge(1440)).toBe("1d ago");
      expect(formatAge(2880)).toBe("2d ago");
      expect(formatAge(10080)).toBe("7d ago");
    });

    it("should handle edge cases", () => {
      expect(formatAge(0)).toBe("0m ago");
      expect(formatAge(1)).toBe("1m ago");
    });
  });

  describe("formatTimeUntil", () => {
    it("should format minutes only", () => {
      const now = new Date("2024-01-15T10:00:00Z");
      const future = new Date("2024-01-15T10:30:00Z");
      vi.setSystemTime(now);
      expect(formatTimeUntil(future.toISOString())).toBe("30m");
    });

    it("should format hours and minutes", () => {
      const now = new Date("2024-01-15T10:00:00Z");
      const future = new Date("2024-01-15T12:30:00Z");
      vi.setSystemTime(now);
      expect(formatTimeUntil(future.toISOString())).toBe("2h 30m");
    });

    it("should format hours only", () => {
      const now = new Date("2024-01-15T10:00:00Z");
      const future = new Date("2024-01-15T12:00:00Z");
      vi.setSystemTime(now);
      expect(formatTimeUntil(future.toISOString())).toBe("2h");
    });

    it("should handle past times", () => {
      const now = new Date("2024-01-15T12:00:00Z");
      const past = new Date("2024-01-15T10:00:00Z");
      vi.setSystemTime(now);
      expect(formatTimeUntil(past.toISOString())).toBe("-120m");
    });
  });

  describe("formatTTL", () => {
    it("should format hours correctly", () => {
      expect(formatTTL(1)).toBe("1h");
      expect(formatTTL(12)).toBe("12h");
      expect(formatTTL(23)).toBe("23h");
    });

    it("should format days correctly", () => {
      expect(formatTTL(24)).toBe("1d");
      expect(formatTTL(48)).toBe("2d");
      expect(formatTTL(72)).toBe("3d");
    });

    it("should format days with remaining hours", () => {
      expect(formatTTL(25)).toBe("1d 1h");
      expect(formatTTL(26)).toBe("1d 2h");
      expect(formatTTL(49)).toBe("2d 1h");
    });

    it("should handle edge cases", () => {
      expect(formatTTL(0)).toBe("0h");
      expect(formatTTL(0.5)).toBe("0.5h");
    });
  });

  describe("formatTTLMs", () => {
    it("should format minutes correctly", () => {
      expect(formatTTLMs(30 * 60 * 1000)).toBe("30m"); // 30 minutes
      expect(formatTTLMs(59 * 60 * 1000)).toBe("59m"); // 59 minutes
    });

    it("should format hours correctly", () => {
      expect(formatTTLMs(60 * 60 * 1000)).toBe("1h"); // 1 hour
      expect(formatTTLMs(2 * 60 * 60 * 1000)).toBe("2h"); // 2 hours
      expect(formatTTLMs(2 * 60 * 60 * 1000 + 30 * 60 * 1000)).toBe("2h 30m"); // 2.5 hours
    });

    it("should format days correctly", () => {
      expect(formatTTLMs(24 * 60 * 60 * 1000)).toBe("1d"); // 1 day
      expect(formatTTLMs(2 * 24 * 60 * 60 * 1000)).toBe("2d"); // 2 days
      expect(formatTTLMs(2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000)).toBe(
        "2d 6h"
      ); // 2.25 days
    });

    it("should handle edge cases", () => {
      expect(formatTTLMs(0)).toBe("0m");
      expect(formatTTLMs(1000)).toBe("0m"); // 1 second
      expect(formatTTLMs(60 * 1000)).toBe("1m"); // 1 minute
    });

    it("should handle large values", () => {
      expect(formatTTLMs(7 * 24 * 60 * 60 * 1000)).toBe("7d"); // 1 week
      expect(formatTTLMs(30 * 24 * 60 * 60 * 1000)).toBe("30d"); // 1 month
    });
  });
});
