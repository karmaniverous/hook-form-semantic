import type { RRStackJson } from '@karmaniverous/rrstack';
import { describe, expect, it } from 'vitest';

import { rrstack2rhf } from './rrstack2rhf';

describe('rrstack2rhf', () => {
  it('maps engine JSON to RHF UI shape with CSV/text and arrays', () => {
    const engine: RRStackJson = {
      timezone: 'UTC',
      timeUnit: 'ms',
      rules: [
        {
          effect: 'active',
          duration: { hours: 1 },
          label: 'Rule',
          options: {
            freq: 'daily',
            starts: Date.UTC(2025, 0, 1, 0, 0, 0, 0),
            ends: Date.UTC(2025, 0, 31, 0, 0, 0, 0),
            byhour: [9, 13],
            byminute: [0, 30],
            bymonth: [1, 2],
            bymonthday: [1, 15],
            byweekday: [0, 2],
            bysetpos: [1, -1],
          },
        },
      ],
    };

    const { rhf, timeUnit } = rrstack2rhf(engine);
    expect(timeUnit).toBe('ms');
    expect(rhf.timezone).toBe('UTC');
    expect(rhf.rules).toHaveLength(1);
    const r = rhf.rules[0];
    expect(r.effect).toBe('active');
    expect(r.duration).toEqual({ hours: 1 });
    expect(r.options.freq).toBe('daily');
    expect(r.options.starts).toEqual(
      new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 0)),
    );
    expect(r.options.ends).toEqual(new Date(Date.UTC(2025, 0, 31, 0, 0, 0, 0)));
    // Arrays preserved
    expect(r.options.bymonth).toEqual([1, 2]);
    expect(r.options.byweekday).toEqual([0, 2]);
    expect(r.options.bysetpos).toEqual([1, -1]);
    // CSV text restored for tolerant inputs
    expect(r.options.byhour).toBe('9, 13');
    expect(r.options.byminute).toBe('0, 30');
    expect(r.options.bymonthday).toBe('1, 15');
  });

  it('marks span when engine freq is undefined and omits duration', () => {
    const engine: RRStackJson = {
      timezone: 'UTC',
      rules: [
        {
          effect: 'active',
          options: {
            // no freq → span
            starts: Date.UTC(2025, 5, 1, 0, 0, 0, 0),
          },
        },
      ],
    };
    const { rhf } = rrstack2rhf(engine);
    const r = rhf.rules[0];
    expect(r.options.freq).toBe('span');
    expect(r.duration).toBeUndefined();
    expect(r.options.starts).toEqual(
      new Date(Date.UTC(2025, 5, 1, 0, 0, 0, 0)),
    );
  });

  it('reverses inclusive end-of-day semantics when endDatesInclusive=true', () => {
    // Engine ends at local midnight (UTC), should become previous day in UI
    const engine: RRStackJson = {
      timezone: 'UTC',
      rules: [
        {
          effect: 'active',
          duration: { days: 1 },
          options: {
            freq: 'daily',
            starts: Date.UTC(2025, 0, 1, 0, 0, 0, 0),
            ends: Date.UTC(2025, 0, 31, 0, 0, 0, 0),
          },
        },
      ],
    };
    const { rhf } = rrstack2rhf(engine, { endDatesInclusive: true });
    const r = rhf.rules[0];
    expect(r.options.ends).toEqual(new Date(Date.UTC(2025, 0, 30, 0, 0, 0, 0)));
  });
});
