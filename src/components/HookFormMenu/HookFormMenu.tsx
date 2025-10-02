import { omit } from 'radash';
import { useCallback } from 'react';
import type { FieldPath } from 'react-hook-form';
import { type FieldValues } from 'react-hook-form';
import {
  Form,
  type FormFieldProps,
  Menu,
  type MenuItemProps,
  type StrictMenuProps,
} from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';

export interface HookFormMenuProps<
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
      Omit<StrictMenuProps, 'activeIndex' | 'children' | 'onItemClick'>,
      'menu'
    > {}

export const HookFormMenu = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormMenuProps<TFieldValues, TName>,
) => {
  const {
    controller: {
      field: { onChange: hookFieldOnChange, value, ...hookFieldProps },
      fieldState,
    },
    deprefixed: { menu: menuProps },
    rest: { label, ...fieldProps },
  } = useHookForm({
    props,
    prefixes: ['menu'] as const,
  });

  const handleItemClick = useCallback(
    (event: React.SyntheticEvent<HTMLElement>, data: MenuItemProps) =>
      hookFieldOnChange({ ...event, target: { value: data.name } }),
    [hookFieldOnChange],
  );

  return (
    <Form.Field
      {...fieldProps}
      {...omit(hookFieldProps as Record<string, unknown>, ['ref'])}
      error={fieldState.error?.message}
    >
      {label && <label>{label}</label>}
      <Menu
        {...menuProps}
        activeIndex={(menuProps.items ?? []).findIndex((i) => {
          const item = i as Partial<MenuItemProps> | null | undefined;
          return !!item && item.name === (value as unknown as string);
        })}
        onItemClick={handleItemClick}
      />
    </Form.Field>
  );
};
