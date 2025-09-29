import { omit } from 'radash';
import { useCallback, useMemo } from 'react';
import {
  type ControllerProps,
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
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

import { deprefix, type PrefixedPartial } from '../../types/PrefixedPartial';

export type Sort<T extends string | undefined> = [
  NonNullable<T> | 'auto',
  boolean,
];

export interface HookFormSortProps<T extends FieldValues>
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
      Omit<StrictButtonProps, 'children' | 'icon' | 'onClick'>,
      'button'
    >,
    PrefixedPartial<
      Omit<
        StrictDropdownProps,
        'button' | 'children' | 'selection' | 'style' | 'value'
      >,
      'dropdown'
    >,
    PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'> {
  ascIcon?: SemanticICONS;
  descIcon?: SemanticICONS;
  sortOptions?: StrictDropdownProps['options'];
  dropdownOptions?: StrictDropdownProps['options']; // Backward compatibility
}

export const HookFormSort = <T extends FieldValues>({
  ascIcon = 'arrow up',
  descIcon = 'arrow down',
  sortOptions,
  dropdownOptions,
  ...props
}: HookFormSortProps<T>) => {
  const {
    button: buttonProps,
    dropdown: dropdownProps,
    hook: hookProps,
    rest: { label, ...fieldProps },
  } = useMemo(() => deprefix(props, ['button', 'dropdown', 'hook']), [props]);

  const {
    field: { onChange: hookFieldOnChange, value, ...hookFieldProps },
    fieldState,
  } = useController(hookProps as UseControllerProps);

  const handleDropdownChange = useCallback(
    (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) =>
      hookFieldOnChange({
        ...event,
        target: { value: [data.value, value?.[1]] },
      }),
    [hookFieldOnChange, value],
  );

  const handleButtonClick = useCallback(
    (event: React.SyntheticEvent<HTMLElement>) =>
      hookFieldOnChange({
        ...event,
        target: { value: [value?.[0], !value?.[1]] },
      }),
    [hookFieldOnChange, value],
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
          value={value?.[0]}
        />

        <Button
          {...buttonProps}
          icon={value?.[1] ? ascIcon : descIcon}
          onClick={handleButtonClick}
          type="button"
        />
      </div>
    </Form.Field>
  );
};
