import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormDatePicker } from './HookFormDatePicker';

type FormData = { birthDate: Date | null };

let api: ReturnType<typeof useForm<FormData>>;

function Harness() {
  api = useForm<FormData>({ defaultValues: { birthDate: null } });
  const { control } = api;
  return (
    <HookFormDatePicker<FormData>
      hookControl={control}
      hookName="birthDate"
      label="Birth Date"
    />
  );
}

describe('HookFormDatePicker', () => {
  it('sets date and toggles include time', () => {
    render(<Harness />);
    const date = screen.getByTestId('date-picker') as HTMLInputElement;
    fireEvent.change(date, { target: { value: '2020-01-02' } });
    const v = api.getValues('birthDate');
    expect(v instanceof Date).toBe(true);
    expect((v as Date).getFullYear()).toBe(2020);

    // Toggle include time
    const toggle = screen.getByLabelText('Include Time') as HTMLInputElement;
    fireEvent.click(toggle);
    expect(screen.getByTestId('datetime-picker')).toBeInTheDocument();
  });
});
