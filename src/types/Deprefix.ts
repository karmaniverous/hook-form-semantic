import type { PickPrefix } from './PickPrefix';
import type { PickRest } from './PickRest';

export type Deprefix<
  Props extends Record<string, unknown>,
  Prefix extends string,
  RestKey extends string,
> = {
  [P in Prefix]: PickPrefix<Props, P>;
} & {
  [R in RestKey]: PickRest<Props, Prefix>;
};
