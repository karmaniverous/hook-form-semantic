import _ from 'lodash';
import { type PropsWithChildren, useCallback, useMemo } from 'react';
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

import {
  deprefix,
  type PrefixedPartial,
} from '../../lib/utils/PrefixedPartial';

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
        field: ControllerRenderProps<
          PropsWithChildren<T>,
          Path<PropsWithChildren<T>>
        >,
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
      // Conform Semantic's event to react-hook-form's expectations.
      _.set(
        event,
        'target.value',
        _.get(data, 'value') ?? _.get(data, 'checked'),
      );
      hookFieldOnChange(event);
    },
    [hookFieldOnChange, onChange],
  );

  const hookField = useMemo(() => {
    // TECHDEBT: unsafe assignment

    const { value, ...rest } = hookFieldProps;

    return {
      onChange: handleChange,
      // TECHDEBT: unsafe assignment

      ...(_.isBoolean(value) ? { checked: value } : { value: value ?? '' }),
      ...rest,
    };
  }, [handleChange, hookFieldProps]);

  return (
    <Form.Field
      {...fieldProps}
      {...(_.isFunction(children) ? {} : hookField)}
      error={fieldState.error?.message}
    >
      {_.isFunction(children)
        ? children(
            hookField as ControllerRenderProps<
              PropsWithChildren<PropsWithChildren<T>>,
              Path<PropsWithChildren<PropsWithChildren<T>>>
            >,
            fieldState,
          )
        : children}
    </Form.Field>
  );
};
