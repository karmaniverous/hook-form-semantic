import type { FieldValues, UseControllerProps } from 'react-hook-form';

import type { Logger } from '@/types/Logger';
import type { PrefixProps } from '@/types/PrefixProps';

export type HookFormProps<T extends FieldValues> = PrefixProps<
  UseControllerProps<T>,
  'hook'
> & {
  logger?: Logger;
};
