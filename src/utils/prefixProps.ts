import { mapKeys } from 'radash';

import type { PrefixProps } from '../types/PrefixProps';

export const prefixProps = <
  Props extends Record<string, unknown>,
  const Prefix extends string = never,
>(
  props: Props,
  prefix: Prefix,
) =>
  mapKeys(
    props,
    (k) => prefix + k[0].toUpperCase() + k.slice(1),
  ) as PrefixProps<Props, Prefix>;
