# Development Plan (STAN TODO)
When updated: 2025-09-10T00:00:00Z

## Next up
- Expand negative-path tests (validation and error label rendering)
  for HookForm components (e.g., min/max for Numeric, invalid phone).
- Add small unit tests for utility helpers if desired
  (concatClassNames, PrefixedPartial.deprefix).
- Cross-browser sanity checks in playground as needed.

## Completed (recent)

- Docs refresh for release readiness:
  - Rewrite README to reflect Hook Form Semantic purpose, components,
    install matrix, CSS, quick start, tests, playground, and ESM notes.
  - Update typedoc.json hostedBaseUrl and GitHub links to this repo.
  - Keep CHANGELOG and scripts as-is; no code changes required.

- Fix failing tests:
  - HookFormField: function-child calls `field.onChange` with both event
    and `{ value }` data (Semantic UI signature) to avoid undefined value.  - HookFormPhone: await RHF state update with `waitFor` before asserting.

- Fix test infra and types:
  - Rename vitest.setup.ts → vitest.setup.tsx and update vitest.config.ts.
  - Remove setup from tsconfig include to avoid build/typecheck churn.
  - Rework mocks without `any`; add typed stubs for external widgets.  - Remove `any` from tests; correct DateRange presets typing.
- Add comprehensive tests for HookForm components:
  - HookFormField (function child mapping, error propagation)
  - HookFormCheckbox (toggle via control labels, error)
  - HookFormNumeric (onValueChange → RHF number)
  - HookFormPhone (input + placeholder mask)
  - HookFormDatePicker (date set + include time toggle)
  - HookFormDateRangePicker (set range + presets)
  - HookFormMenu (item selection)
  - HookFormMenuDisplayMode (mode selection)
  - HookFormSort (field select + direction toggle)
  - HookFormJsonEditor, HookFormWysiwygEditor (content change wiring)