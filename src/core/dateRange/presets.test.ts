import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultPresets, filterPresets, type Presets } from './presets';

/* Every preset is a thunk over "now", so the clock is pinned. A mid-month,
   mid-week, midday instant on purpose: a boundary date would let an off-by-one
   in the truncation pass unnoticed. */
const NOW = new Date('2026-03-18T14:37:12.345Z'); // a Wednesday

/* Narrows to a closed range, and asserts that it is one. `DateRange` permits
   nulls because a user-entered range may be open-ended; a DEFAULT preset never
   is, and this fails loudly rather than letting a null reach `.getTime()`. */
const resolve = (key: string): [Date, Date] => {
  const { value } = defaultPresets[key];
  const [from, to] = typeof value === 'function' ? value() : value;

  if (!from || !to)
    throw new Error(`preset "${key}" resolved to an open range`);

  return [from, to];
};

describe('defaultPresets', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('offers the twelve documented ranges', () => {
    expect(Object.keys(defaultPresets)).toEqual([
      'today',
      'yesterday',
      'tomorrow',
      'thisWeek',
      'lastWeek',
      'nextWeek',
      'thisMonth',
      'lastMonth',
      'nextMonth',
      'thisYear',
      'lastYear',
      'nextYear',
    ]);
  });

  /* `it.each` rather than a loop with a labelled expect: a failure names the
     preset in the test title instead of in an assertion message. */
  it.each(Object.keys(defaultPresets))(
    'resolves %s to an ordered pair of dates',
    (key) => {
      const [from, to] = resolve(key);

      expect(from).toBeInstanceOf(Date);
      expect(to).toBeInstanceOf(Date);
      expect(from.getTime()).toBeLessThan(to.getTime());
    },
  );

  /* The end of a range is inclusive — `offsetMilliseconds: -1` off the start of
     the NEXT period. A range ending at midnight would silently include or
     exclude a day depending on how the consumer compares it. */
  it.each(['today', 'thisWeek', 'thisMonth', 'thisYear'])(
    'ends %s one millisecond before the next period',
    (key) => {
      const [, to] = resolve(key);

      expect(to.getMilliseconds()).toBe(999);
      expect(to.getSeconds()).toBe(59);
      expect(to.getMinutes()).toBe(59);
    },
  );

  it('places today around the pinned clock', () => {
    const [from, to] = resolve('today');

    expect(from.getTime()).toBeLessThanOrEqual(NOW.getTime());
    expect(to.getTime()).toBeGreaterThan(NOW.getTime());
    expect(from.getHours()).toBe(0);
  });

  it('orders yesterday before today before tomorrow, without overlap', () => {
    const [, yesterdayEnd] = resolve('yesterday');
    const [todayStart, todayEnd] = resolve('today');
    const [tomorrowStart] = resolve('tomorrow');

    expect(yesterdayEnd.getTime()).toBeLessThan(todayStart.getTime());
    expect(todayEnd.getTime()).toBeLessThan(tomorrowStart.getTime());
    /* Adjacent, not merely ordered: the gap is the single millisecond the
       inclusive end gives up. */
    expect(todayStart.getTime() - yesterdayEnd.getTime()).toBe(1);
  });

  it('nests the shorter ranges inside the longer ones', () => {
    const [dayFrom, dayTo] = resolve('today');
    const [monthFrom, monthTo] = resolve('thisMonth');
    const [yearFrom, yearTo] = resolve('thisYear');

    expect(monthFrom.getTime()).toBeLessThanOrEqual(dayFrom.getTime());
    expect(monthTo.getTime()).toBeGreaterThanOrEqual(dayTo.getTime());
    expect(yearFrom.getTime()).toBeLessThanOrEqual(monthFrom.getTime());
    expect(yearTo.getTime()).toBeGreaterThanOrEqual(monthTo.getTime());
  });

  it('tags each preset with the epoch its name implies', () => {
    expect(defaultPresets.yesterday.epoch).toBe('past');
    expect(defaultPresets.today.epoch).toBe('present');
    expect(defaultPresets.tomorrow.epoch).toBe('future');
    expect(defaultPresets.lastYear.epoch).toBe('past');
    expect(defaultPresets.nextYear.epoch).toBe('future');
  });
});

describe('filterPresets', () => {
  it('keeps only the requested epochs', () => {
    const filtered = filterPresets(['past']);

    expect(Object.keys(filtered)).toEqual([
      'yesterday',
      'lastWeek',
      'lastMonth',
      'lastYear',
    ]);
  });

  it('accepts several epochs at once', () => {
    const filtered = filterPresets(['past', 'present']);

    expect(Object.keys(filtered)).toContain('today');
    expect(Object.keys(filtered)).toContain('lastWeek');
    expect(Object.keys(filtered)).not.toContain('tomorrow');
  });

  it('returns nothing for no epochs, rather than everything', () => {
    expect(filterPresets([])).toEqual({});
  });

  it('filters a caller-supplied set instead of the defaults', () => {
    const custom: Presets = {
      sprint: { text: 'Sprint', value: [null, null], epoch: 'present' },
      lastSprint: { text: 'Last sprint', value: [null, null], epoch: 'past' },
    };

    expect(Object.keys(filterPresets(['present'], custom))).toEqual(['sprint']);
  });

  it('does not mutate the source', () => {
    const before = Object.keys(defaultPresets).length;

    filterPresets(['past']);

    expect(Object.keys(defaultPresets)).toHaveLength(before);
  });
});
