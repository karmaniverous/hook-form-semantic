import { describe, expect, it } from 'vitest';

import { offsetTruncatedDate } from './offsetTruncatedDate';

// Use a mid-January base date to avoid DST edges in most locales.
const BASE = new Date(2025, 0, 15, 13, 45, 30, 123); // Jan 15, 2025 13:45:30.123

describe('offsetTruncatedDate', () => {
  it('truncates at day and applies day offset', () => {
    const d0 = offsetTruncatedDate({ date: BASE, truncateAt: 'day' });
    expect(d0).toEqual(new Date(2025, 0, 15, 0, 0, 0, 0));

    const d1 = offsetTruncatedDate({
      date: BASE,
      truncateAt: 'day',
      offsetDays: 1,
    });
    expect(d1).toEqual(new Date(2025, 0, 16, 0, 0, 0, 0));
  });

  it('truncates at month and applies month offset', () => {
    const m0 = offsetTruncatedDate({ date: BASE, truncateAt: 'month' });
    expect(m0).toEqual(new Date(2025, 0, 1, 0, 0, 0, 0));

    const m1 = offsetTruncatedDate({
      date: BASE,
      truncateAt: 'month',
      offsetMonths: 1,
    });
    expect(m1).toEqual(new Date(2025, 1, 1, 0, 0, 0, 0));
  });

  it('applies time-based offsets without truncation', () => {
    const res = offsetTruncatedDate({
      date: BASE,
      offsetHours: 1,
      offsetMinutes: 30,
    });
    expect(res).toEqual(new Date(2025, 0, 15, 15, 15, 30, 123));
  });

  it('truncates at year and applies multiple offsets', () => {
    const y = offsetTruncatedDate({
      date: BASE,
      truncateAt: 'year',
      offsetYears: 2,
      offsetMonths: 1,
      offsetDays: 10,
    });
    expect(y).toEqual(new Date(2027, 1, 10, 0, 0, 0, 0));
  });
});
