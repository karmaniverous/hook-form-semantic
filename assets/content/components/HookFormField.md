---
title: HookFormField
---

# HookFormField

Generic bridge between [React Hook Form](https://react-hook-form.com) (RHF) and [Semantic UI React](https://react.semantic-ui.com) controls. It wires a field via RHF’s Controller and renders a Semantic UI [`Form.Field`](https://react.semantic-ui.com/collections/form/), surfacing validation errors in the usual Semantic way.

Highlights
- Works with any Semantic UI control (Input, Checkbox, Dropdown, etc.).
- Function-as-child mode for custom data mapping (e.g., `{ checked }` vs `{ value }`).
- Errors from RHF appear on the field and can be labeled.

## Quick input example

```tsx
import { useForm } from 'react-hook-form';
import { Form, Input } from 'semantic-ui-react';
import { HookFormField } from '@karmaniverous/hook-form-semantic';

type FormData = { email: string };

export function ProfileEmailForm() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormField<FormData, { value: string }>
        control={Input}
        hookControl={control}
        hookName="email"
        hookRules={{ required: 'Email is required' }}
        label="Email"
        placeholder="you@example.com"
      />
      <Form.Button primary>Save</Form.Button>
    </Form>
  );
}
```

## Function-as-child mapping (checkbox)

Use this when your control reports state via something other than `data.value`.

```tsx
import { useForm, ControllerRenderProps, Path } from 'react-hook-form';
import { Checkbox, Form } from 'semantic-ui-react';
import { HookFormField } from '@karmaniverous/hook-form-semantic';

type FormData = { subscribed: boolean };

export function MarketingPrefs() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { subscribed: false },
  });

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormField<FormData, { checked: boolean }>
        hookControl={control}
        hookName="subscribed"
        label="Marketing emails"
      >
        {(field) => {
          const f = field as ControllerRenderProps<FormData, Path<FormData>> & {
            checked?: boolean;
          };
          return (
            <Checkbox
              label="Subscribe me"
              checked={!!f.checked}
              onChange={(_, data) => f.onChange(_, { checked: !!data.checked })}
            />
          );
        }}
      </HookFormField>
      <Form.Button primary>Update</Form.Button>
    </Form>
  );
}
```

Tips

- Prefer the simple `control={Input}` form when the widget’s change handler already uses `{ value }`.
- Switch to function-as-child when you need to translate the widget’s payload shape to RHF (e.g., `checked`, tuples, complex objects).
