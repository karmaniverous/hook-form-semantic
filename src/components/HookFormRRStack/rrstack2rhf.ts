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
              // ensure arrays or undefined for array-like options
              bymonth: Array.isArray(o.bymonth) ? o.bymonth : undefined,
              byweekday: Array.isArray(o.byweekday) ? o.byweekday : undefined,
              bysetpos: Array.isArray(o.bysetpos) ? o.bysetpos : undefined,
              // sanitize count: never null on UI shape
              count: typeof o.count === 'number' ? o.count : undefined,
              // stringify only arrays for CSV-backed UI text fields
              bymonthdayText: int2csv(
                Array.isArray(o.bymonthday) ? o.bymonthday : undefined,
              ),
              byhourText: int2csv(
                Array.isArray(o.byhour) ? o.byhour : undefined,
              ),
              byminuteText: int2csv(
                Array.isArray(o.byminute) ? o.byminute : undefined,
              ),
            },
          };
        })
      : [],
  };
}
