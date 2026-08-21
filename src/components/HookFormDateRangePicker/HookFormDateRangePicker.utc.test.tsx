import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormDateRangePicker } from './HookFormDateRangePicker';

type Range = [Date | null, Date | null];
type FormData = { range: Range };

let api: ReturnType<typeof useForm<FormData>>;

function Harness({
  showTime = false,
  withTimePreset = false,
}: {
  showTime?: boolean;
  withTimePreset?: boolean;
}) {
  api = useForm<FormData>({ defaultValues: { range: [null, null] } });
  const { control } = api;

  const presets = withTimePreset
    ? {
        timeRange: {
          text: 'Time Range',
          value: [
            new Date('2020-01-01T09:15'),
            new Date('2020-01-01T10:45'),
          ] as [Date, Date],
          epoch: 'present' as const,
        },
      }
    : undefined;

  return (
    <HookFormDateRangePicker<FormData>
      hookControl={control}
      hookName="range"
      label="Range"
      showIncludeTime={showTime}
      utc
      presets={presets}
    />
  );
}

describe('HookFormDateRangePicker (utc=true)', () => {
  it('stores date-only start/end as midnight UTC', () => {
    render(<Harness />);
    const start = screen.getByTestId('daterange-start');
    const end = screen.getByTestId('daterange-end');
    fireEvent.change(start, { target: { value: '2025-01-03' } });
    fireEvent.change(end, { target: { value: '2025-01-05' } });
    const v = api.getValues('range');
    expect(v[0]).toBeInstanceOf(Date);
    expect(v[1]).toBeInstanceOf(Date);
    expect((v[0] as Date).toISOString()).toBe('2025-01-03T00:00:00.000Z');
    expect((v[1] as Date).toISOString()).toBe('2025-01-05T00:00:00.000Z');
  });

  it('stores datetime start/end as the same wall time in UTC', () => {
    render(<Harness showTime />);
    // Toggle include time
    const toggle = screen.getByLabelText('Include Time');
    fireEvent.click(toggle);

    const start = screen.getByTestId('datetimerange-start');
    const end = screen.getByTestId('datetimerange-end');
    fireEvent.change(start, { target: { value: '2025-01-03T09:00' } });
    fireEvent.change(end, { target: { value: '2025-01-05T10:30' } });
    const v = api.getValues('range');
    expect(v[0]).toBeInstanceOf(Date);
    expect(v[1]).toBeInstanceOf(Date);
    expect(
      (v[0] as Date).toISOString().startsWith('2025-01-03T09:00:00.000Z'),
    ).toBe(true);
    expect(
      (v[1] as Date).toISOString().startsWith('2025-01-05T10:30:00.000Z'),
    ).toBe(true);
  });

  it('applies a time-based preset as UTC when include time is enabled', () => {
    render(<Harness showTime withTimePreset />);
    // Enable time mode first so preset with time maps as datetime UTC
    const toggle = screen.getByLabelText('Include Time');
    fireEvent.click(toggle);

    const presetDropdown = screen.getByTestId('dropdown');
    fireEvent.change(presetDropdown, { target: { value: 'timeRange' } });

    const v = api.getValues('range');
    expect(v[0]).toBeInstanceOf(Date);
    expect(v[1]).toBeInstanceOf(Date);
    expect(
      (v[0] as Date).toISOString().startsWith('2020-01-01T09:15:00.000Z'),
    ).toBe(true);
    expect(
      (v[1] as Date).toISOString().startsWith('2020-01-01T10:45:00.000Z'),
    ).toBe(true);
  });
});
