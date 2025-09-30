import { useEffect, useMemo } from 'react';
import { type FieldValues, useController, useWatch } from 'react-hook-form';

import type { HookFormProps } from '@/types/HookFormProps';
import { deprefixProps } from '@/utils/deprefixProps';

export interface UseHookFormProps<
  T extends FieldValues,
  Props extends HookFormProps<T>,
  Prefixes extends readonly string[] = [],
> {
  props: Props;
  prefixes: Prefixes;
}

export const useHookForm = <
  T extends FieldValues,
  Props extends HookFormProps<T>,
  Prefixes extends readonly string[] = [],
>({
  props,
  prefixes,
}: UseHookFormProps<T, Props, Prefixes>) => {
  const { deprefixed, rest } = useMemo(() => {
    const allPrefixes = ['hook', ...prefixes] as const;

    return deprefixProps<T, Props, typeof allPrefixes>(props, allPrefixes);
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
