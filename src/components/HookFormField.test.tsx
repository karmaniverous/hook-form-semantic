import { fireEvent, render, screen } from '@testing-library/react';
import {
  type ControllerRenderProps,
  type Path,
  useForm,
} from 'react-hook-form';

import { HookFormField } from './HookFormField';

type FormData = { name: string; subscribed: boolean };

let api: ReturnType<typeof useForm<FormData>>;

function Harness() {
  api = useForm<FormData>({
    defaultValues: { name: '', subscribed: false },
  });
  const { control, setError } = api;

  return (
    <>
      <HookFormField<FormData, { value: string }>
        hookControl={control}
        hookName="name"
        label="Name"
      >
        {(field) => <input aria-label="name-input" {...field} />}
      </HookFormField>

      <HookFormField<FormData, { checked: boolean }>
        hookControl={control}
        hookName="subscribed"
        label="Subscribed"
      >
        {(field) => {
          const f = field as ControllerRenderProps<FormData, Path<FormData>> & {
            checked?: boolean;
          };
          return (
            <input
              aria-label="subscribed-input"
              type="checkbox"
              checked={!!f.checked}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                f.onChange(e, {
                  checked: e.currentTarget.checked,
                })
              }
            />
          );
        }}
      </HookFormField>

      <button
        onClick={() =>
          setError('name', { type: 'manual', message: 'Required' })
        }
      >
        cause-error
      </button>
    </>
  );
}

describe('HookFormField', () => {
  it('maps string value via function child', () => {
    render(<Harness />);
    const input = screen.getByLabelText('name-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(api.getValues('name')).toBe('Alice');
  });

  it('maps boolean checked via function child', () => {
    render(<Harness />);
    const checkbox = screen.getByLabelText(
      'subscribed-input',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it('propagates error message to Form.Field', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('cause-error'));
    const field = screen.getAllByTestId('form-field')[0];
    expect(field).toHaveAttribute('data-error', 'Required');
  });
});
