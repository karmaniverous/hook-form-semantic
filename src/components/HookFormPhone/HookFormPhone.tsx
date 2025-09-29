import { omit } from 'radash';
import { type ChangeEvent, type ReactNode, useMemo, useState } from 'react';
import {
  type ControllerProps,
  type FieldValues,
  useController,
} from 'react-hook-form';
import {
  defaultCountries,
  FlagImage,
  getActiveFormattingMask,
  parseCountry,
  usePhoneInput,
  type UsePhoneInputConfig,
} from 'react-international-phone';
import { useMediaQuery } from 'react-responsive';
import {
  Dropdown,
  Form,
  type FormFieldProps,
  Input,
  Label,
} from 'semantic-ui-react';

import type { PrefixedPartial } from '../../types/PrefixedPartial';
import { deprefix } from '../../types/PrefixedPartial';
import { isPhoneValid } from './isPhoneValid';

export interface HookFormPhoneProps<T extends FieldValues>
  extends Omit<
      FormFieldProps,
      'disabled' | 'error' | 'name' | 'onBlur' | 'onChange' | 'ref' | 'value'
    >,
    PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'>,
    PrefixedPartial<Omit<UsePhoneInputConfig, 'value'>, 'phone'> {
  phonePlaceholderNumberChar?: string;
  mobileBreakpoint?: number;
  isValidating?: boolean;
}

const NEXT_PUBLIC_MOBILE_BREAKPOINT = 768;

export const HookFormPhone = <T extends FieldValues>(
  props: HookFormPhoneProps<T>,
) => {
  const {
    hook: hookProps,
    phone: phoneProps,
    rest: { breakpointCountryCode, children, isValidating, ...fieldProps },
  } = useMemo(() => deprefix(props, ['hook', 'phone']), [props]);

  const [prefix, charAfterDialCode, placeholderNumberChar] = useMemo(() => {
    const prefix = phoneProps.prefix?.slice(0, 1) || '+';
    const charAfterDialCode = phoneProps.charAfterDialCode?.slice(0, 1) || ' ';
    const placeholderNumberChar =
      phoneProps.placeholderNumberChar?.slice(0, 1) || '.';

    return [prefix, charAfterDialCode, placeholderNumberChar];
  }, [
    phoneProps.charAfterDialCode,
    phoneProps.placeholderNumberChar,
    phoneProps.prefix,
  ]);

  const [dialCode, setDialCode] = useState('');

  const {
    field: {
      onChange: hookFieldOnChange,
      value: hookFieldValue,
      ...hookFieldProps
    },
    fieldState: { error },
  } = useController({
    ...hookProps,
    rules: {
      ...hookProps.rules,
      validate: {
        ...(hookProps.rules?.validate || {}),
        valid: (v: string) => {
          if (`${prefix}${dialCode}`.startsWith(v) || isPhoneValid(v)) {
            return true;
          }
          return 'Invalid phone number!';
        },
      },
    },
  });

  const { inputValue, phone, country, setCountry, handlePhoneValueChange } =
    usePhoneInput({
      ...omit(phoneProps, ['onChange']),
      onChange: ({ country, inputValue, phone }) => {
        setDialCode(country.dialCode);
        phoneProps.onChange?.({ country, inputValue, phone });
        hookFieldOnChange(phone);
      },
      value: hookFieldValue || '',
    });

  const placeholder = useMemo(() => {
    const mask = getActiveFormattingMask({ phone, country });
    return `${phoneProps.disableDialCodeAndPrefix ? '' : `${prefix}${country.dialCode}${charAfterDialCode}`}${mask?.replaceAll('.', placeholderNumberChar)}`;
  }, [
    charAfterDialCode,
    country,
    phone,
    phoneProps.disableDialCodeAndPrefix,
    placeholderNumberChar,
    prefix,
  ]);

  const hookField = useMemo(
    () => ({
      ...hookFieldProps,
      onChange: (event: React.SyntheticEvent<HTMLElement>) => {
        handlePhoneValueChange(event as ChangeEvent<HTMLInputElement>);
      },
      value: inputValue,
    }),
    [handlePhoneValueChange, hookFieldProps, inputValue],
  );

  const isMobile = useMediaQuery({
    maxWidth:
      (breakpointCountryCode as number) ?? NEXT_PUBLIC_MOBILE_BREAKPOINT,
  });

  const countryOptions = useMemo(
    () =>
      (phoneProps.countries ?? defaultCountries).map((country) => {
        const { dialCode, iso2, name } = parseCountry(country);

        return {
          image: <FlagImage iso2={iso2} size={20} />,
          key: iso2,
          text: `${name} (+${dialCode})`,
          value: iso2,
        };
      }),
    [phoneProps.countries],
  );

  return (
    <Form.Field {...omit(fieldProps as Record<string, unknown>, ['label'])}>
      {fieldProps.label && <label>{fieldProps.label as ReactNode}</label>}

      {isMobile && (
        <Dropdown
          button
          deburr
          fluid
          onChange={(e, data) =>
            setCountry(data.value as string, { focusOnInput: true })
          }
          options={countryOptions}
          search
          style={{ marginBottom: '0.5rem' }}
          value={country.iso2}
        />
      )}

      <Input
        {...hookField}
        label={
          isMobile ? undefined : (
            <Dropdown
              deburr
              onChange={(e, data) =>
                setCountry(data.value as string, { focusOnInput: true })
              }
              options={countryOptions}
              search
              value={country.iso2}
            />
          )
        }
        placeholder={placeholder}
        loading={isValidating}
        icon={isValidating ? 'spinner' : undefined}
      />

      {error?.message && (
        <Label basic color="red" pointing="above">
          {error?.message}
        </Label>
      )}

      {children}
    </Form.Field>
  );
};
