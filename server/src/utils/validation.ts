/** Validates email format. */
export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value);
}

/**
 * Normalize and deduplicate a list of email strings.
 * Filters out invalid entries.
 */
export function normalizeEmailList(emails: unknown[]): string[] {
  if (!Array.isArray(emails)) return [];
  return Array.from(
    new Set(
      emails
        .map((e) => String(e).toLowerCase().trim())
        .filter((e) => e && isValidEmail(e))
    )
  );
}

/**
 * Parse a comma/semicolon/whitespace-separated email string
 * into a normalized, deduplicated array.
 */
export function parseEmailInput(input: string): string[] {
  if (!input) return [];
  return normalizeEmailList(input.split(/[\s,;]+/));
}
