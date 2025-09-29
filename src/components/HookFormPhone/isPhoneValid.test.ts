import { describe, expect, it } from 'vitest';

import { isPhoneValid } from './isPhoneValid';

describe('isPhoneValid', () => {
  it('returns true for empty string', () => {
    expect(isPhoneValid('')).toBe(true);
  });

  it('returns true for valid US phone numbers', () => {
    expect(isPhoneValid('+1 202 555 0123')).toBe(true);
    expect(isPhoneValid('+12025550123')).toBe(true);
    expect(isPhoneValid('+1-202-555-0123')).toBe(true);
    expect(isPhoneValid('+1 (202) 555-0123')).toBe(true);
  });

  it('returns true for valid international phone numbers', () => {
    expect(isPhoneValid('+44 20 7946 0958')).toBe(true); // UK
    expect(isPhoneValid('+33 1 42 86 83 26')).toBe(true); // France
    expect(isPhoneValid('+49 30 12345678')).toBe(true); // Germany
    expect(isPhoneValid('+81 3 1234 5678')).toBe(true); // Japan
    expect(isPhoneValid('+61 2 1234 5678')).toBe(true); // Australia
  });

  it('returns false for invalid phone numbers', () => {
    expect(isPhoneValid('123')).toBe(false);
    expect(isPhoneValid('abc')).toBe(false);
    expect(isPhoneValid('123-456-789')).toBe(false);
    expect(isPhoneValid('+1 123')).toBe(false);
    expect(isPhoneValid('555-0123')).toBe(false); // Missing country code
  });

  it('returns false for malformed phone numbers', () => {
    expect(isPhoneValid('1-800-FLOWERS')).toBe(false);
    expect(isPhoneValid('+999 123 456 789')).toBe(false); // Invalid country code
    expect(isPhoneValid('phone: +1 202 555 0123')).toBe(false);
  });

  it('handles phone numbers with extensions and special characters', () => {
    // Google libphonenumber is permissive with extensions and some special characters
    expect(isPhoneValid('+1 202 555 0123 ext 123')).toBe(true);
    expect(isPhoneValid('+1 202 555 0123!')).toBe(true);
    expect(isPhoneValid('+1 202 555 0123#')).toBe(false);
    expect(isPhoneValid('+1 202 555 0123*')).toBe(true);
  });

  it('returns false for extremely long strings', () => {
    expect(isPhoneValid('+1' + '2'.repeat(50))).toBe(false);
    expect(isPhoneValid('1'.repeat(100))).toBe(false);
  });

  it('returns false for special characters and symbols', () => {
    expect(isPhoneValid('@#$%^&*()')).toBe(false);
    expect(isPhoneValid('null')).toBe(false);
    expect(isPhoneValid('undefined')).toBe(false);
    expect(isPhoneValid('NaN')).toBe(false);
  });

  it('handles edge cases gracefully', () => {
    expect(isPhoneValid(' ')).toBe(false);
    expect(isPhoneValid('   ')).toBe(false);
    expect(isPhoneValid('\n')).toBe(false);
    expect(isPhoneValid('\t')).toBe(false);
  });

  it('returns true for valid mobile numbers', () => {
    expect(isPhoneValid('+1 202 555 0123')).toBe(true); // US mobile/landline
    expect(isPhoneValid('+44 7911 123456')).toBe(true); // UK mobile
    expect(isPhoneValid('+33 6 12 34 56 78')).toBe(true); // France mobile
  });

  it('returns true for valid landline numbers', () => {
    expect(isPhoneValid('+1 212 555 1234')).toBe(true); // US landline
    expect(isPhoneValid('+44 20 7946 0958')).toBe(true); // UK landline
    expect(isPhoneValid('+33 1 42 86 83 26')).toBe(true); // France landline
  });
});
