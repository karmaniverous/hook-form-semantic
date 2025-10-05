import { describe, expect, it } from 'vitest';

import { csv2int } from './csv2int';

describe('csv2int', () => {
  it('parses comma-separated integers with whitespace', () => {
    expect(csv2int('1, 2, 3')).toEqual([1, 2, 3]);
    expect(csv2int('  10,20,  30  ')).toEqual([10, 20, 30]);
  });

  it('filters non-numeric values', () => {
    expect(csv2int('a, 2, b, 3')).toEqual([2, 3]);
  });

  it('respects min/max bounds', () => {
    // Negative and out-of-range values are dropped
    expect(csv2int('-1, 0, 30, 59, 60', { min: 0, max: 59 })).toEqual([
      0, 30, 59,
    ]);
    // Upper-only bound
    expect(csv2int('1, 2, 100', { max: 10 })).toEqual([1, 2]);
    // Lower-only bound
    expect(csv2int('-10, 0, 5', { min: 1 })).toEqual([5]);
  });

  it('returns undefined for empty, null, or whitespace-only input', () => {
    expect(csv2int(undefined)).toBeUndefined();
    expect(csv2int(null)).toBeUndefined();
    expect(csv2int('')).toBeUndefined();
    expect(csv2int(' , , ')).toBeUndefined();
  });
});
