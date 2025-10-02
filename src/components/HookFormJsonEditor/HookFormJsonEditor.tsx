import { omit } from 'radash';
import { type ReactNode, useMemo } from 'react';
import type { FieldPath } from 'react-hook-form';
import { type FieldValues } from 'react-hook-form';
import { Form, type FormFieldProps, Label } from 'semantic-ui-react';
import type {
  Content,
  JSONEditorPropsOptional,
  OnChangeStatus,
} from 'vanilla-jsoneditor';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';

import JsonEditor from './JsonEditor';

export interface HookFormJsonEditorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    Omit<
      FormFieldProps,
      'children' | 'disabled' | 'error' | 'name' | 'onBlur' | 'ref' | 'value'
    >,
    PrefixProps<Partial<Omit<JSONEditorPropsOptional, 'content'>>, 'json'> {}

export const HookFormJsonEditor = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormJsonEditorProps<TFieldValues, TName>,
) => {
  const {
    controller: {
      field: {
        onChange: hookFieldOnChange,
        value: hookFieldValue,
        ...hookFieldProps
      },
      fieldState: { error },
    },
    deprefixed: {
      json: { onChange: jsonOnChange, ...jsonProps },
    },
    rest: fieldProps,
  } = useHookForm({ props, prefixes: ['json'] as const });

  const hookField = useMemo(
    () => ({
      ...omit(hookFieldProps as Record<string, unknown>, ['disabled', 'name']),
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
    <Form.Field {...omit(fieldProps as Record<string, unknown>, ['label'])}>
      {fieldProps.label && <label>{fieldProps.label as ReactNode}</label>}

      <JsonEditor {...jsonProps} {...hookField} />
      {error?.message && (
        <Label basic color="red" pointing="above">
          {error?.message}
        </Label>
      )}
    </Form.Field>
  );
};
