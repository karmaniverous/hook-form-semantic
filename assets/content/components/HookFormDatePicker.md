---
title: HookFormDatePicker
---

# HookFormDatePicker

Single date input with an optional “Include Time” toggle. Under the hood it uses:

- [react-date-picker](https://www.npmjs.com/package/react-date-picker) for date-only
- [react-datetime-picker](https://www.npmjs.com/package/react-datetime-picker) for date+time

Value type: `Date | null`.

## Example

```tsx
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { HookFormDatePicker } from '@karmaniverous/hook-form-semantic';

type FormData = { publishAt: Date | null };

export function PublishScheduler() {
  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: { publishAt: null },
  });
  const when = watch('publishAt');

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormDatePicker<FormData>
        hookControl={control}
        hookName="publishAt"
        label="Publish at"
      />
      <div style={{ marginTop: 8, fontSize: 12 }}>
        Current value: {when ? when.toISOString() : 'unset'}
      </div>
      <Form.Button primary style={{ marginTop: 12 }}>
        Schedule
      </Form.Button>
    </Form>
  );
}
```

Props

- Pass-through groups:
  - `datePicker*` → forwarded to `react-date-picker`
  - `timePicker*` → forwarded to `react-datetime-picker`
- RHF props via `hook*` (e.g., `hookControl`, `hookName`, `hookRules`).

Notes

- The toggle switches between the date and datetime widgets. The RHF value remains a `Date | null`.
- Add validation with `hookRules` (e.g., must be in the future).
