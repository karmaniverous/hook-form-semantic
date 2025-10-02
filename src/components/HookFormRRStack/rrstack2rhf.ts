import type { RRStackOptions } from '@karmaniverous/rrstack';

import { int2csv } from './int2csv';
import type { HookFormRRStackData } from './types';

/**
 * Map the rrstack schedule to the RHF UI schedule (UI-friendly types).
 * - undefined freq → 'span'
 * - epoch ms | undefined → Date | null
 * - number[] → tolerant CSV text strings
 * - arrays pass through unchanged
 */
export function rrstack2rhf(rrstack: RRStackOptions): HookFormRRStackData {
  const rhf: HookFormRRStackData = {
    timezone: rrstack.timezone,
    rules: Array.isArray(rrstack.rules)
      ? rrstack.rules.map((r) => {
          const o = r.options ?? {};
          const freq = o.freq ?? 'span';
          const starts =
            typeof o.starts === 'number' ? new Date(o.starts) : null;
          const ends = typeof o.ends === 'number' ? new Date(o.ends) : null;

          // Normalize rrstack byweekday to UI number[]
          const byweekday: number[] | undefined = Array.isArray(o.byweekday)
            ? (o.byweekday as unknown[])
                .map((v) => {
                  if (typeof v === 'number') return v;
                  if (typeof v === 'string') {
                    const m: Record<string, number> = {
                      mo: 0,
                      tu: 1,
                      we: 2,
                      th: 3,
                      fr: 4,
                      sa: 5,
                      su: 6,
                    };
                    const k = v.toLowerCase().slice(0, 2);
                    return m[k];
                  }
                  if (
                    v &&
                    typeof v === 'object' &&
                    'weekday' in (v as Record<string, unknown>)
                  ) {
                    const w = (v as Record<string, unknown>).weekday;
                    if (typeof w === 'number') return w;
                  }
                  return undefined;
                })
                .filter((n): n is number => typeof n === 'number')
            : undefined;
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
              byweekday,
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

  // console.log('rrstack2rhf', { rrstack, rhf });

  return rhf;
}
