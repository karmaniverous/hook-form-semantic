import type { StripPrefix } from './StripPrefix';

export type PickPrefix<T, Prefix extends string> = {
  [K in keyof T as K extends `${Prefix}${string}`
    ? StripPrefix<K, Prefix>
    : never]: T[K];
};
