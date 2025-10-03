import { omit } from 'radash';
import type { ChangeEventHandler } from 'react';
import type { FieldPath } from 'react-hook-form';
import { type FieldValues } from 'react-hook-form';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';
import { Form, type FormFieldProps, Input, Label } from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';

export interface HookFormNumericProps<
  TFieldValues extends FieldValues = FieldValues,
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
    >,
    PrefixProps<
      Omit<NumericFormatProps, 'customInput' | 'onChange'>,
      'numeric'
    > {
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export const HookFormNumeric = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  ...props
}: HookFormNumericProps<TFieldValues, TName>) => {
  const {
    controller: {
      field: { onChange: hookFieldOnChange, ...hookFieldProps },
      fieldState,
    },
    deprefixed: { numeric: numericProps },
    rest: { fieldProps },
  } = useHookForm({ props, prefixes: ['numeric'] as const });

  return (
    <Form.Field {...fieldProps} error={fieldState.error?.message}>
      {label && <label>{label}</label>}
      <NumericFormat
        {...numericProps}
        {...omit(hookFieldProps, ['ref'])}
        customInput={Input}
        onValueChange={({ floatValue }) =>
          hookFieldOnChange({
            target: { type: 'number', value: floatValue },
          })
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
