---
title: HookFormPhone
---

# HookFormPhone

International phone input built on [react-international-phone](https://www.npmjs.com/package/react-international-phone) with validation using [google-libphonenumber](https://www.npmjs.com/package/google-libphonenumber). Produces a formatted E.164-like string (e.g., `+12025550123`).

Value type: `string`.

Peer dependencies: `react-international-phone`, `google-libphonenumber`, `react-responsive`.
## Example

```tsximport { useForm } from 'react-hook-form';
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
- Requires `react-responsive` for mobile detection (dropdown behavior on small screens).