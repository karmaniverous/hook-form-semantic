export interface CsvBounds {
  min?: number;
  max?: number;
}

/**
 * Parse tolerant comma-separated integer text into a number[] within optional bounds.
 * Returns undefined when no valid numbers are present.
 */
export function csv2int(
  text: string | null | undefined,
  opts: CsvBounds = {},
): number[] | undefined {
  if (!text) return undefined;
  const { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } =
    opts;
  const vals = String(text)
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length)
    .map((s) => Number.parseInt(s, 10))
    .filter((n) => Number.isFinite(n) && n >= min && n <= max);
  return vals.length ? vals : undefined;
}
