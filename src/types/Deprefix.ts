import type { HookFormProps } from './HookFormProps';
import type { PickPrefix } from './PickPrefix';
import type { PickRest } from './PickRest';

export type Deprefix<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Props extends HookFormProps<any>,
  Prefix extends string,
> = {
  deprefixed: {
    [P in Prefix]: PickPrefix<Props, P>;
  };
  rest: PickRest<Props, Prefix>;
};
