---
title: HookFormPhone
---

# HookFormPhone

International phone input built on `react-international-phone` with validation using `google-libphonenumber`. Produces a formatted E.164-like string (e.g., `+12025550123`).

Value type: `string`.

## Example

```tsx
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { HookFormPhone, isPhoneValid } from '@karmaniverous/hook-form-semantic';

type FormData = { phone: string };

export function ContactPhone() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { phone: '' },
    mode: 'onTouched',
  });

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormPhone<FormData>
        hookControl={control}
        hookName="phone"
        hookRules={{
          required: 'Phone is required',
          validate: (v) => isPhoneValid(v) || 'Invalid phone number',
        }}
        label="Phone"
        phoneDefaultCountry="us"
      />
      <Form.Button primary>Add</Form.Button>
    </Form>
  );
}
```

Notes

- Use `phoneCountries` and `phoneDefaultCountry` to constrain selection to your target markets.
- The placeholder mask follows the selected country format; validation accepts only well-formed numbers.
