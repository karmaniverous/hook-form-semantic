import { get, omit, set } from 'lodash';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import {
  type ControllerProps,
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import {
  Checkbox,
  Form,
  type StrictCheckboxProps,
  type StrictFormFieldProps,
} from 'semantic-ui-react';

import { concatClassNames } from '../../lib/utils/concatClassNames';
import {
  deprefix,
  type PrefixedPartial,
} from '../../lib/utils/PrefixedPartial';

export interface HookFormCheckboxProps<T extends FieldValues>
  extends Omit<
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
    PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'>,
    PrefixedPartial<StrictCheckboxProps, 'checkbox'> {
  checkLabel?: string;
  leftLabel?: string;
  rightLabel?: string;
  uncheckLabel?: string;
}

export const HookFormCheckbox = <T extends FieldValues>({
  checkLabel,
  label,
  leftLabel,
  rightLabel,
  uncheckLabel,
  ...props
}: HookFormCheckboxProps<T>) => {
  const {
    hook: hookProps,
    checkbox: checkboxProps,
    rest: fieldProps,
  } = useMemo(() => deprefix(props, ['hook', 'checkbox']), [props]);

  const {
    field: { onChange: hookFieldOnChange, value, ...hookFieldProps },
    fieldState: { error },
  } = useController(hookProps as UseControllerProps);

  const handleChange = useCallback(
    (event: FormEvent<HTMLInputElement>, data: StrictCheckboxProps) => {
      checkboxProps.onChange?.(event, data);

      set(event, 'target.value', get(data, 'checked'));

      hookFieldOnChange(event);
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
            onClick={() => (value ? checkboxRef.current?.click() : undefined)}
          >
            {uncheckLabel}
          </label>
        )}

        <Checkbox
          {...checkboxProps}
          {...omit(hookFieldProps, 'ref')}
          // TECHDEBT: unsafe assignment

          checked={value}
          onChange={handleChange}
          ref={checkboxRef}
        />

        {checkLabel && (
          <label
            className="control"
            onClick={() => (!value ? checkboxRef.current?.click() : undefined)}
          >
            {checkLabel}
          </label>
        )}

        {rightLabel && <label>{rightLabel}</label>}
      </div>
    </Form.Field>
  );
};
