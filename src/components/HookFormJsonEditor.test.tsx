import { render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormJsonEditor } from './HookFormJsonEditor';

type FormData = { cfg: { json: { from: string } } | undefined };
let api: ReturnType<typeof useForm<FormData>>;

function Harness() {
  api = useForm<FormData>({ defaultValues: { cfg: undefined } });
  const { control } = api;
  return <HookFormJsonEditor<FormData> hookControl={control} hookName="cfg" />;
}

describe('HookFormJsonEditor', () => {
  it('receives content changes from editor', async () => {
    render(<Harness />);
    // JsonEditor mock triggers onChange via updateProps call
    await waitFor(() =>
      expect(api.getValues('cfg')).toEqual({ json: { from: 'editor' } }),
    );
    // Ensure field container exists
    expect(screen.getByTestId('form-field')).toBeInTheDocument();
  });
});
