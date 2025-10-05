import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { HookFormSort } from './HookFormSort';

type SortValue = [string | 'auto', boolean] | undefined;
type FormData = { sort: SortValue };
let api: ReturnType<typeof useForm<FormData>>;

function Harness() {
  api = useForm<FormData>({ defaultValues: { sort: ['name', true] } });
  const { control } = api;
  return (
    <HookFormSort<FormData>
      hookControl={control}
      hookName="sort"
      label="Sort"
      dropdownOptions={[
        { value: 'name', text: 'Name' },
        { value: 'date', text: 'Date' },
      ]}
    />
  );
}

describe('HookFormSort', () => {
  it('changes field and toggles direction', () => {
    render(<Harness />);
    const select = screen.getByTestId('dropdown');
    fireEvent.change(select, { target: { value: 'date' } });
    expect(api.getValues('sort')?.[0]).toBe('date');

    const button = screen.getByRole('button');
    const before = api.getValues('sort')?.[1];
    fireEvent.click(button);
    expect(api.getValues('sort')?.[1]).toBe(!before);
  });
});
