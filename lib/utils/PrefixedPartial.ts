import _ from 'lodash';

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
  prefixes = _.castArray(prefixes);

  const blank = [...prefixes, restKey]
    .map((k) => ({ [k]: {} }))
    .reduce(_.merge, {}) as Deprefix<T, Prefixes, RestKey>;

  return _.transform(
    obj as _.Dictionary<unknown>,
    (a, v, k) => {
      const prefix = prefixes.find((p) => k.startsWith(p));

      _.set(
        a,
        [prefix ?? restKey, prefix ? _.lowerFirst(k.slice(prefix.length)) : k],
        v,
      );
    },
    blank,
  );
};
