import { useEffect, useMemo } from 'react';
import type { ControllerProps } from 'react-hook-form';
import { type FieldValues, useController, useWatch } from 'react-hook-form';

import type { HookFormProps } from '@/types/HookFormProps';
import { deprefix } from '@/utils/deprefix';

export interface UseHookFormProps<
  T extends FieldValues,
  Prefix extends string,
  HookPrefix extends string,
  RestPrefix extends string,
  Props extends HookFormProps<T, HookPrefix>,
> {
  props?: Props;
  prefixes?: Prefix[];
  hookPrefix?: HookPrefix;
  restPrefix?: RestPrefix;
}

export const useHookForm = <
  T extends FieldValues,
  Prefix extends string,
  HookPrefix extends string,
  RestPrefix extends string,
  Props extends HookFormProps<T, HookPrefix>,
>({
  props = {} as Props,
  prefixes = [] as Prefix[],
  hookPrefix = 'hook' as HookPrefix,
  restPrefix = 'rest' as RestPrefix,
}: UseHookFormProps<T, Prefix, HookPrefix, RestPrefix, Props>) => {
  const [deprefixedProps, hookProps] = useMemo(() => {
    const deprefixedProps = deprefix(
      props,
      [hookPrefix, ...prefixes],
      restPrefix,
    );

    const hookProps = deprefixedProps[hookPrefix] as unknown as Omit<
      ControllerProps<T>,
      'render'
    >;

    return [deprefixedProps, hookProps];
  }, [hookPrefix, prefixes, props, restPrefix]);

  const controllerState = useController(hookProps);

  const watchedValue = useWatch({
    control: hookProps.control,
    name: hookProps.name,
  });

  useEffect(() => {
    props.logger?.debug(`${hookProps.name} form data`, watchedValue);
  }, [watchedValue, props.logger]);

  return { controllerState, deprefixedProps };
};
