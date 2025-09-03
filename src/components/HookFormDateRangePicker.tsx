import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import '@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

import DateRangePicker, {
  type DateRangePickerProps,
} from '@wojtekmaj/react-daterange-picker';
import DateTimeRangePicker, {
  type DateTimeRangePickerProps,
} from '@wojtekmaj/react-datetimerange-picker';
import _ from 'lodash';
import React, {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type ControllerProps,
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import type { DropdownProps } from 'semantic-ui-react';
import {
  Checkbox,
  Dropdown,
  Form,
  type FormFieldProps,
} from 'semantic-ui-react';

import { concatClassNames } from '../../lib/utils/concatClassNames';
import { offsetTruncatedDate } from '../../lib/utils/offsetTruncatedDate';
import {
  deprefix,
  type PrefixedPartial,
} from '../../lib/utils/PrefixedPartial';

export type DateRange = [Date | null, Date | null];

export const extractTimestamps = (dateRange: DateRange) =>
  dateRange
    ? dateRange.map((d) => (d ? d.getTime() : undefined))
    : [undefined, undefined];

type Presets = Record<
  string,
  {
    text: string;
    value: DateRange | (() => DateRange);
    epoch: 'past' | 'present' | 'future';
  }
>;

export const defaultPresets: Presets = {
  today: {
    text: 'Today',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'day' }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: 1,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'present',
  },
  yesterday: {
    text: 'Yesterday',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'day', offsetDays: -1 }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'past',
  },
  tomorrow: {
    text: 'Tomorrow',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'day', offsetDays: 1 }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: 2,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'future',
  },
  thisWeek: {
    text: 'This Week',
    value: () => [
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: -new Date().getDay(),
      }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: 7 - new Date().getDay(),
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'present',
  },
  lastWeek: {
    text: 'Last Week',
    value: () => [
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: -new Date().getDay() - 7,
      }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: -new Date().getDay(),
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'past',
  },
  nextWeek: {
    text: 'Next Week',
    value: () => [
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: 7 - new Date().getDay(),
      }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: 14 - new Date().getDay(),
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'future',
  },
  thisMonth: {
    text: 'This Month',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'month' }),
      offsetTruncatedDate({
        truncateAt: 'month',
        offsetMonths: 1,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'present',
  },
  lastMonth: {
    text: 'Last Month',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'month', offsetMonths: -1 }),
      offsetTruncatedDate({
        truncateAt: 'month',
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'past',
  },
  nextMonth: {
    text: 'Next Month',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'month', offsetMonths: 1 }),
      offsetTruncatedDate({
        truncateAt: 'month',
        offsetMonths: 2,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'future',
  },
  thisYear: {
    text: 'This Year',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'year' }),
      offsetTruncatedDate({
        truncateAt: 'year',
        offsetYears: 1,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'present',
  },
  lastYear: {
    text: 'Last Year',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'year', offsetYears: -1 }),
      offsetTruncatedDate({
        truncateAt: 'year',
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'past',
  },
  nextYear: {
    text: 'Next Year',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'year', offsetYears: 1 }),
      offsetTruncatedDate({
        truncateAt: 'year',
        offsetYears: 2,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'future',
  },
};

export const filterPresets = (
  epochs: Presets[string]['epoch'][],
  presets: Presets = defaultPresets,
) => _.pickBy(presets, ({ epoch }) => epochs.includes(epoch));

export interface HookFormDateRangePickerProps<T extends FieldValues>
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
    PrefixedPartial<DateRangePickerProps, 'datePicker'>,
    PrefixedPartial<DateTimeRangePickerProps, 'timePicker'> {
  presets?: Presets;
}

export const HookFormDateRangePicker = <T extends FieldValues>({
  presets,
  ...props
}: HookFormDateRangePickerProps<T>) => {
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

  const [preset, setPreset] = useState<string | false>(false);

  const handleChange = useCallback(
    (...[value]: Parameters<NonNullable<DateRangePickerProps['onChange']>>) => {
      (includeTime ? onTimeChange : onDateChange)?.(value);

      hookFieldOnChange({ target: { type: 'date', value } });
    },
    [hookFieldOnChange, includeTime, onDateChange, onTimeChange],
  );

  const presetOptions = useMemo(
    () => _.map(presets, ({ text }, value) => ({ text, value })),
    [presets],
  );

  const handlePreset = useCallback(
    (event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
      setPreset(data.value as string);

      if (!presets) return;

      const { value } = presets[data.value as string] ?? {};

      hookFieldOnChange({
        target: {
          type: 'date',
          value: value ? (_.isFunction(value) ? value() : value) : [null, null],
        },
      });
    },
    [hookFieldOnChange, presets],
  );

  useEffect(() => {
    setPreset(
      presets
        ? (_.findKey(presets, ({ value }) =>
            _.isEqual(
              hookFieldProps.value,
              _.isFunction(value) ? value() : value,
            ),
          ) ?? false)
        : false,
    );
  }, [hookFieldProps.value, presets]);

  return (
    <Form.Field
      {...fieldProps}
      // TECHDEBT: unsafe assignment
      // eslint-disable-next-line
      className={concatClassNames(className, 'hook-form-date-range-picker')}
      error={error?.message}
    >
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label>{label}</label>

          {presets && (
            <Dropdown
              basic
              onChange={handlePreset}
              options={presetOptions}
              placeholder="Choose Preset"
              search
              value={preset}
            />
          )}

          <Checkbox
            checked={includeTime}
            label="Include Time"
            onChange={(event, data) => setIncludeTime(data.checked)}
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
            onChange={handleChange}
            rangeDivider={<>&nbsp;to&nbsp;</>}
            secondPlaceholder="ss"
            showLeadingZeros
            yearPlaceholder="yyyy"
            {...timePickerProps}
            {..._.omit(hookFieldProps, ['onBlur', 'ref'])}
          />
        ) : (
          <DateRangePicker
            dayPlaceholder="dd"
            monthPlaceholder="mm"
            onChange={handleChange}
            rangeDivider={<>&nbsp;to&nbsp;</>}
            showLeadingZeros
            yearPlaceholder="yyyy"
            {...datePickerProps}
            {..._.omit(hookFieldProps, ['onBlur', 'ref'])}
          />
        )}
      </div>
    </Form.Field>
  );
};
