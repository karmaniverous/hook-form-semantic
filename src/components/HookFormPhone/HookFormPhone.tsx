import { omit } from 'radash';
import { type ChangeEvent, type ReactNode, useMemo, useState } from 'react';
import type { FieldPath } from 'react-hook-form';
import { type FieldValues } from 'react-hook-form';
import {
  FlagImage,
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

import {
  buildPhonePlaceholder,
  getPhoneCountryOptions,
  makePhoneValidate,
  normalizePhoneFormattingChars,
} from '@/core/phone';
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';

export interface HookFormPhoneProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    Omit<
      FormFieldProps,
      'disabled' | 'error' | 'name' | 'onBlur' | 'onChange' | 'ref' | 'value'
    >,
    PrefixProps<Omit<UsePhoneInputConfig, 'value'>, 'phone'> {
  phonePlaceholderNumberChar?: string;
  mobileBreakpoint?: number;
  isValidating?: boolean;
  /**
   * Enable typeahead on the country selector. Off by default: the search
   * variant renders a real text input inside the selector, which puts a
   * caret in the tab order where users expect a button — tabbing from the
   * previous field lands in the country filter and typed digits filter
   * countries instead of dialling. The non-search dropdown is still fully
   * keyboard operable (arrows, Enter, letter-jump).
   */
  countrySearch?: boolean;
}

const NEXT_PUBLIC_MOBILE_BREAKPOINT = 768;

export const HookFormPhone = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormPhoneProps<TFieldValues, TName>,
) => {
  // One-char formatting tokens (derive directly from props)
  const chars = useMemo(
    () =>
      normalizePhoneFormattingChars({
        charAfterDialCode: props.phoneCharAfterDialCode,
        placeholderNumberChar: props.phonePlaceholderNumberChar,
        prefix: props.phonePrefix,
      }),
    [
      props.phonePrefix,
      props.phoneCharAfterDialCode,
      props.phonePlaceholderNumberChar,
    ],
  );

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
          valid: makePhoneValidate(chars.prefix, dialCode),
        },
      },
    } as HookFormPhoneProps<TFieldValues, TName>;
  }, [props, chars.prefix, dialCode]);

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
    rest: {
      mobileBreakpoint,
      children,
      countrySearch,
      isValidating,
      ...fieldProps
    },
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

  const placeholder = useMemo(
    () =>
      buildPhonePlaceholder({
        chars,
        country,
        disableDialCodeAndPrefix: phoneProps.disableDialCodeAndPrefix,
        phone,
      }),
    [chars, country, phone, phoneProps.disableDialCodeAndPrefix],
  );

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
      getPhoneCountryOptions(phoneProps.countries).map(({ iso2, label }) => ({
        image: <FlagImage iso2={iso2} size={20} />,
        key: iso2,
        text: label,
        value: iso2,
      })),
    [phoneProps.countries],
  );

  return (
    <Form.Field {...omit(fieldProps as Record<string, unknown>, ['label'])}>
      {fieldProps.label && <label>{fieldProps.label as ReactNode}</label>}

      {isMobile && (
        <Dropdown
          button
          deburr
          disabled={countryOptions.length === 1}
          fluid
          onChange={(e, data) =>
            setCountry(data.value as string, { focusOnInput: true })
          }
          options={countryOptions}
          search={Boolean(countrySearch)}
          // A single-country selector is informational, not broken: keep the
          // disabled semantics (no tab stop, no click, aria-disabled) but not
          // Semantic's dimming.
          style={{
            marginBottom: '0.5rem',
            ...(countryOptions.length === 1 ? { opacity: 1 } : {}),
          }}
          value={country.iso2}
        />
      )}

      <Input
        {...hookField}
        label={
          isMobile ? undefined : (
            <Dropdown
              deburr
              disabled={countryOptions.length === 1}
              onChange={(e, data) =>
                setCountry(data.value as string, { focusOnInput: true })
              }
              options={countryOptions}
              search={Boolean(countrySearch)}
              // Informational, not broken — see the mobile Dropdown above.
              style={countryOptions.length === 1 ? { opacity: 1 } : undefined}
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
