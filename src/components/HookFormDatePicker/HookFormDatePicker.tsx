import { omit } from 'radash';
import { useCallback, useMemo, useState } from 'react';
import DatePicker, { type DatePickerProps } from 'react-date-picker';
import DateTimePicker, {
  type DateTimePickerProps,
} from 'react-datetime-picker';
import {
  type ControllerProps,
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import { Checkbox, Form, type FormFieldProps } from 'semantic-ui-react';

import { deprefix, type PrefixedPartial } from '../../types/PrefixedPartial';
import { concatClassNames } from '../../utils/concatClassNames';

export interface HookFormDatePickerProps<T extends FieldValues>
  extends Omit<
      FormFieldProps,
      | 'children'
      | 'checked'
      | 'control'
      | 'disabled'
      | 'error'
      | 'name'
      | 'onBlur'
      | 'onChange'
      | 'ref'
      | 'value'
    >,
    Partial<PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'>>,
    PrefixedPartial<DatePickerProps, 'datePicker'>,
    PrefixedPartial<DateTimePickerProps, 'timePicker'> {
  /**
   * Standalone mode (no RHF). Provide value and onChange handlers.
   */
  standalone?: boolean;
  value?: Date | null;
  onChange?: (value: Date | null) => void;
}

export const HookFormDatePicker = <T extends FieldValues>({
  standalone = false,
  value: standaloneValue,
  onChange: standaloneOnChange,
  ...props
}: HookFormDatePickerProps<T>) => {
  const {
    hook: hookProps,
    datePicker: { onChange: onDateChange, ...datePickerProps },
    timePicker: { onChange: onTimeChange, ...timePickerProps },
    rest: { className, label, ...fieldProps },
  } = useMemo(
    () => deprefix(props, ['hook', 'datePicker', 'timePicker']),
    [props],
  );

  const [includeTime, setIncludeTime] = useState<boolean | undefined>(false);

  // RHF controller (skipped in standalone mode)
  const controllerResult = standalone
    ? undefined
    : useController(hookProps as UseControllerProps);

  const hookFieldOnChange = standalone
    ? undefined
    : controllerResult?.field?.onChange;

  const hookFieldProps = standalone
    ? undefined
    : controllerResult?.field
      ? omit(controllerResult.field, ['onBlur', 'onChange', 'ref'])
      : undefined;

  const error = standalone ? undefined : controllerResult?.fieldState?.error;

  const handleChange = useCallback(
    (...[value]: Parameters<NonNullable<DatePickerProps['onChange']>>) => {
      (includeTime ? onTimeChange : onDateChange)?.(value as Date | null);

      if (standalone) {
        standaloneOnChange?.(value as Date | null);
      } else {
        hookFieldOnChange?.({ target: { type: 'date', value } });
      }
    },
    [
      hookFieldOnChange,
      includeTime,
      onDateChange,
      onTimeChange,
      standalone,
      standaloneOnChange,
    ],
  );

  return (
    <Form.Field
      {...fieldProps}
      className={concatClassNames(className, 'hook-form-date-picker')}
      error={!!error}
    >
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label>{label}</label>

          <Checkbox
            checked={includeTime}
            label="Include Time"
            onChange={(event, data) => setIncludeTime(data.checked)}
          />
        </div>
      )}

      <div className="input">
        {includeTime ? (
          <DateTimePicker
            dayPlaceholder="dd"
            disableClock
            hourPlaceholder="hh"
            maxDetail="minute"
            minutePlaceholder="mm"
            monthPlaceholder="mm"
            onChange={handleChange}
            secondPlaceholder="ss"
            showLeadingZeros
            yearPlaceholder="yyyy"
            calendarProps={{
              showNeighboringMonth: false,
              showNavigation: true,
              returnValue: 'start',
            }}
            {...timePickerProps}
            {...(hookFieldProps && !standalone
              ? hookFieldProps
              : { value: standaloneValue })}
          />
        ) : (
          <DatePicker
            dayPlaceholder="dd"
            monthPlaceholder="mm"
            onChange={handleChange}
            showLeadingZeros
            yearPlaceholder="yyyy"
            calendarProps={{
              showNeighboringMonth: false,
              showNavigation: true,
              returnValue: 'start',
            }}
            {...datePickerProps}
            {...(hookFieldProps && !standalone
              ? hookFieldProps
              : { value: standaloneValue })}
          />
        )}
      </div>
    </Form.Field>
  );
};
