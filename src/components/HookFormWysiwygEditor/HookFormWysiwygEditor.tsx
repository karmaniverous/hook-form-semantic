import { omit } from 'radash';
import { type ReactNode, Suspense, useMemo } from 'react';
import React from 'react';
import type { FieldPath } from 'react-hook-form';
import { type FieldValues } from 'react-hook-form';
import { Form, type FormFieldProps, Label } from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';

import { type WysiwygEditorProps } from './WysiwygEditor';

const WysiwygEditor = React.lazy(() =>
  import('./WysiwygEditor').then((module) => ({
    default: module.WysiwygEditor,
  })),
);

export interface HookFormWysiwygEditorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    Omit<
      FormFieldProps,
      'children' | 'disabled' | 'error' | 'name' | 'onBlur' | 'ref' | 'value'
    >,
    PrefixProps<Partial<WysiwygEditorProps>, 'wysiwyg'> {}

export const HookFormWysiwygEditor = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormWysiwygEditorProps<TFieldValues, TName>,
) => {
  const {
    controller: {
      field: { onChange: hookFieldOnChange, ...hookFieldProps },
      fieldState: { error },
    },
    deprefixed: {
      wysiwyg: { onChange: wysiwygOnChange, ...wysiwygProps },
    },
    rest: fieldProps,
  } = useHookForm({ props, prefixes: ['wysiwyg'] as const });

  const hookField = useMemo(
    () => ({
      ...hookFieldProps,
      onChange: (value: string) => {
        wysiwygOnChange?.(value);
        hookFieldOnChange(value);
      },
    }),
    [hookFieldOnChange, hookFieldProps, wysiwygOnChange],
  );

  return (
    <>
      <Form.Field {...omit(fieldProps as Record<string, unknown>, ['label'])}>
        {fieldProps.label && <label>{fieldProps.label as ReactNode}</label>}

        <Suspense fallback={<div>Loading editor...</div>}>
          <WysiwygEditor
            {...wysiwygProps}
            {...(hookField as unknown as WysiwygEditorProps)}
          />
        </Suspense>

        {error?.message && (
          <Label basic color="red" pointing="above">
            {error?.message}
          </Label>
        )}
      </Form.Field>
    </>
  );
};
