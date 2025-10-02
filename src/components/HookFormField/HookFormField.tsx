import { omit } from 'radash';
import { useCallback, useMemo } from 'react';
import type { ControllerFieldState, FieldPath } from 'react-hook-form';
import { type ControllerRenderProps, type FieldValues } from 'react-hook-form';
import { Form, type FormFieldProps } from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

export interface HookFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  C = Record<string, unknown>,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    Omit<
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
    > {
  children?:
    | FormFieldProps['children']
    | ((
        field: ControllerRenderProps<TFieldValues, TName>,
        fieldState: ControllerFieldState,
      ) => FormFieldProps['children']);
  onChange?: (event: React.SyntheticEvent<HTMLElement>, data: C) => void;
}

export const HookFormField = <
  TFieldValues extends FieldValues = FieldValues,
  C = Record<string, unknown>,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormFieldProps<TFieldValues, C, TName>,
) => {
  const {
    controller: {
      field: { onChange: hookFieldOnChange, ...hookFieldProps },
      fieldState,
    },
    rest: { children, onChange, ...fieldProps },
  } = useHookForm({ props });

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
    // If this field is a multi-select (e.g., Dropdown multiple), default empty to []
    const isMultiple =
      (fieldProps as unknown as Record<string, unknown>)?.multiple === true;

    return {
      onChange: handleChange,
      ...(typeof value === 'boolean'
        ? { checked: value }
        : { value: value ?? (isMultiple ? [] : '') }),
      ...omit(rest, ['ref']),
    };
  }, [handleChange, hookFieldProps, fieldProps]);

  return (
    <Form.Field
      {...fieldProps}
      {...(typeof children === 'function' ? {} : hookField)}
      error={fieldState.error?.message}
    >
      {typeof children === 'function'
        ? children(
            hookField as unknown as ControllerRenderProps<TFieldValues, TName>,
            fieldState,
          )
        : children}
    </Form.Field>
  );
};
