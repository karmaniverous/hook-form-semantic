import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormDateRangePicker } from './HookFormDateRangePicker';

type FormData = { range: [Date | null, Date | null] };

const presets = {
  today: {
    text: 'Today',
    value: [new Date('2020-01-01'), new Date('2020-01-02')] as [Date, Date],
    epoch: 'present' as const,
  },
};

let api: ReturnType<typeof useForm<FormData>>;

function Harness() {
  api = useForm<FormData>({ defaultValues: { range: [null, null] } });
  const { control } = api;
  return (
    <HookFormDateRangePicker<FormData>
      hookControl={control}
      hookName="range"
      label="Range"
      presets={presets}
    />
  );
}

describe('HookFormDateRangePicker', () => {
  it('sets start/end and applies preset', () => {
    render(<Harness />);
    const start = screen.getByTestId('daterange-start') as HTMLInputElement;
    const end = screen.getByTestId('daterange-end') as HTMLInputElement;
    fireEvent.change(start, { target: { value: '2020-01-03' } });
    let v = api.getValues('range');
    expect(v[0]?.getDate()).toBe(3);
    expect(v[1]).toBeNull();
    fireEvent.change(end, { target: { value: '2020-01-05' } });
    v = api.getValues('range');
    expect(v[1]?.getDate()).toBe(5);

    // Apply preset via dropdown select
    const dropdown = screen.getByTestId('dropdown') as HTMLSelectElement;
    fireEvent.change(dropdown, { target: { value: 'today' } });
    v = api.getValues('range');
    expect(v[0]?.getFullYear()).toBe(2020);
    expect(v[1]?.getFullYear()).toBe(2020);
  });
});
