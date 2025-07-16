/**
 * Deep clone an object using JSON serialization.
 */
export const deepClone = <K>(o: K): K => JSON.parse(JSON.stringify(o));

/**
 * Normalize arrays for comparison (undefined → [], sorted).
 */
export const normalizeArray = (arr: unknown): unknown => {
  if (Array.isArray(arr)) {
    // Sort array for stable comparison (string/number only)
    return [...arr].sort();
  }
  if (arr === undefined) return [];
  return arr;
};

/**
 * Compare two values for equality, handling arrays and undefined values.
 */
export const isEqual = (a: unknown, b: unknown): boolean => {
  // If both are arrays or undefined, normalize and compare
  if (
    Array.isArray(a) ||
    Array.isArray(b) ||
    a === undefined ||
    b === undefined
  ) {
    return (
      JSON.stringify(normalizeArray(a)) === JSON.stringify(normalizeArray(b))
    );
  }
  return JSON.stringify(a) === JSON.stringify(b);
};
