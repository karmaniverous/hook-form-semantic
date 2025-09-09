import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormMenuDisplayMode } from './HookFormMenuDisplayMode';

type FormData = { mode: 'card' | 'table' | 'wizard' | '' };
let api: ReturnType<typeof useForm<FormData>>;

function Harness() {
  api = useForm<FormData>({ defaultValues: { mode: '' } });
  const { control } = api;
  return (
    <HookFormMenuDisplayMode<FormData> hookControl={control} hookName="mode" />
  );
}

describe('HookFormMenuDisplayMode', () => {
  it('selects display mode', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Table'));
    expect(api.getValues('mode')).toBe('table');
  });
});
