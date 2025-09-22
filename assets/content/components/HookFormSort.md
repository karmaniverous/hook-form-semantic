---
title: HookFormSort
---

# HookFormSort

Dropdown + direction button for managing a two-part sort value:

```ts
type Sort<T extends string | undefined> = [NonNullable<T> | 'auto', boolean];
```

The tuple is `[field, ascending]`. Use the [Semantic UI React Dropdown](https://react.semantic-ui.com/modules/dropdown/) to select a field and the [Button](https://react.semantic-ui.com/elements/button/) to toggle ascending/descending.

## Example

```tsx
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { HookFormSort } from '@karmaniverous/hook-form-semantic';

type FormData = { sort: ['auto' | 'name' | 'created', boolean] };

export function SortChooser() {
  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: { sort: ['auto', true] },
  });
  const [field, asc] = watch('sort');

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormSort<FormData>
        hookControl={control}
        hookName="sort"
        label="Sort by"
        dropdownOptions={[
          { text: 'Auto', value: 'auto' },
          { text: 'Name', value: 'name' },
          { text: 'Created', value: 'created' },
        ]}
      />
      <div style={{ marginTop: 8, fontSize: 12 }}>
        Current: {field} ({asc ? 'asc' : 'desc'})
      </div>
      <Form.Button primary style={{ marginTop: 12 }}>
        Apply
      </Form.Button>
    </Form>
  );
}
```

Notes

- Map the tuple to your API’s expected sort parameter and order (e.g., `sort=name&order=asc`).
