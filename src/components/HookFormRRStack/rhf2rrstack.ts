import type {
  RRStackOptions,
  RuleJson,
  TimeZoneId,
  UnixTimeUnit,
} from '@karmaniverous/rrstack';
import { dateOnlyToEpoch, wallTimeToEpoch } from '@karmaniverous/rrstack';
import { omit } from 'radash';

import { conformRule } from './conformRule';
import { csv2int } from './csv2int';
import type { HookFormRRStackData, HookFormRRStackRuleData } from './types';

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
): RRStackOptions => {
  const { timeUnit, timezone } = rhf;
  const { endDatesInclusive } = opts;

  const rules: RuleJson[] = Array.isArray(rhf.rules)
    ? rhf.rules.map((r) =>
        rhfrule2rrstackrule(
          r,
          timezone as TimeZoneId,
          timeUnit,
          endDatesInclusive,
        ),
      )
    : [];

  const rrstack: RRStackOptions = {
    ...rhf,
    rules,
  };

  return rrstack;
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
): RuleJson => {
  const { conformedRule } = conformRule(rule);

  const options = conformedRule.options ?? {};

  const freq =
    options.freq && options.freq !== 'span' ? options.freq : undefined;

  const starts =
    options.starts instanceof Date
      ? hasTime(options.starts)
        ? wallTimeToEpoch(options.starts, timezone, timeUnit)
        : dateOnlyToEpoch(options.starts, timezone, timeUnit)
      : undefined;

  const ends =
    options.ends instanceof Date
      ? endDatesInclusive
        ? dateOnlyToEpoch(
            new Date(
              options.ends.getFullYear(),
              options.ends.getMonth(),
              options.ends.getDate() + 1,
            ),
            timezone,
            timeUnit,
          )
        : hasTime(options.ends)
          ? wallTimeToEpoch(options.ends, timezone, timeUnit)
          : dateOnlyToEpoch(options.ends, timezone, timeUnit)
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
      ...omit(options, ['bymonthdayText', 'byhourText', 'byminuteText']),
      byhour: csv2int(options.byhourText, { min: 0, max: 23 }),
      byminute: csv2int(options.byminuteText, { min: 0, max: 59 }),
      bymonth: options.bymonth ?? undefined,
      bymonthday: csv2int(options.bymonthdayText, { min: 1, max: 31 }),
      bysetpos: options.bysetpos ?? undefined,
      byweekday: options.byweekday ?? undefined,
      ends,
      freq,
      starts,
    },
  };
};
