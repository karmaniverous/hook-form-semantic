import type { FieldValues } from 'react-hook-form';

import type { HookFormProps } from './HookFormProps';
import type { PickPrefix } from './PickPrefix';
import type { PickRest } from './PickRest';

export type Deprefix<
  T extends FieldValues,
  Props extends HookFormProps<T>,
  Prefix extends string,
> = {
  deprefixed: {
    [P in Prefix]: PickPrefix<Props, P>;
  };
  rest: PickRest<Props, Prefix>;
};
