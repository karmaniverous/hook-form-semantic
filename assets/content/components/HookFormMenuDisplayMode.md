---
title: HookFormMenuDisplayMode
---

# HookFormMenuDisplayMode

Opinionated version of `HookFormMenu` for choosing a display mode (Cards/Table). Good for list screens that support multiple views.

Value type: `'card' | 'table' | 'wizard'` (this component provides `card` and `table`).

## Example

```tsx
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { HookFormMenuDisplayMode } from '@karmaniverous/hook-form-semantic';

type FormData = { mode: 'card' | 'table' | 'wizard' | '' };

export function ViewSwitcher() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { mode: '' },
  });

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormMenuDisplayMode<FormData>
        hookControl={control}
        hookName="mode"
      />
      <Form.Button primary style={{ marginTop: 8 }}>
        Apply
      </Form.Button>
    </Form>
  );
}
```

Notes

- The displayed icons and labels are designed to fit typical “Cards” vs “Table” semantics.
- Use plain `HookFormMenu` for bespoke view options.
