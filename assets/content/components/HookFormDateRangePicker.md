---
title: HookFormDateRangePicker
---

# HookFormDateRangePicker

Pick a start and end date (or datetime). Includes:

- “Include Time” toggle for datetime ranges.
- Optional presets menu (e.g., Today, This Week).
- Utilities to work with values:
  - `extractTimestamps(range)` → `[startMs | undefined, endMs | undefined]`
  - `defaultPresets`, `filterPresets([...])`

Under the hood it uses:

- [@wojtekmaj/react-daterange-picker](https://www.npmjs.com/package/@wojtekmaj/react-daterange-picker) (dates)
- [@wojtekmaj/react-datetimerange-picker](https://www.npmjs.com/package/@wojtekmaj/react-datetimerange-picker) (datetimes)

Value type: `[Date | null, Date | null]`.

## Example with presets

```tsx
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import {
  HookFormDateRangePicker,
  defaultPresets,
  filterPresets,
  extractTimestamps,
} from '@karmaniverous/hook-form-semantic';

type DateRange = [Date | null, Date | null];
type FormData = { range: DateRange };

export function ReportRange() {
  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: { range: [null, null] },
  });
  const [startMs, endMs] = extractTimestamps(watch('range'));

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormDateRangePicker<FormData>
        hookControl={control}
        hookName="range"
        label="Reporting window"
        presets={filterPresets(['past', 'present'], defaultPresets)}
      />
      <div style={{ marginTop: 8, fontSize: 12 }}>
        Start: {startMs ?? 'unset'} — End: {endMs ?? 'unset'}
      </div>
      <Form.Button primary style={{ marginTop: 12 }}>
        Run report
      </Form.Button>
    </Form>
  );
}
```

Notes

- When presets are provided, the dropdown selects and writes the corresponding range.
- Use `filterPresets` to trim the preset list (e.g., hide future windows).
