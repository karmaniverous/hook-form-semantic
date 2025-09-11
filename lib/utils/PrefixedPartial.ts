export type PrefixedPartial<T, Prefix extends string> = {
  [K in keyof T as K extends string
    ? `${Prefix}${Capitalize<K>}`
    : never]: T[K];
};

type StripPrefix<
  T extends string,
  Prefix extends string,
> = T extends `${Prefix}${infer K}` ? Uncapitalize<K> : never;

type PickPrefix<T, Prefix extends string> = {
  [K in keyof T as K extends `${Prefix}${string}`
    ? StripPrefix<K, Prefix>
    : never]: T[K];
};

type PickRest<T, Prefixes extends string> = {
  [K in keyof T as K extends `${Prefixes}${string}` ? never : K]: T[K];
};

type Deprefix<T, Prefixes extends string, RestKey extends string> = {
  [P in Prefixes]: PickPrefix<T, P>;
} & {
  [R in RestKey]: PickRest<T, Prefixes>;
};

export const deprefix = <T, Prefixes extends string, RestKey extends string>(
  obj: T,
  prefixes: Prefixes | Prefixes[],
  restKey: RestKey = 'rest' as RestKey,
) => {
  const pfxs = Array.isArray(prefixes) ? prefixes : [prefixes];
  const lowerFirst = (s: string) =>
    s.length ? s[0].toLowerCase() + s.slice(1) : s;

  // Initialize result buckets for each prefix and the restKey
  const initial = Object.fromEntries(
    [...pfxs, restKey].map((k) => [k, {}]),
  ) as unknown as Deprefix<T, Prefixes, RestKey>;

  const dict = obj as Record<string, unknown>;
  const result = initial as Record<string, Record<string, unknown>>;

  Object.keys(dict).forEach((rawKey) => {
    const match = pfxs.find((p) => rawKey.startsWith(p));
    if (match) {
      const stripped = lowerFirst(rawKey.slice(match.length));
      (result[match] as Record<string, unknown>)[stripped] = dict[rawKey];
    } else {
      (result[restKey as string] as Record<string, unknown>)[rawKey] =
        dict[rawKey];
    }
  });

  return result as Deprefix<T, Prefixes, RestKey>;
};
