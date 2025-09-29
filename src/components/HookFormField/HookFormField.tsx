import { omit } from 'radash';
import { useCallback, useMemo } from 'react';
import type { ControllerFieldState } from 'react-hook-form';
import {
  type ControllerProps,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import { Form, type FormFieldProps } from 'semantic-ui-react';

import { deprefix, type PrefixedPartial } from '../../types/PrefixedPartial';

export interface HookFormFieldProps<T extends FieldValues, C>
  extends Omit<
      FormFieldProps,
      | 'children'
      | 'checked'
      | 'disabled'
      | 'error'
      | 'name'
      | 'onBlur'
      | 'onChange'
      | 'ref'
      | 'value'
    >,
    PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'> {
  children?:
    | FormFieldProps['children']
    | ((
        field: ControllerRenderProps<T, Path<T>>,
        fieldState: ControllerFieldState,
      ) => FormFieldProps['children']);
  onChange?: (event: React.SyntheticEvent<HTMLElement>, data: C) => void;
}

export const HookFormField = <T extends FieldValues, C>({
  children,
  onChange,
  ...props
}: HookFormFieldProps<T, C>) => {
  const { hook: hookProps, rest: fieldProps } = useMemo(
    () => deprefix(props, 'hook'),
    [props],
  );

  const {
    field: { onChange: hookFieldOnChange, ...hookFieldProps },
    fieldState,
  } = useController(hookProps as UseControllerProps);

  const handleChange = useCallback(
    (event: React.SyntheticEvent<HTMLElement>, data: C) => {
      onChange?.(event, data);
      // Conform to RHF expectations by passing a minimal event-like payload
      const nextValue =
        (data as unknown as Record<string, unknown>)?.value ??
        (data as unknown as Record<string, unknown>)?.checked;
      hookFieldOnChange({ target: { value: nextValue } } as unknown as {
        target: { value: unknown };
      });
    },
    [hookFieldOnChange, onChange],
  );

  const hookField = useMemo(() => {
    const { value, ...rest } = hookFieldProps;

    return {
      onChange: handleChange,
      ...(typeof value === 'boolean'
        ? { checked: value }
        : { value: value ?? '' }),
      ...omit(rest, ['ref']),
    };
  }, [handleChange, hookFieldProps]);

  return (
    <Form.Field
      {...fieldProps}
      {...(typeof children === 'function' ? {} : hookField)}
      error={fieldState.error?.message}
    >
      {typeof children === 'function'
        ? children(hookField as ControllerRenderProps<T, Path<T>>, fieldState)
        : children}
    </Form.Field>
  );
};
