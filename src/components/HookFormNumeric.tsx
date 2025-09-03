import _ from 'lodash';
import type { ChangeEventHandler } from 'react';
import { useMemo } from 'react';
import {
  type ControllerProps,
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';
import { Form, type FormFieldProps, Input, Label } from 'semantic-ui-react';

import {
  deprefix,
  type PrefixedPartial,
} from '../../lib/utils/PrefixedPartial';

export interface HookFormNumericProps<T extends FieldValues>
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
    PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'>,
    PrefixedPartial<
      Omit<NumericFormatProps, 'customInput' | 'onChange'>,
      'numeric'
    > {
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export const HookFormNumeric = <T extends FieldValues>({
  label,
  ...props
}: HookFormNumericProps<T>) => {
  const {
    hook: hookProps,
    numeric: numericProps,
    rest: fieldProps,
  } = useMemo(() => deprefix(props, ['hook', 'numeric']), [props]);

  const {
    field: { onChange: hookFieldOnChange, ...hookFieldProps },
    fieldState,
  } = useController(hookProps as UseControllerProps);

  return (
    <Form.Field {...fieldProps} error={!!fieldState.error?.message}>
      {label && <label>{label}</label>}
      <NumericFormat
        {...numericProps}
        {..._.omit(hookFieldProps, ['ref'])}
        customInput={Input}
        onValueChange={({ floatValue }) =>
          hookFieldOnChange({ target: { type: 'number', value: floatValue } })
        }
      />

      {fieldState.error?.message && (
        <Label basic color="red" pointing>
          {fieldState.error?.message}
        </Label>
      )}
    </Form.Field>
  );
};
