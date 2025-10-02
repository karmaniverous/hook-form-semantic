import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
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
    // The editor component is lazy-loaded; wait for the Suspense fallback to disappear.
    await waitForElementToBeRemoved(
      () => screen.queryByText('Loading editor...'),
      {
        timeout: 5000,
      },
    );
    const editor = await screen.findByTestId('rdw-editor', { timeout: 5000 });
    fireEvent.click(editor);
    await waitFor(() => expect(api.getValues('desc')).toBe('<p>converted</p>'));
  });
});
