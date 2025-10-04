import DateRangePicker, {
  type DateRangePickerProps,
} from '@wojtekmaj/react-daterange-picker';
import DateTimeRangePicker, {
  type DateTimeRangePickerProps,
} from '@wojtekmaj/react-datetimerange-picker';
import { omit } from 'radash';
import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { FieldPath } from 'react-hook-form';
import { type FieldValues } from 'react-hook-form';
import type { DropdownProps } from 'semantic-ui-react';
import {
  Checkbox,
  Dropdown,
  Form,
  type FormFieldProps,
} from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';
import { concatClassNames } from '@/utils/concatClassNames';
import { isFn } from '@/utils/isFn';

import type { DateRange } from './DateRange';
import type { Presets } from './presets';

const eqDate = (a: Date | null | undefined, b: Date | null | undefined) =>
  (a == null && b == null) || (!!a && !!b && a.getTime() === b.getTime());

const eqRange = (
  a?: [Date | null, Date | null],
  b?: [Date | null, Date | null],
) => !!a && !!b && eqDate(a[0], b[0]) && eqDate(a[1], b[1]);

export interface HookFormDateRangePickerProps<
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
    PrefixProps<Omit<DateRangePickerProps, 'value'>, 'datePicker'>,
    PrefixProps<Omit<DateTimeRangePickerProps, 'value'>, 'timePicker'> {
  presets?: Presets;
  showIncludeTime?: boolean;
}

export const HookFormDateRangePicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  presets,
  ...props
}: HookFormDateRangePickerProps<TFieldValues, TName>) => {
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
  } = useHookForm({ props, prefixes: ['datePicker', 'timePicker'] as const });

  const [includeTime, setIncludeTime] = useState<boolean | undefined>(false);

  const handleChange = useCallback(
    (...[v]: Parameters<NonNullable<DateRangePickerProps['onChange']>>) => {
      // Call through to the widget's onChange (per selected mode)
      (includeTime ? onTimeChange : onDateChange)?.(v as DateRange);
      // Bridge to RHF
      hookFieldOnChange({
        target: { type: 'date', value: v as DateRange },
      } as unknown as React.SyntheticEvent<HTMLElement>);
    },
    [hookFieldOnChange, includeTime, onDateChange, onTimeChange],
  );

  const [preset, setPreset] = useState<string | false>(false);

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

      hookFieldOnChange({
        target: { type: 'date', value: resolvedValue as DateRange },
      } as unknown as React.SyntheticEvent<HTMLElement>);
    },
    [hookFieldOnChange, presets],
  );

  useEffect(() => {
    if (!presets) {
      setPreset(false);
      return;
    }
    const current = (value as DateRange | undefined) ?? undefined;
    const key =
      Object.keys(presets).find((k) => {
        const pv = presets[k]?.value;
        const resolved = isFn(pv) ? (pv as () => DateRange)() : pv;
        return eqRange(current, resolved as DateRange);
      }) ?? false;
    setPreset(key);
  }, [value, presets]);

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

          {showIncludeTime && (
            <Checkbox
              checked={includeTime}
              label="Include Time"
              onChange={(event, data) => setIncludeTime(data.checked)}
            />
          )}
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
            {...{
              ...omit(hookFieldProps, ['ref']),
              // Normalize value to DateRange
              value: ((value as DateRange) ?? [null, null]) as DateRange,
            }}
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
            {...{
              ...omit(hookFieldProps, ['ref']),
              value: ((value as DateRange) ?? [null, null]) as DateRange,
            }}
          />
        )}
      </div>
    </Form.Field>
  );
};
