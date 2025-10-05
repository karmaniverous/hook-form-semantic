import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormCheckbox } from './HookFormCheckbox';

type FormData = { enabled: boolean };

function Harness() {
  const { control, setError } = useForm<FormData>({
    defaultValues: { enabled: false },
  });
  return (
    <>
      <HookFormCheckbox<FormData>
        hookControl={control}
        hookName="enabled"
        label="Feature"
        uncheckLabel="Disable"
        checkLabel="Enable"
      />
      <button
        onClick={() =>
          setError('enabled', { type: 'manual', message: 'Must be checked' })
        }
      >
        cause-error
      </button>
    </>
  );
}

describe('HookFormCheckbox', () => {
  it('toggles value via control labels', () => {
    render(<Harness />);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.checked).toBe(false);
    fireEvent.click(screen.getByText('Enable'));
    expect(input.checked).toBe(true);
    fireEvent.click(screen.getByText('Disable'));
    expect(input.checked).toBe(false);
  });

  it('shows error message from RHF', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('cause-error'));
    const field = screen.getByTestId('form-field');
    expect(field).toHaveAttribute('data-error', 'Must be checked');
  });
});
