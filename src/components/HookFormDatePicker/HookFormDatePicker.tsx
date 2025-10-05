import { omit } from 'radash';
import { useCallback, useState } from 'react';
import DatePicker, { type DatePickerProps } from 'react-date-picker';
import DateTimePicker, {
  type DateTimePickerProps,
} from 'react-datetime-picker';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Checkbox, Form, type FormFieldProps } from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';
import { concatClassNames } from '@/utils/concatClassNames';

export interface HookFormDatePickerProps<
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
    PrefixProps<Omit<DatePickerProps, 'value'>, 'datePicker'>,
    PrefixProps<Omit<DateTimePickerProps, 'value'>, 'timePicker'> {
  showIncludeTime?: boolean;
}

export const HookFormDatePicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormDatePickerProps<TFieldValues, TName>,
) => {
  const {
    controller: {
      field: { onChange: hookFieldOnChange, value, ...hookFieldProps },
      fieldState: { error },
    },
    deprefixed: {
      datePicker: { onChange: onDateChange, ...datePickerProps },
      timePicker: { onChange: onTimeChange, ...timePickerProps },
    },
    rest: { className, label, showIncludeTime, ...fieldProps },
  } = useHookForm({
    props,
    prefixes: ['datePicker', 'timePicker'] as const,
  });

  const [includeTime, setIncludeTime] = useState<boolean | undefined>(false);

  const handleChange = useCallback(
    (...[v]: Parameters<NonNullable<DatePickerProps['onChange']>>) => {
      (includeTime ? onTimeChange : onDateChange)?.(v as Date | null);
      hookFieldOnChange({
        target: { type: 'date', value: v as Date | null },
      } as unknown as React.SyntheticEvent<HTMLElement>);
    },
    [hookFieldOnChange, includeTime, onDateChange, onTimeChange],
  );

  return (
    <Form.Field
      {...fieldProps}
      className={concatClassNames(
        className as string | undefined,
        'hook-form-date-picker',
      )}
      error={error?.message}
    >
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label>{label}</label>

          {showIncludeTime && (
            <Checkbox
              checked={includeTime}
              label="Include Time"
              onChange={(
                _e: React.FormEvent<HTMLInputElement>,
                data: { checked?: boolean },
              ) => {
                setIncludeTime(data.checked);
              }}
            />
          )}
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
            {...omit(hookFieldProps, ['ref'])}
            value={(value as Date | null) ?? null}
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
            {...omit(hookFieldProps, ['ref'])}
            value={(value as Date | null) ?? null}
          />
        )}
      </div>
    </Form.Field>
  );
};
