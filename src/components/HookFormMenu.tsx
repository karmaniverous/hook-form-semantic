import { findIndex } from 'lodash';
import { useCallback, useMemo } from 'react';
import {
  type ControllerProps,
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import {
  Form,
  type FormFieldProps,
  Menu,
  type MenuItemProps,
  type StrictMenuProps,
} from 'semantic-ui-react';

import {
  deprefix,
  type PrefixedPartial,
} from '../../lib/utils/PrefixedPartial';

export interface HookFormMenuProps<T extends FieldValues>
  extends Omit<
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
    PrefixedPartial<
      Omit<StrictMenuProps, 'activeIndex' | 'children' | 'onItemClick'>,
      'menu'
    >,
    PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'> {}

export const HookFormMenu = <T extends FieldValues>({
  ...props
}: HookFormMenuProps<T>) => {
  const {
    menu: menuProps,
    hook: hookProps,
    rest: { label, ...fieldProps },
  } = useMemo(() => deprefix(props, ['menu', 'hook']), [props]);

  const {
    // TECHDEBT: unsafe assignment

    field: { onChange: hookFieldOnChange, value, ...hookFieldProps },
    fieldState,
  } = useController(hookProps as UseControllerProps);

  const handleItemClick = useCallback(
    (event: React.SyntheticEvent<HTMLElement>, data: MenuItemProps) =>
      hookFieldOnChange({ ...event, target: { value: data.name } }),
    [hookFieldOnChange],
  );

  return (
    <Form.Field
      {...fieldProps}
      {...hookFieldProps}
      error={fieldState.error?.message}
    >
      {label && <label>{label}</label>}

      <Menu
        {...menuProps}
        // TECHDEBT: unsafe assignment

        activeIndex={findIndex(menuProps.items, { name: value })}
        onItemClick={handleItemClick}
      />
    </Form.Field>
  );
};
