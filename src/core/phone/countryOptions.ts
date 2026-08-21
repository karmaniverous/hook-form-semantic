import {
  type CountryData,
  type CountryIso2,
  defaultCountries,
  parseCountry,
} from 'react-international-phone';

export interface PhoneCountryOption {
  dialCode: string;
  iso2: CountryIso2;
  /** Display text, e.g. `United States (+1)`. */
  label: string;
  name: string;
}

/**
 * Country data for a phone country selector, independent of any component
 * library. Renderers attach their own flag imagery and option shape.
 */
export const getPhoneCountryOptions = (
  countries?: CountryData[],
): PhoneCountryOption[] =>
  (countries ?? defaultCountries).map((country) => {
    const { dialCode, iso2, name } = parseCountry(country);

    return { dialCode, iso2, label: `${name} (+${dialCode})`, name };
  });
