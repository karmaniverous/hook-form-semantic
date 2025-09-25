import DateRangePicker, {
  type DateRangePickerProps,
} from '@wojtekmaj/react-daterange-picker';
import DateTimeRangePicker, {
  type DateTimeRangePickerProps,
} from '@wojtekmaj/react-datetimerange-picker';
import {
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

export type Presets = Record<
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
) =>
  Object.fromEntries(
    Object.entries(presets).filter(([, v]) => epochs.includes(v.epoch)),
  ) as Presets;

const isFn = (v: unknown): v is (...args: never[]) => unknown =>
  typeof v === 'function';

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
    Partial<PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'>>,
    PrefixedPartial<DateRangePickerProps, 'datePicker'>,
    PrefixedPartial<DateTimeRangePickerProps, 'timePicker'> {
  presets?: Presets;
  standalone?: boolean;
  value?: DateRange;
  onChange?: (value: DateRange) => void;
}

const eqDate = (a: Date | null | undefined, b: Date | null | undefined) =>
  (a == null && b == null) || (!!a && !!b && a.getTime() === b.getTime());
const eqRange = (
  a?: [Date | null, Date | null],
  b?: [Date | null, Date | null],
) => !!a && !!b && eqDate(a[0], b[0]) && eqDate(a[1], b[1]);

export const HookFormDateRangePicker = <T extends FieldValues>({
  standalone = false,
  value: standaloneValue,
  onChange: standaloneOnChange,
  presets,
  ...props
}: HookFormDateRangePickerProps<T>) => {
  const {
    hook: hookProps,
    datePicker: { onChange: onDateChange, ...datePickerProps },
    timePicker: { onChange: onTimeChange, ...timePickerProps },
    rest: { className, label, error: standaloneError, ...fieldProps },
  } = useMemo(
    () => deprefix(props, ['hook', 'datePicker', 'timePicker']),
    [props],
  );

  const [includeTime, setIncludeTime] = useState<boolean | undefined>(false);

  const controllerResult = standalone
    ? undefined
    : useController(hookProps as UseControllerProps);

  const hookFieldOnChange = standalone
    ? undefined
    : controllerResult?.field?.onChange;

  const hookFieldProps = standalone
    ? { value: standaloneValue }
    : controllerResult?.field;

  const error = standalone
    ? standaloneError
      ? { message: standaloneError }
      : undefined
    : controllerResult?.fieldState?.error;

  const [preset, setPreset] = useState<string | false>(false);

  const handleChange = useCallback(
    (...[value]: Parameters<NonNullable<DateRangePickerProps['onChange']>>) => {
      (includeTime ? onTimeChange : onDateChange)?.(value);

      if (standalone) {
        standaloneOnChange?.(value as DateRange);
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

  const presetOptions = useMemo(
    () =>
      Object.entries(presets ?? {}).map(([value, { text }]) => ({
        text,
        value,
      })),
    [presets],
  );

  const handlePreset = useCallback(
    (event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
      setPreset(data.value as string);

      if (!presets) return;

      const { value } = presets[data.value as string] ?? {};
      const resolvedValue = value
        ? isFn(value)
          ? value()
          : value
        : [null, null];

      if (standalone) {
        standaloneOnChange?.(resolvedValue as DateRange);
      } else {
        hookFieldOnChange?.({
          target: {
            type: 'date',
            value: resolvedValue,
          },
        });
      }
    },
    [hookFieldOnChange, presets, standalone, standaloneOnChange],
  );

  useEffect(() => {
    if (!presets) {
      setPreset(false);
      return;
    }
    const current = hookFieldProps?.value as DateRange | undefined;
    const key =
      Object.keys(presets).find((k) => {
        const pv = presets[k]?.value;
        const resolved = isFn(pv) ? (pv as () => DateRange)() : pv;
        return eqRange(current, resolved as DateRange);
      }) ?? false;
    setPreset(key);
  }, [hookFieldProps?.value, presets]);

  return (
    <Form.Field
      {...fieldProps}
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
            calendarProps={{
              showNeighboringMonth: false,
              showNavigation: true,
              returnValue: 'range',
            }}
            {...timePickerProps}
            {...(hookFieldProps && !standalone
              ? {
                  value: hookFieldProps.value,
                  name:
                    'name' in hookFieldProps ? hookFieldProps.name : undefined,
                  disabled:
                    'disabled' in hookFieldProps
                      ? hookFieldProps.disabled
                      : undefined,
                }
              : { value: standaloneValue })}
          />
        ) : (
          <DateRangePicker
            dayPlaceholder="dd"
            monthPlaceholder="mm"
            onChange={handleChange}
            rangeDivider={<>&nbsp;to&nbsp;</>}
            showLeadingZeros
            yearPlaceholder="yyyy"
            calendarProps={{
              showNeighboringMonth: false,
              showNavigation: true,
              returnValue: 'range',
            }}
            {...datePickerProps}
            {...(hookFieldProps && !standalone
              ? {
                  value: hookFieldProps.value,
                  name:
                    'name' in hookFieldProps ? hookFieldProps.name : undefined,
                  disabled:
                    'disabled' in hookFieldProps
                      ? hookFieldProps.disabled
                      : undefined,
                }
              : { value: standaloneValue })}
          />
        )}
      </div>
    </Form.Field>
  );
};
