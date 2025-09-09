import { omit } from 'lodash';
import { lazy, type ReactNode, Suspense, useMemo } from 'react';
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

const JsonEditor = lazy(() => import('./JsonEditor'));

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
      // TECHDEBT: unsafe assignment

      value: hookFieldValue,
      ...hookFieldProps
    },
    fieldState: { error },
  } = useController(hookProps as UseControllerProps);

  const hookField = useMemo(
    () => ({
      ...omit(hookFieldProps, ['disabled', 'name']),
      // TECHDEBT: unsafe assignment

      content: hookFieldValue,
      onChange: (
        content: Content,
        previousContent: Content,
        status: OnChangeStatus,
      ) => {
        jsonOnChange?.(content, previousContent, status);
        hookFieldOnChange({ target: { value: content } });
      },
    }),
    [hookFieldOnChange, hookFieldProps, hookFieldValue, jsonOnChange],
  );

  return (
    <>
      <Form.Field {...omit(fieldProps, 'label')}>
        {fieldProps.label && <label>{fieldProps.label as ReactNode}</label>}

        <Suspense fallback={<div>Loading editor...</div>}>
          <JsonEditor {...jsonProps} {...hookField} />
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
