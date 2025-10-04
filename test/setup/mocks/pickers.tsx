import React from 'react';
import { vi } from 'vitest';

// Date picker
vi.mock('react-date-picker', () => {
  const isoDate = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
  interface DatePickerMockProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    onChange?: (value: Date | null) => void;
    value?: Date | string | null | undefined;
  }
  const Comp: React.FC<DatePickerMockProps> = (props) => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      onChange,
      value: rawValue,
      dayPlaceholder: _dayPlaceholder,
      monthPlaceholder: _monthPlaceholder,
      yearPlaceholder: _yearPlaceholder,
      showLeadingZeros: _showLeadingZeros,
      calendarProps: _calendarProps,
      ...rest
    } = props as DatePickerMockProps & Record<string, unknown>;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    const value =
      rawValue instanceof Date
        ? isoDate(rawValue)
        : rawValue == null
          ? ''
          : String(rawValue);
    return React.createElement('input', {
      ...rest,
      'data-testid': 'date-picker',
      type: 'date',
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange?.(
          e.currentTarget.value ? new Date(e.currentTarget.value) : null,
        ),
    });
  };
  return { __esModule: true, default: Comp };
});

// DateTime picker
vi.mock('react-datetime-picker', () => {
  const isoLocalMinute = (d: Date) => d.toISOString().slice(0, 16);
  interface DateTimePickerMockProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    onChange?: (value: Date | null) => void;
    value?: Date | string | null | undefined;
  }
  const Comp: React.FC<DateTimePickerMockProps> = (props) => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      onChange,
      value: rawValue,
      dayPlaceholder: _dayPlaceholder,
      disableClock: _disableClock,
      hourPlaceholder: _hourPlaceholder,
      maxDetail: _maxDetail,
      minutePlaceholder: _minutePlaceholder,
      monthPlaceholder: _monthPlaceholder,
      secondPlaceholder: _secondPlaceholder,
      showLeadingZeros: _showLeadingZeros,
      yearPlaceholder: _yearPlaceholder,
      calendarProps: _calendarProps,
      ...rest
    } = props as DateTimePickerMockProps & Record<string, unknown>;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    const value =
      rawValue instanceof Date
        ? isoLocalMinute(rawValue)
        : rawValue == null
          ? ''
          : String(rawValue);
    return React.createElement('input', {
      ...rest,
      'data-testid': 'datetime-picker',
      type: 'datetime-local',
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange?.(
          e.currentTarget.value ? new Date(e.currentTarget.value) : null,
        ),
    });
  };
  return { __esModule: true, default: Comp };
});

// Date range pickers
vi.mock('@wojtekmaj/react-daterange-picker', () => {
  type Props = {
    onChange?: (value: [Date | null, Date | null]) => void;
  };
  const Comp: React.FC<Props> = ({ onChange }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'daterange-picker',
      } as React.HTMLAttributes<HTMLDivElement>,
      React.createElement('input', {
        'data-testid': 'daterange-start',
        type: 'date',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.([
            e.currentTarget.value ? new Date(e.currentTarget.value) : null,
            null,
          ]),
      } as React.InputHTMLAttributes<HTMLInputElement>),
      React.createElement('input', {
        'data-testid': 'daterange-end',
        type: 'date',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.([
            null,
            e.currentTarget.value ? new Date(e.currentTarget.value) : null,
          ]),
      } as React.InputHTMLAttributes<HTMLInputElement>),
    );
  return { __esModule: true, default: Comp };
});

vi.mock('@wojtekmaj/react-datetimerange-picker', () => {
  type Props = {
    onChange?: (value: [Date | null, Date | null]) => void;
  };
  const Comp: React.FC<Props> = ({ onChange }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'datetimerange-picker',
      } as React.HTMLAttributes<HTMLDivElement>,
      React.createElement('input', {
        'data-testid': 'datetimerange-start',
        type: 'datetime-local',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.([
            e.currentTarget.value ? new Date(e.currentTarget.value) : null,
            null,
          ]),
      } as React.InputHTMLAttributes<HTMLInputElement>),
      React.createElement('input', {
        'data-testid': 'datetimerange-end',
        type: 'datetime-local',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.([
            null,
            e.currentTarget.value ? new Date(e.currentTarget.value) : null,
          ]),
      } as React.InputHTMLAttributes<HTMLInputElement>),
    );
  return { __esModule: true, default: Comp };
});
