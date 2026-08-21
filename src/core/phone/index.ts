/**
 * Phone behaviour with no JSX and no Semantic UI: validation, formatting and
 * country data. The Semantic `HookFormPhone` and any other renderer import
 * from here rather than owning copies.
 *
 * @packageDocumentation
 */

export {
  getPhoneCountryOptions,
  type PhoneCountryOption,
} from './countryOptions';
export { isPhoneValid } from './isPhoneValid';
export {
  buildPhonePlaceholder,
  normalizePhoneFormattingChars,
  type PhoneFormattingChars,
} from './phoneFormat';
export { makePhoneValidate } from './phoneValidate';
