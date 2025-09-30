import type { Deprefix } from '@/types/Deprefix';
export function deprefix<
  Props extends Record<string, unknown>,
  const Prefix extends string,
  RestKey extends string,
>(
  props: Props,
  prefixes: Prefix[],
  restKey: RestKey,
): Deprefix<Props, Prefix, RestKey>;

export function deprefix<
  Props extends Record<string, unknown>,
  const Prefix extends string,
  RestKey extends string,
>(props: Props, prefixes: readonly Prefix[], restKey = 'rest') {
  const result = Object.fromEntries(
    [...prefixes, restKey].map((k) => [k, {} as Record<string, unknown>]),
  );

  for (const rawKey of Object.keys(props)) {
    const match = prefixes.find((p) => rawKey.startsWith(p));
    if (match) {
      const stripped = rawKey.slice(match.length);
      const key = stripped
        ? stripped[0].toLowerCase() + stripped.slice(1)
        : stripped;

      result[match][key] = props[rawKey];
    } else result[restKey][rawKey] = props[rawKey];
  }

  return result as Deprefix<Props, Prefix, RestKey>;
}
