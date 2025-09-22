---
title: HookFormRRStack
---

# HookFormRRStack

Rich scheduling/rules editor powered by [`@karmaniverous/rrstack`](https://www.npmjs.com/package/@karmaniverous/rrstack). Use it to define activation windows (spans) and recurring schedules with fine-grained constraints.

Value type: `RRStackOptions` (timezone, timeUnit, rules).

Peer dependency: `@karmaniverous/rrstack` (install in your app when using this component).

## Minimal embed

```tsx
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { HookFormRRStack } from '@karmaniverous/hook-form-semantic';

type FormData = {
  schedule: {
    timezone: string;
    timeUnit?: 'ms' | 's';
    rules: unknown[];
  };
};

export function ScheduleEditor() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      schedule: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timeUnit: 'ms',
        rules: [],
      },
    },
  });

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormRRStack<FormData>
        hookControl={control}
        hookName="schedule"
        label="Availability"
      />
      <Form.Button primary style={{ marginTop: 12 }}>
        Save
      </Form.Button>
    </Form>
  );
}
```

Notes

- Timezone is validated; provide a sensible default (e.g., browser timezone).
- Requires `@karmaniverous/rrstack` as a peer dependency.
- Span rules (no recurrence) and recurring rules are supported by the built-in editor UI.
- See the [RRStack docs](https://github.com/karmaniverous/rrstack) for advanced rule semantics.
