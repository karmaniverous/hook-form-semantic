import { describe, expect, it } from 'vitest';

import { extractTimestamps } from './extractTimestamps';

describe('extractTimestamps', () => {
  it('converts both ends to epoch milliseconds', () => {
    const from = new Date('2026-03-01T00:00:00.000Z');
    const to = new Date('2026-03-31T23:59:59.999Z');

    expect(extractTimestamps([from, to])).toEqual([
      from.getTime(),
      to.getTime(),
    ]);
  });

  /* `undefined`, not `null`. The consumers spread the result into query
     parameters, where an explicit null is a value the API filters on and an
     undefined key is omitted — so an open-ended range and a range bounded by
     null are not the same request. */
  it('maps an absent bound to undefined rather than null', () => {
    const to = new Date('2026-03-31T00:00:00.000Z');

    expect(extractTimestamps([null, to])).toEqual([undefined, to.getTime()]);
    expect(extractTimestamps([null, null])).toEqual([undefined, undefined]);
  });

  it('returns a pair of undefined for an absent range', () => {
    expect(
      extractTimestamps(undefined as unknown as [Date | null, Date | null]),
    ).toEqual([undefined, undefined]);
  });
});
