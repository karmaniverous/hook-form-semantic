import type {
  RRStackJson,
  TimeZoneId,
  UnixTimeUnit,
} from '@karmaniverous/rrstack';
import { epochToWallDate } from '@karmaniverous/rrstack';

import { int2csv } from './int2csv';
import type { HookFormRRStackData, HookFormRRStackRuleData } from './types';

// Normalize number | number[] | Weekday[] → number[] | undefined
const toNumberArray = (v: unknown): number[] | undefined => {
  if (typeof v === 'number' && Number.isFinite(v)) return [Math.trunc(v)];
  if (Array.isArray(v)) {
    const out: number[] = [];
    for (const item of v) {
      if (typeof item === 'number' && Number.isFinite(item)) {
        out.push(Math.trunc(item));
        continue;
      }
      if (
        item != null &&
        typeof item === 'object' &&
        'weekday' in (item as Record<string, unknown>)
      ) {
        const wd = (item as { weekday?: unknown }).weekday;
        if (typeof wd === 'number' && Number.isFinite(wd))
          out.push(Math.trunc(wd));
      }
    }
    return out.length ? out : undefined;
  }
  return undefined;
};

const toWall = (
  epoch: number | undefined,
  timezone: string,
  timeUnit?: UnixTimeUnit,
): Date | null => {
  if (epoch === undefined) return null;
  return epochToWallDate(epoch, timezone as TimeZoneId, timeUnit);
};

const isMidnightUTC = (d: Date) =>
  d.getUTCHours() === 0 &&
  d.getUTCMinutes() === 0 &&
  d.getUTCSeconds() === 0 &&
  d.getUTCMilliseconds() === 0;

/**
 * Reverse mapping of {@link rhf2rrstack}: rrstack → RHF UI shape.
 *
 * - Converts epoch clamps (starts/ends) to Date objects in the rule timezone
 *   using epochToWallDate, preserving wall time semantics.
 * - Restores 'span' when rrstack freq is undefined.
 * - Maps numeric arrays back to tolerant CSV text for byhour/byminute/bymonthday.
 * - Keeps array options (bymonth/byweekday/bysetpos) as number[] or undefined.
 * - Optional endDatesInclusive reversal:
 *   • When true and an rrstack `ends` falls exactly at local midnight, subtract
 *     one calendar day so the UI reflects the original end date (date-only).
 */
export const rrstack2rhf = (
  rrstack: RRStackJson,
  opts: { endDatesInclusive?: boolean } = {},
): HookFormRRStackData => {
  const { endDatesInclusive } = opts;
  const { timeUnit, timezone } = rrstack;

  const rules =
    Array.isArray(rrstack.rules) && rrstack.rules.length
      ? rrstack.rules.map<HookFormRRStackRuleData>((r) => {
          const {
            byhour,
            byminute,
            bymonth,
            bymonthday,
            bysetpos,
            byweekday,
            ends,
            freq,
            starts,
            ...rest
          } = r.options ?? {};

          // Rebuild Date fields in wall time
          const startsDate = toWall(starts, timezone, timeUnit);
          const endsWall = toWall(ends, timezone, timeUnit);
          const endsDate =
            endsWall && endDatesInclusive && isMidnightUTC(endsWall)
              ? new Date(
                  Date.UTC(
                    endsWall.getUTCFullYear(),
                    endsWall.getUTCMonth(),
                    endsWall.getUTCDate() - 1,
                    0,
                    0,
                    0,
                    0,
                  ),
                )
              : endsWall;

          // Normalize arrays coming from rrstack Options (which can accept number | number[])
          const byMonthArr = toNumberArray(bymonth);
          const byWeekdayArr = toNumberArray(byweekday);
          const bySetPosArr = toNumberArray(bysetpos);
          const byHourArr = toNumberArray(byhour);
          const byMinuteArr = toNumberArray(byminute);
          const byMonthDayArr = toNumberArray(bymonthday);

          return {
            effect: r.effect,
            duration: r.duration, // undefined for span; present for recurring
            label: r.label,
            options: {
              ...rest,
              freq: freq ?? 'span',
              starts: startsDate,
              ends: endsDate,
              bymonth: byMonthArr ?? undefined,
              byweekday: byWeekdayArr ?? undefined,
              bysetpos: bySetPosArr ?? undefined,
              byhour: int2csv(byHourArr),
              byminute: int2csv(byMinuteArr),
              bymonthday: int2csv(byMonthDayArr),
            },
          };
        })
      : [];

  return {
    ...rrstack,
    rules,
  };
};
