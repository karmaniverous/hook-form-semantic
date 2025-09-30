import type { ControllerProps, FieldValues } from 'react-hook-form';

import type { LiteralString } from '@/types/LiteralString';
import type { Logger } from '@/types/Logger';
import type { PrefixProps } from '@/types/PrefixProps';

export type HookFormProps<T extends FieldValues, HookPrefix extends string> =
  LiteralString<HookPrefix> extends never
    ? never
    : PrefixProps<Omit<ControllerProps<T>, 'render'>, HookPrefix> & {
        logger?: Logger;
      };
