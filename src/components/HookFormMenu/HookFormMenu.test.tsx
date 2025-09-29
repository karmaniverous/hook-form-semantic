import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormMenu } from './HookFormMenu';

type FormData = { color: string };
let api: ReturnType<typeof useForm<FormData>>;

function Harness() {
  api = useForm<FormData>({ defaultValues: { color: '' } });
  const { control } = api;
  return (
    <HookFormMenu<FormData>
      hookControl={control}
      hookName="color"
      label="Color"
      menuItems={[
        { name: 'red', content: 'Red' },
        { name: 'blue', content: 'Blue' },
      ]}
    />
  );
}

describe('HookFormMenu', () => {
  it('selects menu item and updates RHF', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Blue'));
    expect(api.getValues('color')).toBe('blue');
  });
});
