/**
 * Convert a number array to a comma-separated string with spaces (e.g., [1,2] → "1, 2").
 * Returns undefined for empty or missing arrays.
 */
export function int2csv(
  vals: ReadonlyArray<number> | undefined | null,
): string | undefined {
  if (!vals || vals.length === 0) return undefined;
  // Filter to finite integers to mirror csv2int strictness
  const clean = vals
    .map((n) => (Number.isFinite(n) ? Math.trunc(n) : NaN))
    .filter((n) => Number.isFinite(n));
  if (clean.length === 0) return undefined;
  // Deduplicate while preserving order (stable)
  const seen = new Set<number>();
  return clean
    .filter((n) => (seen.has(n) ? false : (seen.add(n), true)))
    .join(', ');
}
