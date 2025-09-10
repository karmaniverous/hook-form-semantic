# Hook Form Components

> **React Hook Form components with Semantic UI React integration - date pickers, WYSIWYG editor, phone input, JSON editor, and more.**

[![npm version](https://img.shields.io/npm/v/@karmaniverous/hook-form-semantic.svg)](https://www.npmjs.com/package/@karmaniverous/hook-form-semantic) ![Node Current](https://img.shields.io/node/v/@karmaniverous/hook-form-semantic) [![license](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](https://github.com/karmaniverous/hook-form-semantic/tree/main/LICENSE.md)

A comprehensive collection of React Hook Form components built with Semantic UI React. These components provide seamless integration between React Hook Form's powerful validation and Semantic UI's beautiful interface components.

## Features

- 🎯 **Type-safe** - Full TypeScript support with proper type inference
- 🎣 **React Hook Form integration** - Built specifically for React Hook Form patterns
- 🎨 **Semantic UI styling** - Consistent with Semantic UI React design system
- 📱 **Mobile responsive** - Components work great on all screen sizes
- 🌐 **Internationalization** - Phone number validation with international support
- ♿ **Accessible** - Following WAI-ARIA guidelines
- 📦 **Tree-shakeable** - Import only what you need

## Components

### Form Controls
- **HookFormField** - Text input with validation
- **HookFormCheckbox** - Checkbox with form integration
- **HookFormNumeric** - Number input with formatting
- **HookFormPhone** - International phone number input
- **HookFormMenu** - Dropdown/select component

### Date & Time
- **HookFormDatePicker** - Single date selection
- **HookFormDateRangePicker** - Date range selection with presets

### Rich Content
- **HookFormWysiwygEditor** - WYSIWYG editor with Draft.js
- **HookFormJsonEditor** - JSON editor with syntax highlighting

### Utilities
- **HookFormSort** - Sortable list component
- **HookFormMenuDisplayMode** - Display mode selector

## Installation

```bash
npm install @karmaniverous/hook-form-semantic
```

### Peer Dependencies

This library requires the following peer dependencies:

```bash
npm install react react-dom react-hook-form semantic-ui-react semantic-ui-css
```

For specific components, you may also need:

```bash
# For date components
npm install @wojtekmaj/react-daterange-picker @wojtekmaj/react-datetimerange-picker

# For WYSIWYG editor
npm install draft-js draftjs-to-html html-to-draftjs react-draft-wysiwyg

# For phone input
npm install google-libphonenumber react-international-phone

# For JSON editor
npm install vanilla-jsoneditor

# Other utilities
npm install lodash react-number-format react-responsive
```

## Usage

### Basic Example

```tsx
import { useForm } from 'react-hook-form';
import { HookFormField, HookFormDatePicker } from '@karmaniverous/hook-form-semantic';

interface FormData {
  name: string;
  birthDate: string;
}

export function MyForm() {
  const { control, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <HookFormField
        control={control}
        name="name"
        label="Full Name"
        rules={{ required: 'Name is required' }}
      />
      
      <HookFormDatePicker
        control={control}
        name="birthDate"
        label="Birth Date"
        rules={{ required: 'Birth date is required' }}
      />
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### WYSIWYG Editor

```tsx
import { HookFormWysiwygEditor } from '@karmaniverous/hook-form-semantic';

<HookFormWysiwygEditor
  control={control}
  name="content"
  label="Content"
  placeholder="Enter your content here..."
/>
```

### Phone Number Input

```tsx
import { HookFormPhone } from '@karmaniverous/hook-form-semantic';

<HookFormPhone
  control={control}
  name="phone"
  label="Phone Number"
  rules={{ required: 'Phone number is required' }}
/>
```

### Date Range Picker

```tsx
import { HookFormDateRangePicker, defaultPresets } from '@karmaniverous/hook-form-semantic';

<HookFormDateRangePicker
  control={control}
  name="dateRange"
  label="Select Date Range"
  presets={defaultPresets}
/>
```

## CSS Import

Don't forget to import the required CSS in your application:

```tsx
// In your main App.tsx or index.tsx
import 'semantic-ui-css/semantic.min.css';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import '@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import 'react-date-picker/dist/DatePicker.css';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
```

## Development

```bash
# Install dependencies
npm install

# Start development playground
npm run dev

# Run tests
npm run test

# Build library
npm run build

# Generate documentation
npm run docs
```

## License

BSD-3-Clause

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ by [Jason Williscroft](https://github.com/karmaniverous)