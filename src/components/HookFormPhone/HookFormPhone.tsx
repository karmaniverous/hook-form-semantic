import { omit } from 'radash';
import { type ChangeEvent, type ReactNode, useMemo, useState } from 'react';
import { type FieldValues } from 'react-hook-form';
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

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';

import { isPhoneValid } from './isPhoneValid';

export interface HookFormPhoneProps<T extends FieldValues>
  extends HookFormProps<T>,
    Omit<
      FormFieldProps,
      'disabled' | 'error' | 'name' | 'onBlur' | 'onChange' | 'ref' | 'value'
    >,
    PrefixProps<Omit<UsePhoneInputConfig, 'value'>, 'phone'> {
  phonePlaceholderNumberChar?: string;
  mobileBreakpoint?: number;
  isValidating?: boolean;
}

const NEXT_PUBLIC_MOBILE_BREAKPOINT = 768;

export const HookFormPhone = <T extends FieldValues>(
  props: HookFormPhoneProps<T>,
) => {
  // One-char formatting tokens (derive directly from props)
  const [prefix, charAfterDialCode, placeholderNumberChar] = useMemo(() => {
    const p = props.phonePrefix?.slice(0, 1) || '+';
    const c = props.phoneCharAfterDialCode?.slice(0, 1) || ' ';
    const n = props.phonePlaceholderNumberChar?.slice(0, 1) || '.';
    return [p, c, n] as const;
  }, [
    props.phonePrefix,
    props.phoneCharAfterDialCode,
    props.phonePlaceholderNumberChar,
  ]);

  const [dialCode, setDialCode] = useState('');

  // Merge dynamic validation into hookRules to allow partial dial-code during input
  const mergedProps = useMemo(() => {
    const baseValidate =
      (props.hookRules?.validate as Record<string, unknown> | undefined) ?? {};
    return {
      ...props,
      hookRules: {
        ...props.hookRules,
        validate: {
          ...baseValidate,
          valid: (v: string) =>
            `${prefix}${dialCode}`.startsWith(v) ||
            isPhoneValid(v) ||
            'Invalid phone number!',
        },
      },
    } as HookFormPhoneProps<T>;
  }, [props, prefix, dialCode]);

  const {
    controller: {
      field: {
        onChange: hookFieldOnChange,
        value: hookFieldValue,
        ...hookFieldProps
      },
      fieldState: { error },
    },
    deprefixed: { phone: phoneProps },
    rest: { mobileBreakpoint, children, isValidating, ...fieldProps },
  } = useHookForm({ props: mergedProps, prefixes: ['phone'] as const });

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
    maxWidth: (mobileBreakpoint as number) ?? NEXT_PUBLIC_MOBILE_BREAKPOINT,
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
