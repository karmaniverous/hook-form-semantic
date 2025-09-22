---
title: HookFormMenu
---

# HookFormMenu

Semantic UI `Menu` used as a selector. Items are defined via `menuItems`, and the selected item name becomes the field value.

Value type: `string`.

## Example

```tsx
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { HookFormMenu } from '@karmaniverous/hook-form-semantic';

type FormData = { priority: 'low' | 'medium' | 'high' | '' };

export function PriorityPicker() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { priority: '' },
  });

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormMenu<FormData>
        hookControl={control}
        hookName="priority"
        label="Priority"
        menuItems={[
          { name: 'low', content: 'Low' },
          { name: 'medium', content: 'Medium' },
          { name: 'high', content: 'High' },
        ]}
        menuCompact
        menuColor="blue"
      />
      <Form.Button primary>Set</Form.Button>
    </Form>
  );
}
```

Notes

- The active item index is derived from the current field value.
- All Semantic UI `Menu` props can be passed via the `menu*` prefix group.
