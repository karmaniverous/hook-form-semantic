---
title: HookFormJsonEditor
---

# HookFormJsonEditor

Integrates the [vanilla-jsoneditor](https://www.npmjs.com/package/vanilla-jsoneditor) with RHF. Accepts and returns either:

- a JSON object (stored as `{ json: object }`), or
- a text string (`{ text: string }`)

The component bridges these to your RHF value (`object | string | undefined`) and surfaces errors via Semantic UI.

## Example

```tsx
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { HookFormJsonEditor } from '@karmaniverous/hook-form-semantic';

type FormData = { config: object | string | undefined };

export function ConfigEditor() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { config: { enabled: true } },
    mode: 'onTouched',
  });

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormJsonEditor<FormData>
        hookControl={control}
        hookName="config"
        label="Integration config"
        jsonMainMenuBar={false}
      />
      <Form.Button primary>Save</Form.Button>
    </Form>
  );
}
```

Notes

- The editor can operate in text mode as needed. The wrapper chooses `{ json }` vs `{ text }` based on your RHF value’s type.
- Use `hookRules` to validate required or shape constraints (e.g., must include a specific key).
