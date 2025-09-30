/**
 * Stringify an array of integers to a comma-separated string.
 * Empty/undefined input produces an empty string.
 */
export function int2csv(arr?: ReadonlyArray<number> | null): string {
  if (!arr || arr.length === 0) return '';
  return arr.join(', ');
}
