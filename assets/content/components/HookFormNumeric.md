---
title: HookFormNumeric
---

# HookFormNumeric

Numeric input powered by `react-number-format` and Semantic UI’s `Input`. Great for currency and bounded numbers.

Value type: `number | undefined`.

## Example (currency)

```tsx
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { HookFormNumeric } from '@karmaniverous/hook-form-semantic';

type FormData = { amount: number | undefined };

export function Donation() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { amount: undefined },
  });

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormNumeric<FormData>
        hookControl={control}
        hookName="amount"
        hookRules={{
          required: 'Amount is required',
          min: { value: 1, message: 'Minimum is 1.00' },
        }}
        label="Amount"
        numericDecimalScale={2}
        numericFixedDecimalScale
        numericAllowNegative={false}
        numericLabel="$"
        numericLabelPosition="left"
        numericStep={0.01}
      />
      <Form.Button primary>Donate</Form.Button>
    </Form>
  );
}
```

Notes

- The component maps `onValueChange` to RHF and writes the numeric value (or `undefined` when empty).
- Use `hookRules` for validation (required, min/max).
