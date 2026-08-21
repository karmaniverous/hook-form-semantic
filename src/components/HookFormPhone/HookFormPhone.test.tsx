import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { defaultCountries, parseCountry } from 'react-international-phone';

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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.placeholder).toContain('+1');
    fireEvent.change(input, { target: { value: '+12025550123' } });
    await waitFor(() => expect(api.getValues('phone')).toBe('+12025550123'));
  });
});

function CountryHarness({
  countrySearch,
  single,
}: {
  countrySearch?: boolean;
  single?: boolean;
}) {
  api = useForm<FormData>({ defaultValues: { phone: '' } });
  const { control } = api;
  return (
    <HookFormPhone<FormData>
      countrySearch={countrySearch}
      hookControl={control}
      hookName="phone"
      label="Phone"
      phoneCountries={
        single
          ? defaultCountries.filter((c) => parseCountry(c).iso2 === 'us')
          : undefined
      }
      phoneDefaultCountry="us"
    />
  );
}

describe('HookFormPhone country selector', () => {
  it('renders a non-search dropdown by default', () => {
    render(<CountryHarness />);
    const dropdown = screen.getByTestId('dropdown');
    expect(dropdown.hasAttribute('data-search')).toBe(false);
  });

  it('enables typeahead when countrySearch is set', () => {
    render(<CountryHarness countrySearch />);
    expect(screen.getByTestId('dropdown').getAttribute('data-search')).toBe(
      'true',
    );
  });

  it('disables the selector when only one country is allowed', () => {
    render(<CountryHarness single />);
    expect(screen.getByTestId('dropdown')).toBeDisabled();
  });

  it('keeps the selector enabled with multiple countries', () => {
    render(<CountryHarness />);
    expect(screen.getByTestId('dropdown')).toBeEnabled();
  });
});
