---
title: HookFormCheckbox
---

# HookFormCheckbox

Controlled checkbox wired to RHF with extra niceties:

- Optional left/right labels around the control.
- Optional “control” labels that toggle the value (e.g., Enable/Disable).
- Semantic UI error wiring via [`Form.Field`](https://react.semantic-ui.com/collections/form/).

Value type: `boolean`.
## Example

```tsx
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { HookFormCheckbox } from '@karmaniverous/hook-form-semantic';

type FormData = { featureEnabled: boolean };

export function FeatureToggle() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { featureEnabled: false },
  });

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormCheckbox<FormData>
        hookControl={control}
        hookName="featureEnabled"
        label="Feature"
        leftLabel="Beta"
        uncheckLabel="Disable"
        checkLabel="Enable"
        rightLabel="(experimental)"
      />
      <Form.Button primary>Apply</Form.Button>
    </Form>
  );
}
```

Notes

- Use `hookRules` for required/conditional logic if needed (e.g., “must be true”).
- The control labels provide an accessible click target to nudge users without aiming for the checkbox itself.
