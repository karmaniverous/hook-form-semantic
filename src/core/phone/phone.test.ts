import { defaultCountries, parseCountry } from 'react-international-phone';
import { describe, expect, it } from 'vitest';

import { getPhoneCountryOptions } from './countryOptions';
import {
  buildPhonePlaceholder,
  normalizePhoneFormattingChars,
} from './phoneFormat';
import { makePhoneValidate } from './phoneValidate';

const us = parseCountry(
  defaultCountries.find((c) => parseCountry(c).iso2 === 'us')!,
);

describe('normalizePhoneFormattingChars', () => {
  it('applies the library defaults', () => {
    expect(normalizePhoneFormattingChars({})).toEqual({
      charAfterDialCode: ' ',
      placeholderNumberChar: '.',
      prefix: '+',
    });
  });

  it('truncates configured values to one character', () => {
    expect(
      normalizePhoneFormattingChars({
        charAfterDialCode: '--',
        placeholderNumberChar: '##',
        prefix: '00',
      }),
    ).toEqual({
      charAfterDialCode: '-',
      placeholderNumberChar: '#',
      prefix: '0',
    });
  });

  it('falls back on empty strings', () => {
    expect(normalizePhoneFormattingChars({ prefix: '' }).prefix).toBe('+');
  });
});

describe('buildPhonePlaceholder', () => {
  const chars = normalizePhoneFormattingChars({});

  it('prepends prefix, dial code and separator to the mask', () => {
    const placeholder = buildPhonePlaceholder({
      chars,
      country: us,
      phone: '+1',
    });
    expect(placeholder.startsWith('+1 ')).toBe(true);
    expect(placeholder).toContain('.');
  });

  it('omits the dial code when disabled', () => {
    const placeholder = buildPhonePlaceholder({
      chars,
      country: us,
      disableDialCodeAndPrefix: true,
      phone: '+1',
    });
    expect(placeholder.startsWith('+1 ')).toBe(false);
  });

  it('substitutes the placeholder character into the mask', () => {
    const placeholder = buildPhonePlaceholder({
      chars: normalizePhoneFormattingChars({ placeholderNumberChar: '#' }),
      country: us,
      phone: '+1',
    });
    expect(placeholder).toContain('#');
    expect(placeholder).not.toContain('.');
  });
});

describe('getPhoneCountryOptions', () => {
  it('returns plain data for the default country list', () => {
    const options = getPhoneCountryOptions();
    expect(options.length).toBe(defaultCountries.length);

    const usOption = options.find((o) => o.iso2 === 'us');
    expect(usOption).toEqual({
      dialCode: '1',
      iso2: 'us',
      label: 'United States (+1)',
      name: 'United States',
    });
  });

  it('respects a restricted country list', () => {
    const restricted = defaultCountries.filter((c) =>
      ['ca', 'us'].includes(parseCountry(c).iso2),
    );
    expect(getPhoneCountryOptions(restricted).map((o) => o.iso2)).toEqual([
      'us',
      'ca',
    ]);
  });
});

describe('makePhoneValidate', () => {
  const validate = makePhoneValidate('+', '1');

  it('accepts any leading fragment of the dial code while typing', () => {
    expect(validate('')).toBe(true);
    expect(validate('+')).toBe(true);
    expect(validate('+1')).toBe(true);
  });

  it('accepts a complete valid number', () => {
    expect(validate('+1 (213) 373-4253')).toBe(true);
  });

  it('rejects a number that is neither a dial-code fragment nor valid', () => {
    expect(validate('+1 (213) 373')).toBe('Invalid phone number!');
    expect(validate('+2 junk')).toBe('Invalid phone number!');
  });
});
