import type { StripPrefix } from './StripPrefix';

export type PickPrefix<
  Props extends Record<string, unknown>,
  Prefix extends string,
> = {
  [K in keyof Props as K extends `${Prefix}${string}`
    ? StripPrefix<K, Prefix>
    : never]: Props[K];
};
