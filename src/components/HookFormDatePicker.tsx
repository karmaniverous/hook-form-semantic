import { omit } from 'lodash';
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

import { concatClassNames } from '../../lib/utils/concatClassNames';
import {
  deprefix,
  type PrefixedPartial,
} from '../../lib/utils/PrefixedPartial';

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
    PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'>,
    PrefixedPartial<DatePickerProps, 'datePicker'>,
    PrefixedPartial<DateTimePickerProps, 'timePicker'> {}

export const HookFormDatePicker = <T extends FieldValues>(
  props: HookFormDatePickerProps<T>,
) => {
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

  const {
    field: { onChange: hookFieldOnChange, ...hookFieldProps },
    fieldState: { error },
  } = useController(hookProps as UseControllerProps);

  const handleChange = useCallback(
    (...[value]: Parameters<NonNullable<DatePickerProps['onChange']>>) => {
      (includeTime ? onTimeChange : onDateChange)?.(value as Date | null);

      hookFieldOnChange({ target: { type: 'date', value } });
    },
    [hookFieldOnChange, includeTime, onDateChange, onTimeChange],
  );

  return (
    <Form.Field
      {...fieldProps}
      className={concatClassNames(className, 'hook-form-date-picker')}
      error={error?.message}
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
            {...omit(hookFieldProps, ['onBlur', 'ref'])}
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
            {...omit(hookFieldProps, ['onBlur', 'ref'])}
          />
        )}
      </div>
    </Form.Field>
  );
};
