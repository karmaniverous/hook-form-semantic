import { omit } from 'radash';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useRef } from 'react';
import type { FieldPath } from 'react-hook-form';
import { type FieldValues } from 'react-hook-form';
import {
  Checkbox,
  Form,
  type StrictCheckboxProps,
  type StrictFormFieldProps,
} from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';
import { concatClassNames } from '@/utils/concatClassNames';

export interface HookFormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    Omit<
      StrictFormFieldProps,
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
    PrefixProps<StrictCheckboxProps, 'checkbox'> {
  checkLabel?: string;
  leftLabel?: string;
  rightLabel?: string;
  uncheckLabel?: string;
}

export const HookFormCheckbox = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  checkLabel,
  label,
  leftLabel,
  rightLabel,
  uncheckLabel,
  ...props
}: HookFormCheckboxProps<TFieldValues, TName>) => {
  const {
    controller: {
      field: { onChange: hookFieldOnChange, value, ...hookFieldProps },
      fieldState: { error },
    },
    deprefixed: { checkbox: checkboxProps },
    rest: fieldProps,
  } = useHookForm({ props, prefixes: ['checkbox'] });

  const handleChange = useCallback(
    (event: FormEvent<HTMLInputElement>, data: StrictCheckboxProps) => {
      checkboxProps.onChange?.(event, data);
      // Conform to RHF by sending a minimal event-like payload
      hookFieldOnChange({
        target: { value: !!data.checked },
      } as unknown as React.SyntheticEvent<HTMLElement>);
    },
    [checkboxProps, hookFieldOnChange],
  );
  const checkboxRef = useRef<HTMLInputElement>(null);

  return (
    <Form.Field
      {...fieldProps}
      className={concatClassNames(fieldProps.className, 'hook-form-checkbox')}
      error={error?.message}
    >
      <label>{(label as ReactNode) ?? <>&nbsp;</>}</label>

      <div>
        {leftLabel && <label>{leftLabel}</label>}

        {uncheckLabel && (
          <label
            className="control"
            role="none"
            onClick={() => (value ? checkboxRef.current?.click() : undefined)}
          >
            {uncheckLabel}
          </label>
        )}

        <Checkbox
          {...checkboxProps}
          {...omit(hookFieldProps as Record<string, unknown>, ['ref'])}
          checked={value}
          onChange={handleChange}
          ref={checkboxRef}
        />
        {checkLabel && (
          <label
            className="control"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
            role="button"
            tabIndex={0}
            onClick={() => (!value ? checkboxRef.current?.click() : undefined)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!value) checkboxRef.current?.click();
              }
            }}
          >
            {checkLabel}
          </label>
        )}

        {rightLabel && <label>{rightLabel}</label>}
      </div>
    </Form.Field>
  );
};
