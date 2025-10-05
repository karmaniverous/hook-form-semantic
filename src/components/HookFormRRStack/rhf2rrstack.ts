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
export function rhf2rrstack(
  rhf: HookFormRRStackData,
  opts: { timeUnit?: UnixTimeUnit; endDatesInclusive?: boolean } = {},
): RRStackOptions {
  const unit: UnixTimeUnit = opts?.timeUnit ?? 'ms';
  const inclusive = opts?.endDatesInclusive ?? false;

  const rules: RuleJson[] = Array.isArray(rhf.rules)
    ? rhf.rules.map((r) =>
        rhfrule2rrstackrule(
          r,
          rhf.timezone as unknown as TimeZoneId,
          unit,
          inclusive,
        ),
      )
    : [];

  const rrstack: RRStackOptions = {
    timezone: rhf.timezone,
    rules,
  };

  return rrstack;
}

const hasTime = (d: Date) =>
  d.getHours() !== 0 ||
  d.getMinutes() !== 0 ||
  d.getSeconds() !== 0 ||
  d.getMilliseconds() !== 0;

/**
 * Map a single RHF rule to engine RuleJson with timezone-aware clamps.
 * - Starts: date-only → midnight in tz; datetime → exact wall time in tz.
 * - Ends:
 *   • inclusive=true: ignore time-of-day and clamp to midnight of the NEXT day in tz
 *   • inclusive=false: date-only → midnight in tz; datetime → exact wall time in tz
 */
export const rhfrule2rrstackrule = (
  rule: HookFormRRStackRuleData,
  timezone?: TimeZoneId,
  unit: UnixTimeUnit = 'ms',
  endDatesInclusive = false,
): RuleJson => {
  const { conformedRule } = conformRule(rule);

  const options = conformedRule.options ?? {};

  const freq =
    options.freq && options.freq !== 'span' ? options.freq : undefined;

  const starts =
    options.starts instanceof Date
      ? timezone
        ? hasTime(options.starts)
          ? wallTimeToEpoch(options.starts, timezone, unit)
          : dateOnlyToEpoch(options.starts, timezone, unit)
        : options.starts.getTime()
      : undefined;

  const ends =
    options.ends instanceof Date
      ? timezone
        ? endDatesInclusive
          ? dateOnlyToEpoch(
              new Date(
                options.ends.getFullYear(),
                options.ends.getMonth(),
                options.ends.getDate() + 1,
              ),
              timezone,
              unit,
            )
          : hasTime(options.ends)
            ? wallTimeToEpoch(options.ends, timezone, unit)
            : dateOnlyToEpoch(options.ends, timezone, unit)
        : options.ends.getTime()
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
