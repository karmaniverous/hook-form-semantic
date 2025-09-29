// Keep your StripPrefix / PickPrefix / PickRest helpers.

import type { PickPrefix } from '@/types/PickPrefix';
import type { PickRest } from '@/types/PickRest';

// Single prefix, restKey omitted → 'rest'
export function deprefix<T, P extends string>(
  obj: T,
  prefixes: P,
): { [K in P]: PickPrefix<T, K> } & { rest: PickRest<T, P> };

// Tuple prefixes, restKey omitted → 'rest'
export function deprefix<T, const P extends readonly string[]>(
  obj: T,
  prefixes: P,
): { [K in P[number]]: PickPrefix<T, K> } & { rest: PickRest<T, P[number]> };

// Single prefix, restKey provided → R literal
export function deprefix<T, P extends string, R extends string>(
  obj: T,
  prefixes: P,
  restKey: R,
): { [K in P]: PickPrefix<T, K> } & { [K in R]: PickRest<T, P> };

// Tuple prefixes, restKey provided → R literal
export function deprefix<
  T,
  const P extends readonly string[],
  R extends string,
>(
  obj: T,
  prefixes: P,
  restKey: R,
): { [K in P[number]]: PickPrefix<T, K> } & {
  [K in R]: PickRest<T, P[number]>;
};

// Implementation (single)
export function deprefix<T>(
  obj: T,
  prefixes: string | readonly string[],
  restKey = 'rest',
) {
  const pfxs = (
    Array.isArray(prefixes) ? prefixes : [prefixes]
  ) as readonly string[];

  const result = Object.fromEntries(
    [...pfxs, restKey].map((k) => [k, {}]),
  ) as Record<string, Record<string, unknown>>;
  const dict = obj as Record<string, unknown>;

  for (const rawKey of Object.keys(dict)) {
    const match = pfxs.find((p) => rawKey.startsWith(p));
    if (match) {
      const stripped = rawKey.slice(match.length);
      const key = stripped ? stripped[0].toLowerCase() + stripped.slice(1) : '';
      result[match][key] = dict[rawKey];
    } else {
      result[restKey][rawKey] = dict[rawKey];
    }
  }
  return result;
}
