import type { RRStackOptions, RuleJson } from '@karmaniverous/rrstack';
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
  const { conformedRule } = conformRule(rule);

  const options = conformedRule.options ?? {};

  const freq =
    options.freq && options.freq !== 'span' ? options.freq : undefined;

  const starts =
    options.starts instanceof Date ? options.starts.getTime() : undefined;

  const ends =
    options.ends instanceof Date ? options.ends.getTime() : undefined;

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
