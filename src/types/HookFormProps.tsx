import type {
  FieldPath,
  FieldValues,
  UseControllerProps,
} from 'react-hook-form';

import type { Logger } from '@/types/Logger';
import type { PrefixProps } from '@/types/PrefixProps';

export type HookFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = PrefixProps<UseControllerProps<TFieldValues, TName>, 'hook'> & {
  logger?: Logger;
};
