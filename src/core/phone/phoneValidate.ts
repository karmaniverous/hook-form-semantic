import { isPhoneValid } from './isPhoneValid';

/**
 * react-hook-form `validate` rule for a phone field.
 *
 * Accepts any leading fragment of the current dial code (e.g. `+`, `+1`) so
 * validation does not fire while the user is still typing the country code;
 * anything longer must be a valid number.
 */
export const makePhoneValidate =
  (prefix: string, dialCode: string) =>
  (value: string): true | string =>
    `${prefix}${dialCode}`.startsWith(value) ||
    isPhoneValid(value) ||
    'Invalid phone number!';
