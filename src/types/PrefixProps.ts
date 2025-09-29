// Utility to detect unions
type IsUnion<T, U = T> = T extends unknown
  ? [U] extends [T]
    ? false
    : true
  : never;

// Guard: only accept a single string literal (no unions, no wide `string`)
type LiteralString<S extends string> = string extends S
  ? never
  : IsUnion<S> extends true
    ? never
    : S;

export type PrefixProps<T, Prefix extends string> =
  LiteralString<Prefix> extends never
    ? never
    : {
        [K in keyof T as K extends string
          ? `${Prefix}${Capitalize<K>}`
          : never]: T[K];
      };
