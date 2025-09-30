import { useEffect, useMemo } from 'react';
import { type FieldValues, useController, useWatch } from 'react-hook-form';

import type { HookFormProps } from '@/types/HookFormProps';
import { deprefixProps } from '@/utils/deprefixProps';

export interface UseHookFormProps<
  T extends FieldValues,
  Props extends HookFormProps<T> = HookFormProps<T>,
  Prefix extends string = never,
> {
  props: Props;
  prefixes?: readonly Prefix[];
}

export const useHookForm = <
  T extends FieldValues,
  Props extends HookFormProps<T> = HookFormProps<T>,
  Prefix extends string = never,
>({
  props,
  prefixes = [] as const,
}: UseHookFormProps<T, Props, Prefix>) => {
  const { deprefixed, rest } = useMemo(() => {
    return deprefixProps<T, Props, Prefix>(props, prefixes);
  }, [prefixes, props]);

  const controller = useController(deprefixed.hook);

  const watchedValue = useWatch({
    control: deprefixed.hook.control,
    name: deprefixed.hook.name,
  });

  useEffect(() => {
    props.logger?.debug(`${deprefixed.hook.name} form data`, watchedValue);
  }, [watchedValue, props.logger]);

  return { controller, deprefixed, rest };
};
