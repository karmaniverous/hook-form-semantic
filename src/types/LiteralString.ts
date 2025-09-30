import type { IsUnion } from './IsUnion';

export type LiteralString<S extends string> = string extends S
  ? never
  : IsUnion<S> extends true
    ? never
    : S;
