import type {
  RRStackJson,
  TimeZoneId,
  UnixTimeUnit,
} from '@karmaniverous/rrstack';
import { dateOnlyToEpoch, wallTimeToEpoch } from '@karmaniverous/rrstack';
import { omit } from 'radash';

import { local2utcDateTime } from '@/utils/utc';

import { conformRule } from './conformRule';
import { csv2int } from './csv2int';
import type {
  HookFormRRStackData,
  HookFormRRStackRuleData,
  RRStackJsonRule,
} from './types';

/**
 * Map the RHF UI schedule (UI-friendly types) to the rrstack engine schedule.
 * - 'span' → undefined freq
 * - Date | null → epoch ms | undefined
 * - tolerant CSV text → number[]
 * - arrays pass through unchanged
 * Assumes timezone has been validated upstream.
 */
export const rhf2rrstack = (
  rhf: HookFormRRStackData,
  opts: { endDatesInclusive?: boolean } = {},
): RRStackJson => {
  const { timeUnit, timezone } = rhf;
  const { endDatesInclusive } = opts;

  const rules: RRStackJsonRule[] = Array.isArray(rhf.rules)
    ? rhf.rules.map((r) =>
        rhfrule2rrstackrule(
          r,
          timezone as TimeZoneId,
          timeUnit,
          endDatesInclusive,
        ),
      )
    : [];

  return {
    ...rhf,
    rules,
  };
};

const hasTime = (d: Date) =>
  d.getHours() !== 0 ||
  d.getMinutes() !== 0 ||
  d.getSeconds() !== 0 ||
  d.getMilliseconds() !== 0;

/**
 * Map a single RHF rule to engine RuleJson with timezone-aware clamps.
 * - Starts: date-only → midnight in tz; datetime → exact wall time in tz.
 * - Ends:
 *   • endDatesInclusive=true: ignore time-of-day and clamp to midnight of the NEXT day in tz
 *   • endDatesInclusive=false: date-only → midnight in tz; datetime → exact wall time in tz
 */
export const rhfrule2rrstackrule = (
  rule: HookFormRRStackRuleData,
  timezone: TimeZoneId,
  timeUnit?: UnixTimeUnit,
  endDatesInclusive = false,
): RRStackJsonRule => {
  const { conformedRule } = conformRule(rule);

  const options = conformedRule.options ?? {};

  const freq =
    options.freq && options.freq !== 'span' ? options.freq : undefined;

  const startsUtc = local2utcDateTime(options.starts);

  const starts =
    startsUtc instanceof Date
      ? hasTime(startsUtc)
        ? wallTimeToEpoch(startsUtc, timezone, timeUnit)
        : dateOnlyToEpoch(startsUtc, timezone, timeUnit)
      : undefined;

  const endsUtc = local2utcDateTime(options.ends);

  const ends =
    endsUtc instanceof Date
      ? endDatesInclusive
        ? dateOnlyToEpoch(
            new Date(endsUtc.setUTCDate(endsUtc.getUTCDate() + 1)),
            timezone,
            timeUnit,
          )
        : hasTime(endsUtc)
          ? wallTimeToEpoch(endsUtc, timezone, timeUnit)
          : dateOnlyToEpoch(endsUtc, timezone, timeUnit)
      : undefined;

  const duration =
    conformedRule.duration &&
    Object.values(conformedRule.duration).some(Boolean)
      ? conformedRule.duration
      : undefined;

  return {
    duration,
    effect: conformedRule.effect ?? 'active',
    label: conformedRule.label ?? undefined,
    options: {
      ...omit(options, ['bymonthday', 'byhour', 'byminute']),
      byhour: csv2int(options.byhour, { min: 0, max: 23 }),
      byminute: csv2int(options.byminute, { min: 0, max: 59 }),
      bymonth: options.bymonth ?? undefined,
      bymonthday: csv2int(options.bymonthday, { min: 1, max: 31 }),
      bysetpos: options.bysetpos ?? undefined,
      byweekday: options.byweekday ?? undefined,
      ends,
      freq,
      starts,
    },
  };
};
