import { omit } from 'radash';
import { type ReactNode, useMemo } from 'react';
import {
  type ControllerProps,
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import { Form, type FormFieldProps, Label } from 'semantic-ui-react';
import type {
  Content,
  JSONEditorPropsOptional,
  OnChangeStatus,
} from 'vanilla-jsoneditor';

import {
  deprefix,
  type PrefixedPartial,
} from '../../lib/utils/PrefixedPartial';
import JsonEditor from './JsonEditor';

export interface HookFormJsonEditorProps<T extends FieldValues>
  extends Omit<
      FormFieldProps,
      'children' | 'disabled' | 'error' | 'name' | 'onBlur' | 'ref' | 'value'
    >,
    PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'>,
    PrefixedPartial<
      Partial<Omit<JSONEditorPropsOptional, 'content'>>,
      'json'
    > {}

export const HookFormJsonEditor = <T extends FieldValues>(
  props: HookFormJsonEditorProps<T>,
) => {
  const {
    hook: hookProps,
    json: { onChange: jsonOnChange, ...jsonProps },
    rest: fieldProps,
  } = useMemo(() => deprefix(props, ['hook', 'json']), [props]);

  const {
    field: {
      onChange: hookFieldOnChange,
      value: hookFieldValue,
      ...hookFieldProps
    },
    fieldState: { error },
  } = useController(hookProps as UseControllerProps);

  const hookField = useMemo(
    () => ({
      ...omit(hookFieldProps, ['disabled', 'name']),
      content: hookFieldValue
        ? typeof hookFieldValue === 'string'
          ? { text: hookFieldValue }
          : { json: hookFieldValue }
        : { text: '{}' }, // Default empty JSON object as text
      onChange: (
        content: Content,
        previousContent: Content,
        status: OnChangeStatus,
      ) => {
        jsonOnChange?.(content, previousContent, status);
        // Extract the actual value from content (either json or text)
        const value = 'json' in content ? content.json : content.text;
        hookFieldOnChange({ target: { value } });
      },
    }),
    [hookFieldOnChange, hookFieldProps, hookFieldValue, jsonOnChange],
  );

  return (
    <>
      <Form.Field {...omit(fieldProps as Record<string, unknown>, ['label'])}>
        {fieldProps.label && <label>{fieldProps.label as ReactNode}</label>}

        <JsonEditor {...jsonProps} {...hookField} />
        {error?.message && (
          <Label basic color="red" pointing="above">
            {error?.message}
          </Label>
        )}
      </Form.Field>
    </>
  );
};
