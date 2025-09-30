import type { LiteralString } from './LiteralString';

export type PrefixProps<T, Prefix extends string> =
  LiteralString<Prefix> extends never
    ? never
    : {
        [K in keyof T as K extends string
          ? `${Prefix}${Capitalize<K>}`
          : never]: T[K];
      };
