/**
 * Safely parse a JSON string, returning the parsed value or the fallback.
 * If the value is already a non-string type, it is returned as-is.
 */
export function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
