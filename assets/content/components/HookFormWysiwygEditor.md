---
title: HookFormWysiwygEditor
---

# HookFormWysiwygEditor

Rich text editor ([react-draft-wysiwyg](https://www.npmjs.com/package/react-draft-wysiwyg)). The component returns an HTML string suitable for rendering or storage.

Value type: `string | null`.

## Example

```tsx
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { HookFormWysiwygEditor } from '@karmaniverous/hook-form-semantic';

type FormData = { body: string | null };

export function ArticleBody() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { body: null },
  });

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <HookFormWysiwygEditor<FormData>
        hookControl={control}
        hookName="body"
        label="Body"
        wysiwygEditorStyle={{ minHeight: 260 }}
        placeholder="Write something great…"
      />
      <Form.Button primary style={{ marginTop: 12 }}>
        Publish
      </Form.Button>
    </Form>
  );
}
```

Notes

- The component lazy-loads the editor for better bundle behavior; it’s safe for client-side apps.
- Store the resulting HTML string or post-process as needed.
