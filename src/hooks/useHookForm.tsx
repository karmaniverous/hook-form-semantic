import { useEffect, useMemo } from 'react';
import type { FieldPath } from 'react-hook-form';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
  useWatch,
} from 'react-hook-form';

import type { HookFormProps } from '@/types/HookFormProps';
import { deprefixProps } from '@/utils/deprefixProps';

export interface UseHookFormProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Props extends HookFormProps<any>,
  Prefix extends string = never,
> {
  props: Props;
  prefixes?: readonly Prefix[];
}

export const useHookForm = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Props extends HookFormProps<any, any>,
  Prefix extends string = never,
>({
  props,
  prefixes = [] as const,
}: UseHookFormProps<Props, Prefix>) => {
  // Infer the form value type T from the HookFormProps<T> passed in.
  type TFieldValues =
    Props extends HookFormProps<infer T, any> ? T : FieldValues;
  type TName =
    Props extends HookFormProps<any, infer T> ? T : FieldPath<TFieldValues>;

  const { deprefixed, hookProps, rest } = useMemo(() => {
    // Split props into deprefixed groups and the rest.
    const { deprefixed, rest } = deprefixProps(props, prefixes);

    // Narrow the deprefixed hook props so RHF infers the concrete T.
    const hookProps = deprefixed.hook as UseControllerProps<
      TFieldValues,
      TName
    >;

    return { deprefixed, hookProps, rest };
  }, [prefixes, props]);

  const controller = useController<TFieldValues, TName>(hookProps);

  const watchedValue = useWatch({
    control: hookProps.control,
    name: hookProps.name,
  });

  useEffect(() => {
    props.logger?.debug(`${hookProps.name} form data`, watchedValue);
  }, [watchedValue, props.logger]);

  return { controller, deprefixed, rest };
};
