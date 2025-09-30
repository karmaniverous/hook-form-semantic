import { csv2int } from './csv2int';
import type {
  EngineRule,
  EngineSchedule,
  FrequencyEngine,
  UISchedule,
} from './types';

/**
 * Map the RHF UI schedule (UI-friendly types) to the rrstack engine schedule.
 * - 'span' → undefined freq
 * - Date | null → epoch ms | undefined
 * - tolerant CSV text → number[]
 * - arrays pass through unchanged
 * Assumes timezone has been validated upstream.
 */
export function rhf2rrstack(ui: UISchedule): EngineSchedule {
  const rules: EngineRule[] = Array.isArray(ui.rules)
    ? ui.rules.map((r) => {
        const o = r.options ?? {};
        const freq =
          o.freq && o.freq !== 'span' ? (o.freq as FrequencyEngine) : undefined;
        const starts =
          o.starts instanceof Date ? o.starts.getTime() : undefined;
        const ends = o.ends instanceof Date ? o.ends.getTime() : undefined;
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
            bymonthday: csv2int(o.bymonthdayText, { min: 1, max: 31 }),
            byhour: csv2int(o.byhourText, { min: 0, max: 23 }),
            byminute: csv2int(o.byminuteText, { min: 0, max: 59 }),
          },
        };
      })
    : [];
  return {
    timezone: ui.timezone,
    rules,
  };
}
