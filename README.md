# Hook Form Semantic — React Hook Form + Semantic UI React components

[![npm version](https://img.shields.io/npm/v/@karmaniverous/hook-form-semantic.svg)](https://www.npmjs.com/package/@karmaniverous/hook-form-semantic) ![Node Current](https://img.shields.io/node/v/@karmaniverous/hook-form-semantic) <!-- TYPEDOC_EXCLUDE --> [![docs](https://img.shields.io/badge/docs-website-blue)](https://docs.karmanivero.us/hook-form-semantic) [![changelog](https://img.shields.io/badge/changelog-latest-blue.svg)](./CHANGELOG.md)<!-- /TYPEDOC_EXCLUDE --> [![license](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](./LICENSE)

Production‑ready [React Hook Form](https://react-hook-form.com) (RHF) field components built on [Semantic UI React](https://react.semantic-ui.com). Quickly wire up common inputs — phone, date/time, date ranges, numeric, JSON editor, WYSIWYG, sort, menus — with consistent error handling and semantics that match RHF and Semantic UI.

Highlights

- React 18 + TypeScript, ESM‑only build
- First‑class RHF integration (Controller‑based wiring)
- Semantic UI React props passthrough for familiar DX
- Batteries included: date/time, ranges, numeric, phone, JSON editor, WYSIWYG, sort/menu utilities
- [Vite](https://vitejs.dev) playground for live testing; [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit tests

Contents

- [Installation](#installation)
- [CSS](#css-import-what-you-use) (what to import)
- [Quick start](#quick-start)
- [Components overview](#components-overview-mini-examples) (mini examples)
- [Playground](#playground)
- [Tests](#tests)
- [Build & publish](#build--publish)
- [API docs](#api-docs-typedoc) (TypeDoc)
- [FAQ](#faq)

---

## Installation

Core peer dependencies (always install in your app)

```bash
npm i @karmaniverous/hook-form-semantic react react-dom react-hook-form semantic-ui-react semantic-ui-css
```

Install peers per component you use

- Numeric input (HookFormNumeric)  - [react-number-format](https://www.npmjs.com/package/react-number-format)
- Phone input (HookFormPhone)
  - [react-international-phone](https://www.npmjs.com/package/react-international-phone) [google-libphonenumber](https://www.npmjs.com/package/google-libphonenumber) [react-responsive](https://www.npmjs.com/package/react-responsive)
- Date & DateTime (HookFormDatePicker)
  - [react-date-picker](https://www.npmjs.com/package/react-date-picker) [react-datetime-picker](https://www.npmjs.com/package/react-datetime-picker) [react-calendar](https://www.npmjs.com/package/react-calendar) [react-clock](https://www.npmjs.com/package/react-clock)
- Date range & DateTime range (HookFormDateRangePicker)
  - [@wojtekmaj/react-daterange-picker](https://www.npmjs.com/package/@wojtekmaj/react-daterange-picker) [@wojtekmaj/react-datetimerange-picker](https://www.npmjs.com/package/@wojtekmaj/react-datetimerange-picker) [react-calendar](https://www.npmjs.com/package/react-calendar) [react-clock](https://www.npmjs.com/package/react-clock)
- RRStack (HookFormRRStack)
  - [@karmaniverous/rrstack](https://www.npmjs.com/package/@karmaniverous/rrstack)
- WYSIWYG (HookFormWysiwygEditor)
  - [react-draft-wysiwyg](https://www.npmjs.com/package/react-draft-wysiwyg) [draft-js](https://www.npmjs.com/package/draft-js) [html-to-draftjs](https://www.npmjs.com/package/html-to-draftjs) [draftjs-to-html](https://www.npmjs.com/package/draftjs-to-html)
- JSON editor (HookFormJsonEditor)
  - [vanilla-jsoneditor](https://www.npmjs.com/package/vanilla-jsoneditor)
Examples

```bash
# Phone + Numeric + Date
npm i react-international-phone google-libphonenumber react-responsive react-number-format react-date-picker react-datetime-picker react-calendar react-clock

# Date range
npm i @wojtekmaj/react-daterange-picker @wojtekmaj/react-datetimerange-picker react-calendar react-clock

# WYSIWYG
npm i react-draft-wysiwyg draft-js html-to-draftjs draftjs-to-html

# JSON editor
npm i vanilla-jsoneditor

# RRStack
npm i @karmaniverous/rrstack
```

ESM only
- This package ships ESM only. Most modern toolchains (Vite, Next, CRA v5+, Rollup, Webpack 5) work out of the box.

## CSS (import what you use)

Add the relevant styles (typically once in your app entry):

```ts
import 'semantic-ui-css/semantic.min.css';
// Date/time + calendar
import 'react-date-picker/dist/DatePicker.css';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
// Date range pickers
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import '@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css';
// WYSIWYG
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
// JSON editor (theme optional)
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
```

Only import the styles for components you actually use.

---

## Quick start

```tsx
import { useForm } from 'react-hook-form';
import { Input } from 'semantic-ui-react';
import {
  HookFormField,
  HookFormPhone,
  HookFormDatePicker,
} from '@karmaniverous/hook-form-semantic';

type FormData = { name: string; phone: string; birthDate: Date | null };

export default function Example() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { name: '', phone: '', birthDate: null },
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <HookFormField<FormData, { value: string }>
        control={Input}
        hookControl={control}
        hookName="name"
        label="Name"
        placeholder="Your name"
      />

      <HookFormPhone<FormData>
        hookControl={control}
        hookName="phone"
        label="Phone"
        phoneDefaultCountry="us"
      />

      <HookFormDatePicker<FormData>
        hookControl={control}
        hookName="birthDate"
        label="Birth date"
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Components overview (mini examples)

All components use RHF Controller wiring and propagate Semantic UI‑style errors. Pass Semantic UI props via the component’s prefixed prop groups (e.g., `menu*`, `dropdown*`) or directly where noted.

- HookFormField
  - Generic wrapper for any input/control. Use `control={Input}` for simple cases or function‑as‑child for custom mapping.
  - Example (function child mapping checked/value):

```tsx
<HookFormField<MyForm, { checked: boolean }>
  hookControl={control}
  hookName="subscribed"
  label="Subscribed"
>
  {(field) => (
    <input
      type="checkbox"
      checked={!!(field as { checked?: boolean }).checked}
      onChange={(e) => field.onChange(e, { checked: e.currentTarget.checked })}
    />
  )}
</HookFormField>
```

- HookFormNumeric
  - Numeric input using react-number-format with Semantic UI Input.
  - Example:

```tsx
<HookFormNumeric<MyForm>
  hookControl={control}
  hookName="age"
  label="Age"
  numericAllowNegative={false}
  numericDecimalScale={0}
/>
```

- HookFormPhone
  - International phone input using react-international-phone with validation via google-libphonenumber.
  - Example:

```tsx
<HookFormPhone<MyForm>
  hookControl={control}
  hookName="phone"
  label="Phone"
  phoneDefaultCountry="us"
/>
```

- HookFormDatePicker
  - Single date with optional “Include Time” toggle (react-date-picker / react-datetime-picker).
  - Example:

```tsx
<HookFormDatePicker<MyForm>
  hookControl={control}
  hookName="birthDate"
  label="Birth date"
/>
```

- HookFormDateRangePicker
  - Date or datetime ranges with presets.
  - Utilities exported: `defaultPresets`, `filterPresets`, `extractTimestamps`.
  - Example:

```tsx
import {
  HookFormDateRangePicker,
  defaultPresets,
  filterPresets,
} from '@karmaniverous/hook-form-semantic';

<HookFormDateRangePicker<MyForm>
  hookControl={control}
  hookName="range"
  label="Range"
  presets={filterPresets(['past', 'present'], defaultPresets)}
/>;
```

- HookFormMenu / HookFormMenuDisplayMode
  - Menu selection control; the DisplayMode variant ships a prebuilt “Cards/Table” selector.

```tsx
<HookFormMenuDisplayMode<MyForm> hookControl={control} hookName="mode" />
```

- HookFormSort
  - Dropdown + button to manage `[field, ascending]` tuple semantics.

```tsx
<HookFormSort<MyForm>
  hookControl={control}
  hookName="sort"
  label="Sort"
  dropdownOptions={[
    { key: 'name', text: 'Name', value: 'name' },
    { key: 'date', text: 'Date Created', value: 'date' },
  ]}
/>
```

- HookFormWysiwygEditor
  - Rich text editor (react-draft-wysiwyg); returns HTML string to RHF.

```tsx
<HookFormWysiwygEditor<MyForm>
  hookControl={control}
  hookName="content"
  label="Content"
/>
```

- HookFormJsonEditor
  - Vanilla JSON Editor integration; accepts/returns either JSON object or text.

```tsx
<HookFormJsonEditor<MyForm>
  hookControl={control}
  hookName="jsonData"
  label="JSON"
/>
```

---

## Playground

A Vite playground is included for quick browser testing with HMR.

```bash
npm run dev       # http://localhost:5173
npm run preview   # production preview
```

The playground imports components directly from `src/` (no publish needed). See `playground/src/App.tsx`.

---

## Tests

[Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [jest-dom](https://github.com/testing-library/jest-dom) in a [happy-dom](https://www.npmjs.com/package/happy-dom) environment.

```bash
npm run test        # run once with coverage (v8)
npm run test:watch  # watch mode
npm run test:ui     # Vitest UI
```

---

## Build & publish

```bash
npm run build   # ESM modules to dist/mjs + types to dist/index.d.ts
```

Externalized peer deps: `react`, `react-dom`, `react/jsx-runtime`, and others listed in package.json (install in your app).

Optional release automation (release‑it) is configured. See scripts in package.json.

---

## API docs (TypeDoc)

```bash
npm run docs
```

Outputs static docs in `docs/` (config in `typedoc.json`). Hosted docs: [docs.karmanivero.us/hook-form-semantic](https://docs.karmanivero.us/hook-form-semantic)

---

## FAQ

- Why ESM only?
  - Smaller surface area and simpler builds. Most modern bundlers work natively.
- Do I need all peer dependencies?
  - No. Install the peers for only the components you use (see “Install peers per component”).
- Styling?
  - Import Semantic UI CSS and any widget CSS you use (date pickers, WYSIWYG, JSON editor).

---

Built for you with ❤️ on Bali! Find more great tools & templates on [my GitHub Profile](https://github.com/karmaniverous).
