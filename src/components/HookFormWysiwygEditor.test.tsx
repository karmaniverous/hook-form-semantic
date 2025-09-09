import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormWysiwygEditor } from './HookFormWysiwygEditor';

type FormData = { desc: string | null };
let api: ReturnType<typeof useForm<FormData>>;

function Harness() {
  api = useForm<FormData>({ defaultValues: { desc: null } });
  const { control } = api;
  return (
    <HookFormWysiwygEditor<FormData> hookControl={control} hookName="desc" />
  );
}

describe('HookFormWysiwygEditor', () => {
  it('updates value on editor interaction', async () => {
    render(<Harness />);
    const editor = await screen.findByTestId('rdw-editor');
    fireEvent.click(editor);
    await waitFor(() => expect(api.getValues('desc')).toBe('<p>converted</p>'));
  });
});
