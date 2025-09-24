import DateRangePicker, {
  type DateRangePickerProps,
} from '@wojtekmaj/react-daterange-picker';
import DateTimeRangePicker, {
  type DateTimeRangePickerProps,
} from '@wojtekmaj/react-datetimerange-picker';
import { useCallback, useState } from 'react';
import { Checkbox, Form, type FormFieldProps } from 'semantic-ui-react';

import { concatClassNames } from '../../lib/utils/concatClassNames';

export type DateRange = [Date | null, Date | null];

export interface DateRangePickerComponentProps
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
  > {
  value?: DateRange;
  onChange?: (value: DateRange) => void;
  datePickerProps?: Omit<DateRangePickerProps, 'onChange' | 'value'>;
  timePickerProps?: Omit<DateTimeRangePickerProps, 'onChange' | 'value'>;
  error?: string;
}

export const DateRangePickerComponent = ({
  value,
  onChange,
  datePickerProps,
  timePickerProps,
  className,
  label,
  error,
  ...fieldProps
}: DateRangePickerComponentProps) => {
  const [includeTime, setIncludeTime] = useState<boolean>(false);

  const handleChange = useCallback(
    (newValue: Date | Date[] | null) => {
      // Handle the Value type from date range picker which can be:
      // - null
      // - [Date | null, Date | null] (array of two dates)
      // - Date (single date, but we expect range)
      let dateRange: DateRange;

      if (!newValue) {
        dateRange = [null, null];
      } else if (Array.isArray(newValue)) {
        dateRange = newValue as DateRange;
      } else {
        // If it's a single Date, treat it as start date only
        dateRange = [newValue as Date, null];
      }

      onChange?.(dateRange);
    },
    [onChange],
  );

  // Type-safe wrapper for DateTimeRangePicker onChange
  const handleDateTimeChange = useCallback(
    (
      value: Parameters<NonNullable<DateTimeRangePickerProps['onChange']>>[0],
    ) => {
      handleChange(value as Date | Date[] | null);
    },
    [handleChange],
  );

  // Type-safe wrapper for DateRangePicker onChange
  const handleDateChange = useCallback(
    (value: Parameters<NonNullable<DateRangePickerProps['onChange']>>[0]) => {
      handleChange(value as Date | Date[] | null);
    },
    [handleChange],
  );

  return (
    <Form.Field
      {...fieldProps}
      className={concatClassNames(className, 'hook-form-date-range-picker')}
      error={error}
    >
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label>{label}</label>

          <Checkbox
            checked={includeTime}
            label="Include Time"
            onChange={(event, data) => setIncludeTime(data.checked || false)}
          />
        </div>
      )}

      <div className="input">
        {includeTime ? (
          <DateTimeRangePicker
            dayPlaceholder="dd"
            disableClock
            hourPlaceholder="hh"
            maxDetail="minute"
            minutePlaceholder="mm"
            monthPlaceholder="mm"
            onChange={handleDateTimeChange}
            rangeDivider={<>&nbsp;to&nbsp;</>}
            secondPlaceholder="ss"
            showLeadingZeros
            yearPlaceholder="yyyy"
            value={value}
            calendarProps={{
              showNeighboringMonth: false,
              showNavigation: true,
              returnValue: 'range',
            }}
            {...timePickerProps}
          />
        ) : (
          <DateRangePicker
            dayPlaceholder="dd"
            monthPlaceholder="mm"
            onChange={handleDateChange}
            rangeDivider={<>&nbsp;to&nbsp;</>}
            showLeadingZeros
            yearPlaceholder="yyyy"
            value={value}
            calendarProps={{
              showNeighboringMonth: false,
              showNavigation: true,
              returnValue: 'range',
            }}
            {...datePickerProps}
          />
        )}
      </div>
    </Form.Field>
  );
};
