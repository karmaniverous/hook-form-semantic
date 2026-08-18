import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormDatePicker } from './HookFormDatePicker';

type FormData = { when: Date | null };

let api: ReturnType<typeof useForm<FormData>>;

function Harness({ showTime = false }: { showTime?: boolean }) {
  api = useForm<FormData>({ defaultValues: { when: null } });
  const { control } = api;
  return (
    <HookFormDatePicker<FormData>
      hookControl={control}
      hookName="when"
      label="When"
      showIncludeTime={showTime}
      utc
    />
  );
}

describe('HookFormDatePicker (utc=true)', () => {
  it('stores date-only selection as midnight UTC', () => {
    render(<Harness />);
    const date = screen.getByTestId('date-picker');
    fireEvent.change(date, { target: { value: '2025-01-02' } });
    const v = api.getValues('when');
    expect(v).toBeInstanceOf(Date);
    expect((v as Date).toISOString()).toBe('2025-01-02T00:00:00.000Z');
  });

  it('stores datetime selection as the same wall time in UTC', () => {
    render(<Harness showTime />);
    // Toggle include time
    const toggle = screen.getByLabelText('Include Time');
    fireEvent.click(toggle);
    const dt = screen.getByTestId('datetime-picker');
    fireEvent.change(dt, { target: { value: '2025-01-02T09:30' } });
    const v = api.getValues('when');
    expect(v).toBeInstanceOf(Date);
    expect(
      (v as Date).toISOString().startsWith('2025-01-02T09:30:00.000Z'),
    ).toBe(true);
  });
});
