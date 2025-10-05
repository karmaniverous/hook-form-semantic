import { omit } from 'radash';
import { useCallback } from 'react';
import type { FieldPath } from 'react-hook-form';
import { type FieldValues } from 'react-hook-form';
import {
  Button,
  Dropdown,
  type DropdownProps,
  Form,
  type FormFieldProps,
  type SemanticICONS,
  type StrictButtonProps,
  type StrictDropdownProps,
} from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';

export type Sort<T extends string | undefined> = [
  NonNullable<T> | 'auto',
  boolean,
];

export interface HookFormSortProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    Omit<
      FormFieldProps,
      | 'children'
      | 'checked'
      | 'disabled'
      | 'error'
      | 'name'
      | 'onBlur'
      | 'onChange'
      | 'ref'
      | 'value'
    >,
    PrefixProps<
      Omit<StrictButtonProps, 'children' | 'icon' | 'onClick'>,
      'button'
    >,
    PrefixProps<
      Omit<
        StrictDropdownProps,
        'button' | 'children' | 'selection' | 'style' | 'value'
      >,
      'dropdown'
    > {
  ascIcon?: SemanticICONS;
  descIcon?: SemanticICONS;
  sortOptions?: StrictDropdownProps['options'];
  dropdownOptions?: StrictDropdownProps['options']; // Backward compatibility
}

export const HookFormSort = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ascIcon = 'arrow up',
  descIcon = 'arrow down',
  sortOptions,
  dropdownOptions,
  ...props
}: HookFormSortProps<TFieldValues, TName>) => {
  const {
    controller: {
      field: { onChange: hookFieldOnChange, value, ...hookFieldProps },
      fieldState,
    },
    deprefixed: { button: buttonProps, dropdown: dropdownProps },
    rest: { label, ...fieldProps },
  } = useHookForm({ props, prefixes: ['button', 'dropdown'] as const });

  const sortValue = value as Sort<string | undefined> | undefined;

  const handleDropdownChange = useCallback(
    (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) =>
      hookFieldOnChange({
        ...event,
        target: { value: [data.value, sortValue?.[1]] },
      }),
    [hookFieldOnChange, sortValue],
  );

  const handleButtonClick = useCallback(
    (event: React.SyntheticEvent<HTMLElement>) =>
      hookFieldOnChange({
        ...event,
        target: { value: [sortValue?.[0], !sortValue?.[1]] },
      }),
    [hookFieldOnChange, sortValue],
  );

  return (
    <Form.Field
      {...fieldProps}
      {...omit(hookFieldProps as Record<string, unknown>, ['ref'])}
      error={fieldState.error?.message}
    >
      {label && <label>{label}</label>}
      <div style={{ display: 'flex' }}>
        <Dropdown
          {...dropdownProps}
          button
          onChange={handleDropdownChange}
          options={sortOptions || dropdownOptions}
          selection
          style={{ flexGrow: 1 }}
          value={sortValue?.[0]}
        />

        <Button
          {...buttonProps}
          icon={sortValue?.[1] ? ascIcon : descIcon}
          onClick={handleButtonClick}
          type="button"
        />
      </div>
    </Form.Field>
  );
};
