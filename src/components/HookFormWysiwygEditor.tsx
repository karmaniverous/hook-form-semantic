import { omit } from 'lodash';
import { type ReactNode, Suspense, useMemo } from 'react';
import React from 'react';
import {
  type ControllerProps,
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import { Form, type FormFieldProps, Label } from 'semantic-ui-react';

import {
  deprefix,
  type PrefixedPartial,
} from '../../lib/utils/PrefixedPartial';
import { type WysiwygEditorProps } from './WysiwygEditor';

const WysiwygEditor = React.lazy(() =>
  import('./WysiwygEditor').then((module) => ({
    default: module.WysiwygEditor,
  })),
);

export interface HookFormWysiwygEditorProps<T extends FieldValues>
  extends Omit<
      FormFieldProps,
      'children' | 'disabled' | 'error' | 'name' | 'onBlur' | 'ref' | 'value'
    >,
    PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'>,
    PrefixedPartial<Partial<WysiwygEditorProps>, 'wysiwyg'> {}

export const HookFormWysiwygEditor = <T extends FieldValues>(
  props: HookFormWysiwygEditorProps<T>,
) => {
  const {
    hook: hookProps,
    rest: fieldProps,
    wysiwyg: { onChange: wysiwygOnChange, ...wysiwygProps },
  } = useMemo(() => deprefix(props, ['hook', 'wysiwyg']), [props]);

  const {
    field: { onChange: hookFieldOnChange, ...hookFieldProps },
    fieldState: { error },
  } = useController(hookProps as UseControllerProps);

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
      <Form.Field {...omit(fieldProps, 'label')}>
        {fieldProps.label && <label>{fieldProps.label as ReactNode}</label>}

        <Suspense fallback={<div>Loading editor...</div>}>
          <WysiwygEditor {...wysiwygProps} {...hookField} />
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
