import type { RRStackOptions, RuleJson } from '@karmaniverous/rrstack';
import { omit } from 'radash';

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
export function rhf2rrstack(rhf: HookFormRRStackData): RRStackOptions {
  const rules: RuleJson[] = Array.isArray(rhf.rules)
    ? rhf.rules.map(rhfrule2rrstackrule)
    : [];

  const rrstack: RRStackOptions = {
    timezone: rhf.timezone,
    rules,
  };

  return rrstack;
}

export const rhfrule2rrstackrule = (
  rule: HookFormRRStackRuleData,
): RuleJson => {
  const options = rule.options ?? {};

  const freq =
    options.freq && options.freq !== 'span' ? options.freq : undefined;

  const starts =
    options.starts instanceof Date ? options.starts.getTime() : undefined;

  const ends =
    options.ends instanceof Date ? options.ends.getTime() : undefined;

  const duration =
    rule.duration && Object.values(rule.duration).some(Boolean)
      ? rule.duration
      : undefined;

  return {
    label: rule.label ?? undefined,
    effect: rule.effect ?? 'active',
    duration,
    options: {
      ...omit(options, ['bymonthdayText', 'byhourText', 'byminuteText']),
      freq,
      starts,
      ends,
      bymonth: options.bymonth ?? undefined,
      byweekday: options.byweekday ?? undefined,
      bysetpos: options.bysetpos ?? undefined,
      bymonthday: csv2int(options.bymonthdayText, { min: 1, max: 31 }),
      byhour: csv2int(options.byhourText, { min: 0, max: 23 }),
      byminute: csv2int(options.byminuteText, { min: 0, max: 59 }),
    },
  };
};
