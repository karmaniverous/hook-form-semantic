import {
  getActiveFormattingMask,
  type ParsedCountry,
} from 'react-international-phone';

export interface PhoneFormattingChars {
  charAfterDialCode: string;
  placeholderNumberChar: string;
  prefix: string;
}

/**
 * Normalize the configurable formatting characters to single characters with
 * the library defaults: `+` prefix, space after dial code, `.` placeholder.
 */
export const normalizePhoneFormattingChars = (config: {
  charAfterDialCode?: string;
  placeholderNumberChar?: string;
  prefix?: string;
}): PhoneFormattingChars => ({
  charAfterDialCode: config.charAfterDialCode?.slice(0, 1) || ' ',
  placeholderNumberChar: config.placeholderNumberChar?.slice(0, 1) || '.',
  prefix: config.prefix?.slice(0, 1) || '+',
});

/**
 * Build the input placeholder from the active formatting mask for the current
 * country, e.g. `+1 (...) ...-....`.
 */
export const buildPhonePlaceholder = (options: {
  chars: PhoneFormattingChars;
  country: ParsedCountry;
  disableDialCodeAndPrefix?: boolean;
  phone: string;
}): string => {
  const { chars, country, disableDialCodeAndPrefix, phone } = options;
  const mask = getActiveFormattingMask({ country, phone });

  return `${disableDialCodeAndPrefix ? '' : `${chars.prefix}${country.dialCode}${chars.charAfterDialCode}`}${mask?.replaceAll('.', chars.placeholderNumberChar)}`;
};
