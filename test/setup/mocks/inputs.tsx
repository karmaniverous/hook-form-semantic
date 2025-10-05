import React from 'react';
import { vi } from 'vitest';

// Numeric format
vi.mock('react-number-format', () => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ValueChange {
    floatValue?: number;
  }
  interface Props
    extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'onChange' | 'type'
    > {
    onValueChange?: (v: ValueChange) => void;
    allowNegative?: boolean;
    decimalScale?: number;
    customInput?: React.ComponentType<
      React.InputHTMLAttributes<HTMLInputElement>
    >;
  }
  const NumericFormat: React.FC<Props> = ({
    onValueChange,
    allowNegative: _allowNegative,
    decimalScale: _decimalScale,
    customInput: _customInput,
    ...p
  }) =>
    React.createElement('input', {
      ...p,
      'data-testid': 'numeric-input',
      type: 'number',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.currentTarget.value;
        const num = v === '' ? undefined : Number(v);
        onValueChange?.({ floatValue: Number.isNaN(num) ? undefined : num });
      },
    });
  /* eslint-enable @typescript-eslint/no-unused-vars */
  return { NumericFormat };
});

// Phone input and responsive
vi.mock('react-international-phone', () => {
  const parseCountry = (iso2: string) => ({
    iso2,
    name: iso2 === 'ca' ? 'Canada' : 'United States',
    dialCode: '1',
  });
  const defaultCountries = ['us', 'ca'];
  const FlagImage: React.FC<{ iso2: string; size?: number }> = ({ iso2 }) =>
    React.createElement('span', { 'data-iso2': iso2 }, 'flag');
  const getActiveFormattingMask = () => '... ... ....';
  function usePhoneInput(config: {
    value?: string;
    onChange?: (v: {
      country: { iso2: string; name: string; dialCode: string };
      inputValue: string;
      phone: string;
    }) => void;
    defaultCountry?: string;
  }) {
    const [inputValue, setInputValue] = React.useState(config.value || '');
    const [country, setCountryState] = React.useState(
      parseCountry(config.defaultCountry ?? 'us'),
    );
    React.useEffect(() => {
      setInputValue(config.value || '');
    }, [config.value]);
    const phone = inputValue;
    const setCountry = (iso2: string) => {
      const c = parseCountry(iso2);
      setCountryState(c);
      config.onChange?.({ country: c, inputValue, phone });
    };
    const handlePhoneValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setInputValue(v);
      config.onChange?.({ country, inputValue: v, phone: v });
    };
    return { inputValue, phone, country, setCountry, handlePhoneValueChange };
  }
  return {
    defaultCountries,
    FlagImage,
    getActiveFormattingMask,
    parseCountry,
    usePhoneInput,
  };
});

let __mobile = false;
vi.mock('react-responsive', () => ({
  useMediaQuery: () => __mobile,
  __setIsMobile: (v: boolean) => {
    __mobile = v;
  },
}));
