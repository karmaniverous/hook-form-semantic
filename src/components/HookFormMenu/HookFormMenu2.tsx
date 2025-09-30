import { omit } from 'radash';
import { useCallback } from 'react';
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

export interface HookFormMenu2Props<T extends FieldValues>
  extends HookFormProps<T>,
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

export const HookFormMenu2 = <T extends FieldValues>({
  ...props
}: HookFormMenu2Props<T>) => {
  const {
    controller: {
      field: { onChange: hookFieldOnChange, value, ...hookFieldProps },
      fieldState,
    },
    deprefixed: { menu: menuProps },
    rest: { label, ...fieldProps },
  } = useHookForm<T, typeof props, ['menu']>({
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
