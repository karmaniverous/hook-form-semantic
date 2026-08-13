import type { RRStackOptions } from '@karmaniverous/rrstack';
import { RRStack } from '@karmaniverous/rrstack';
import { describe, expect, it } from 'vitest';

describe('RRStack (engine validations)', () => {
  it('validates timezone using RRStack.isValidTimeZone', () => {
    expect(RRStack.isValidTimeZone('UTC')).toBe(true);
    expect(RRStack.isValidTimeZone('America/New_York')).toBe(true);
    expect(RRStack.isValidTimeZone('Invalid/Timezone')).toBe(false);
  });

  it('validates rules by creating temporary RRStack instances', () => {
    const validRule = {
      effect: 'active' as const,
      duration: { hours: 1 },
      options: {
        freq: 'daily' as const,
        byhour: [9],
        byminute: [0],
        bysecond: [0],
      },
      label: 'Valid Rule',
    };
    expect(() => {
      new RRStack({
        timezone: 'UTC',
        rules: [validRule],
      });
    }).not.toThrow();
  });

  it('validates rules with starts/ends timestamps', () => {
    const now = Date.now();
    const futureTime = now + 24 * 60 * 60 * 1000;
    const validRuleWithDates = {
      effect: 'active' as const,
      duration: { hours: 1 },
      options: {
        freq: 'daily' as const,
        starts: now,
        ends: futureTime,
      },
      label: 'Rule with Date Range',
    };
    expect(() => {
      new RRStack({
        timezone: 'UTC',
        rules: [validRuleWithDates],
      });
    }).not.toThrow();
  });

  it('handles rules with only starts or only ends timestamps', () => {
    const now = Date.now();
    const onlyStarts = {
      effect: 'active' as const,
      duration: { hours: 1 },
      options: { freq: 'daily' as const, starts: now },
      label: 'Only Start',
    };
    const onlyEnds = {
      effect: 'active' as const,
      duration: { hours: 1 },
      options: {
        freq: 'daily' as const,
        ends: now + 24 * 60 * 60 * 1000,
      },
      label: 'Only End',
    };
    expect(() => {
      new RRStack({
        timezone: 'UTC',
        rules: [onlyStarts],
      } satisfies RRStackOptions);
    }).not.toThrow();
    expect(() => {
      new RRStack({
        timezone: 'UTC',
        rules: [onlyEnds],
      } satisfies RRStackOptions);
    }).not.toThrow();
  });
});
