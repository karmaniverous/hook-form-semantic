import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export const isPhoneValid = (phone: string): boolean => {
  try {
    return (
      !phone || phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone))
    );
  } catch {
    return false;
  }
};
