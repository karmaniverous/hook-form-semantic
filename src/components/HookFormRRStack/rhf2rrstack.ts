import type {
  DurationParts,
  RRStackOptions,
  RuleJson,
} from '@karmaniverous/rrstack';
import { omit } from 'radash';

import { csv2int } from './csv2int';
import type { HookFormRRStackData } from './types';

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
    ? rhf.rules.map((r) => {
        const o = r.options ?? {};

        const freq = o.freq && o.freq !== 'span' ? o.freq : undefined;

        const starts =
          o.starts instanceof Date ? o.starts.getTime() : undefined;

        const ends = o.ends instanceof Date ? o.ends.getTime() : undefined;

        const duration: DurationParts | undefined = freq
          ? r.duration && Object.values(r.duration).some(Boolean)
            ? r.duration
            : { days: 1 }
          : undefined;

        return {
          label: r.label ?? undefined,
          effect: r.effect ?? 'active',
          duration,
          options: {
            ...omit(o, ['bymonthdayText', 'byhourText', 'byminuteText']),
            freq,
            starts,
            ends,
            bymonth: o.bymonth ?? undefined,
            byweekday: o.byweekday ?? undefined,
            bysetpos: o.bysetpos ?? undefined,
            bymonthday: csv2int(o.bymonthdayText, { min: 1, max: 31 }),
            byhour: csv2int(o.byhourText, { min: 0, max: 23 }),
            byminute: csv2int(o.byminuteText, { min: 0, max: 59 }),
          },
        };
      })
    : [];

  const rrstack: RRStackOptions = {
    timezone: rhf.timezone,
    rules,
  };

  // console.log('rhf2rrstack', { rhf, rrstack });

  return rrstack;
}
