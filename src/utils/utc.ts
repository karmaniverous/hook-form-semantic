/**
 * UTC mapping helpers for date/time pickers.
 *
 * Semantics when utc=true:
 * - date-only: interpret the selected calendar date as midnight UTC.
 * - datetime: interpret the selected wall time as UTC (not local).
 *
 * Notes
 * - date-only mappings use UTC components from the incoming Date so we preserve
 *   the intended calendar date even if the Date instance reflects a different
 *   local day.
 * - datetime mappings use local components from the incoming Date (what the
 *   widget reports for wall time) and construct an equivalent UTC instant.
 */

/**
 * Map an input Date to midnight UTC based on its UTC calendar components.
 * Returns null when input is null/undefined.
 */
export const local2utcDateOnly = (
  date: Date | null | undefined,
): Date | null => {
  if (!date) return date ?? null;
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

/**
 * Map an input Date (interpreted as local wall time) to a UTC instant with the
 * same wall clock fields. Example: local 2025‑01‑01 09:30 → 2025‑01‑01T09:30:00Z.
 * Returns null when input is null/undefined.
 */
export const local2utcDateTime = (
  date: Date | null | undefined,
): Date | null => {
  if (!date) return date ?? null;
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ),
  );
};

/**
 * Reverse of {@link local2utcDateOnly} for display:
 * Map a UTC instant to a local Date whose calendar date equals the UTC date,
 * at local midnight. Useful for showing a stored UTC date-only value back in
 * a date-only widget without shifting the calendar day.
 *
 * Example:
 *  UTC 2025‑01‑02T00:00:00Z → new Date(2025, 0, 2) (local midnight)
 */
export const utc2localDateOnly = (
  date: Date | null | undefined,
): Date | null => {
  if (!date) return date ?? null;
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

/**
 * Reverse of {@link local2utcDateTime} for display:
 * Map a UTC instant to a local Date that carries the same "wall clock" fields
 * as the UTC time. This lets a local datetime widget show the exact HH:mm:ss.mmm
 * that was encoded in UTC.
 *
 * Example:
 *  UTC 2025‑01‑02T09:30:00Z → new Date(2025, 0, 2, 9, 30, 0, 0) (local)
 */
export const utc2localDateTime = (
  date: Date | null | undefined,
): Date | null => {
  if (!date) return date ?? null;
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
};
