import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormNumeric } from './HookFormNumeric';

type FormData = { age: number | undefined };

let api: ReturnType<typeof useForm<FormData>>;

function Harness() {
  api = useForm<FormData>({ defaultValues: { age: undefined } });
  const { control } = api;
  return (
    <HookFormNumeric<FormData>
      hookControl={control}
      hookName="age"
      label="Age"
      numericAllowNegative={false}
      numericDecimalScale={0}
    />
  );
}

describe('HookFormNumeric', () => {
  it('updates RHF with numeric value', () => {
    render(<Harness />);
    const input = screen.getByTestId('numeric-input');
    fireEvent.change(input, { target: { value: '42' } });
    expect(api.getValues('age')).toBe(42);
  });
});
