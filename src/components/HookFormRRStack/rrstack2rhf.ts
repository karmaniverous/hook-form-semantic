import type { RRStackOptions } from '@karmaniverous/rrstack';

import { int2csv } from './int2csv';
import type { FrequencyUI, UISchedule } from './types';

/**
 * Map the rrstack engine schedule to the RHF UI schedule (UI-friendly types).
 * - undefined freq → 'span'
 * - epoch ms | undefined → Date | null
 * - number[] → tolerant CSV text strings
 * - arrays pass through unchanged
 */
export function rrstack2rhf(engine: RRStackOptions): UISchedule {
  return {
    timezone: engine.timezone,
    rules: Array.isArray(engine.rules)
      ? engine.rules.map((r) => {
          const o = r.options ?? {};
          const freq: FrequencyUI = (o.freq as FrequencyUI) ?? 'span';
          const starts =
            typeof o.starts === 'number' ? new Date(o.starts) : null;
          const ends = typeof o.ends === 'number' ? new Date(o.ends) : null;
          return {
            label: r.label ?? undefined,
            effect: r.effect ?? 'active',
            duration: r.duration ?? undefined,
            options: {
              ...o,
              freq,
              starts,
              ends,
              bymonth: o.bymonth ?? undefined,
              byweekday: o.byweekday ?? undefined,
              bysetpos: o.bysetpos ?? undefined,
              bymonthdayText: int2csv(o.bymonthday),
              byhourText: int2csv(o.byhour),
              byminuteText: int2csv(o.byminute),
            },
          };
        })
      : [],
  };
}
