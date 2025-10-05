import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormPhone } from './HookFormPhone';

type FormData = { phone: string };

let api: ReturnType<typeof useForm<FormData>>;

function Harness() {
  api = useForm<FormData>({ defaultValues: { phone: '' } });
  const { control } = api;
  return (
    <HookFormPhone<FormData>
      hookControl={control}
      hookName="phone"
      label="Phone"
      phoneDefaultCountry="us"
    />
  );
}

describe('HookFormPhone', () => {
  it('updates RHF value and renders placeholder mask', async () => {
    render(<Harness />);
    const input = screen.getByRole('textbox');
    expect(input.placeholder).toContain('+1');
    fireEvent.change(input, { target: { value: '+12025550123' } });
    await waitFor(() => expect(api.getValues('phone')).toBe('+12025550123'));
  });
});
