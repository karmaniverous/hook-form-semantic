import type { RRStackJson } from '@karmaniverous/rrstack';
import { describe, expect, it } from 'vitest';

import { rhf2rrstack } from './rhf2rrstack';
import { rrstack2rhf } from './rrstack2rhf';
import type { HookFormRRStackData } from './types';

/* rrstack2rhf → rhf2rrstack must be lossless.
 *
 * It was not. rrstack2rhf produces a FLOATING Date (UTC fields carry the wall
 * clock, per the engine's epochToWallDate), while rhf2rrstack read LOCAL fields
 * and remapped through local2utcDateTime — so every load/save cycle shifted the
 * schedule by the editor's UTC offset, and alternate saves oscillated between
 * two values. Opening an offer and saving it unchanged moved its schedule.
 *
 * Invisible at UTC+0, which is why it survived. These run under a fixed set of
 * zones so a CI box in Greenwich cannot hide a regression.
 */
const ZONES = ['Asia/Singapore', 'America/New_York', 'UTC', 'Europe/Paris'];

const spanSchedule = (timezone: string): RRStackJson => ({
  timezone,
  timeUnit: 'ms',
  rules: [
    {
      effect: 'active',
      options: {
        starts: Date.UTC(2025, 9, 1),
        ends: Date.UTC(2025, 9, 31),
      },
    },
  ],
});

const recurringSchedule = (timezone: string): RRStackJson => ({
  timezone,
  timeUnit: 'ms',
  rules: [
    {
      effect: 'active',
      duration: { hours: 2 },
      options: {
        freq: 'daily',
        byhour: [9],
        byminute: [0],
        starts: Date.UTC(2025, 0, 1),
      },
    },
  ],
});

const cycle = (json: RRStackJson): RRStackJson =>
  rhf2rrstack(rrstack2rhf(json) as unknown as HookFormRRStackData);

const clampsOf = (json: RRStackJson) => {
  const options = json.rules?.[0]?.options;

  return { ends: options?.ends, starts: options?.starts };
};

describe.each(ZONES)('rrstack round-trip (%s)', (timezone) => {
  it('preserves a span rule’s clamps', () => {
    const original = spanSchedule(timezone);

    expect(clampsOf(cycle(original))).toEqual(clampsOf(original));
  });

  it('preserves a recurring rule’s start', () => {
    const original = recurringSchedule(timezone);

    expect(clampsOf(cycle(original))).toEqual(clampsOf(original));
  });

  /* The oscillation is the part a single round-trip misses: the first cycle
     shifted, the second shifted back, so a test that saved once and compared
     could pass while the data moved on every other save. */
  it('is stable across repeated saves', () => {
    let json = spanSchedule(timezone);
    const expected = clampsOf(json);

    for (let i = 0; i < 4; i++) {
      json = cycle(json);
      expect(clampsOf(json), `cycle ${String(i + 1)}`).toEqual(expected);
    }
  });
});
