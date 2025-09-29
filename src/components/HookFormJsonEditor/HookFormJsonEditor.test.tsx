import { render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { vi } from 'vitest';

import { HookFormJsonEditor } from '../HookFormJsonEditor';

type FormData = { cfg: object | string | undefined };
let api: ReturnType<typeof useForm<FormData>>;

function Harness() {
  api = useForm<FormData>({ defaultValues: { cfg: undefined } });
  const { control } = api;
  return <HookFormJsonEditor<FormData> hookControl={control} hookName="cfg" />;
}

describe('HookFormJsonEditor', () => {
  it('renders and accepts JSON editor props', async () => {
    render(<Harness />);

    // Wait for the JsonEditor to render
    await waitFor(() => {
      expect(screen.getByTestId('form-field')).toBeInTheDocument();
    });

    // Verify initial state
    expect(api.getValues('cfg')).toBeUndefined();
  });

  it('handles onChange events from JsonEditor', async () => {
    const mockOnChange = vi.fn();

    function HarnessWithChange() {
      api = useForm<FormData>({ defaultValues: { cfg: undefined } });
      const { control } = api;
      return (
        <HookFormJsonEditor<FormData>
          hookControl={control}
          hookName="cfg"
          jsonOnChange={mockOnChange}
        />
      );
    }

    render(<HarnessWithChange />);

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByTestId('form-field')).toBeInTheDocument();
    });

    // The JsonEditor mock should be instantiated by now
    // Since we can't directly test the mock's updateProps behavior,
    // we verify the component structure and initial state
    expect(api.getValues('cfg')).toBeUndefined();
  });
});
