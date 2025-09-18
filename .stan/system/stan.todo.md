# Development Plan (STAN TODO)
When updated: 2025-09-18T00:00:00Z

## Next up
- Decompose HookFormRRStack.tsx (>300 LOC) into cohesive submodules:
  - components/rrstack/RuleCard.tsx (render + actions)
  - components/rrstack/RuleEditor.tsx (edit/add form)
  - components/rrstack/options.ts (frequency/effect/month/position lists)
  Add co-located tests for each unit.
- Expand RRStack negative-path tests: invalid timezone selection, invalid
  by* array entries, move operations edge cases (top/bottom at bounds).
- Silence test-only warnings by updating semantic-ui-react doubles to
  forwardRef and filter DOM-unsafe props (low priority).
- Consider addressing the TypeDoc “Presets … not included” warning by
  adjusting visibility or explicit exports (low priority).
- Expand negative-path tests (validation and error label rendering) for
  other HookForm components (e.g., min/max for Numeric, invalid phone).
- Add small unit tests for utility helpers if desired (concatClassNames,
  PrefixedPartial.deprefix).
- Cross-browser sanity checks in playground as needed.

## Completed (recent)

- Align HookFormRRStack with house patterns:
  - Wrap with Form.Field, propagate FormFieldProps, add hook-form-rrstack
    class; show RHF errors via Label and Form.Field error prop.
- Fix ref-spread warnings:
  - HookFormMenu/HookFormSort: omit ref when spreading hookFieldProps
    into Form.Field.
- Add repo-specific standards in .stan/system/stan.project.md.

- Fix TypeScript/linting in core components:
  - HookFormField: replace isFunction with typeof check; remove explicit
    any in onChange bridge.  - HookFormMenu: narrow items to MenuItemProps and guard nullables.
  - HookFormPhone: use radash omit with array keys; drop unused param.
- Remove lodash and adopt radash:
  - Replaced lodash usage with radash or native TS/JS across components.
  - Rewrote internal helpers (PrefixedPartial.deprefix,
    offsetTruncatedDate) to remove lodash.
  - Updated package.json (drop peer lodash, remove @types/lodash, add    radash dependency).
  - Updated README install instructions to remove lodash mention.


- Docs refresh for release readiness:
  - Rewrite README to reflect Hook Form Semantic purpose, components,
    install matrix, CSS, quick start, tests, playground, and ESM notes.
  - Update typedoc.json hostedBaseUrl and GitHub links to this repo.  - Keep CHANGELOG and scripts as-is; no code changes required.

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