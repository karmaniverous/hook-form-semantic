# Development Plan (STAN TODO)

When updated: 2025-09-22T17:24:00Z

## Next up
- Decompose HookFormRRStack.tsx (>300 LOC) into cohesive submodules: - components/rrstack/RuleCard.tsx (render + actions) - components/rrstack/RuleEditor.tsx (edit/add form) - components/rrstack/options.ts (frequency/effect/month/position lists) Add co-located tests for each unit.- Expand RRStack negative-path tests: invalid timezone selection, invalid by\* array entries, move operations edge cases (top/bottom at bounds).- Silence test-only warnings by updating semantic-ui-react doubles to forwardRef and filter DOM-unsafe props (low priority).- Consider addressing the TypeDoc “Presets … not included” warning by adjusting visibility or explicit exports (low priority).- Expand negative-path tests (validation and error label rendering) for other HookForm components (e.g., min/max for Numeric, invalid phone).
- Add small unit tests for utility helpers if desired (concatClassNames, PrefixedPartial.deprefix).
- Cross-browser sanity checks in playground as needed.

## Completed (recent)

- Tooling: silence knip optional peers
  - Add all optional peerDependencies to knip.json ignoreDependencies so knip
    doesn’t report them and CI/release isn’t blocked.

- Docs: clarify peer dependencies
  - README: remove `radash` from core peers (it’s a normal dependency).
  - README: add `@karmaniverous/rrstack` under per-component peers (RRStack).  - README: add `react-responsive` to Phone peers; update example install.
  - README: add RRStack example install snippet.
  - Components: mention `@karmaniverous/rrstack` peer in HookFormRRStack doc.
  - Components: note `react-responsive` requirement in HookFormPhone doc.

- Docs polish (final pass)
  - README: fixed Tests code block line break; linked happy-dom.
  - HookFormDateRangePicker: added links to @wojtekmaj date/datetime range pickers.  - HookFormSort: linked Semantic UI React Dropdown and Button docs.
  - Components index: linked RHF and SUIR in intro.
  - Verified no naked links remain in prose (badges excluded).
- Docs link cleanup
  - README: link React Hook Form, Semantic UI React, Vite, Vitest, Testing Library, jest‑dom.
  - Component guides: add SUIR Form/Menu links; link RRStack docs page.
  - Verified no naked links remain in prose across docs (badges excluded by policy; code blocks left intact).

- Components documentation
  - Added external docs under assets/content with one guide per exported component: HookFormField, HookFormCheckbox, HookFormDatePicker, HookFormDateRangePicker, HookFormJsonEditor, HookFormMenu, HookFormMenuDisplayMode, HookFormNumeric, HookFormPhone, HookFormRRStack, HookFormSort, HookFormWysiwygEditor.
  - Created a Components index (assets/content/components.md) with front matter children for sidebar nesting and a bullet list of guides.
  - Updated typedoc.json to list the Components index above CHANGELOG.
- Compact RRStackRuleForm layout and standardize sizing:
  - Single row for Label, Effect, Frequency, Interval.
  - Single row for Hours, Minutes, Weekdays, Position. - Single row for Months, Days of Month, Count.
  - Normalize Inputs to size="small"; use compact Dropdowns.
  - Preserve existing placeholders and labels used by tests.
  - No changes to date pickers beyond label consistency; “Include Time” controls retained.

- Align HookFormRRStack with house patterns:
  - Wrap with Form.Field, propagate FormFieldProps, add hook-form-rrstack class; show RHF errors via Label and Form.Field error prop.
- Fix ref-spread warnings:
  - HookFormMenu/HookFormSort: omit ref when spreading hookFieldProps into Form.Field.
- Add repo-specific standards in .stan/system/stan.project.md.

- Fix TypeScript/linting in core components:
  - HookFormField: replace isFunction with typeof check; remove explicit any in onChange bridge. - HookFormMenu: narrow items to MenuItemProps and guard nullables.
  - HookFormPhone: use radash omit with array keys; drop unused param.
- Remove lodash and adopt radash:
  - Replaced lodash usage with radash or native TS/JS across components.
  - Rewrote internal helpers (PrefixedPartial.deprefix, offsetTruncatedDate) to remove lodash.
  - Updated package.json (drop peer lodash, remove @types/lodash, add radash dependency).
  - Updated README install instructions to remove lodash mention.

- Lint and dependency hygiene
  - Fix ESLint flat-config parse error after switching to @vitest/eslint-plugin (braces were on comment lines and got commented out).

- Dependency policy and docs
  - Make component-specific integrations optional peerDependencies: rrstack, date/time pickers, react-number-format, phone libs, WYSIWYG stack, vanilla-jsoneditor, react-responsive, semantic-ui-css. Keep core host singletons (react, react-dom, react-hook-form, semantic-ui-react) as required peers. Keep rrstack as devDependency to support local tests/docs.
  - Export Presets type to include it in TypeDoc and silence the warning.

- Formatting & TypeDoc cleanup
  - Fix Prettier error in HookFormDateRangePicker (newline between object properties).
  - Re-export Presets from src/index.ts so TypeDoc includes it (removes the “Presets … not included” warning).
- Lint and dependency hygiene
  - Replace deprecated eslint-plugin-vitest with @vitest/eslint-plugin (ESLint 9 flat config).
  - Move @karmaniverous/rrstack back to peerDependency for consumers and keep as devDependency here for build/tests. Tree-shaking reduces bundle size, not install-time; keeping rrstack as a peer avoids forcing installs for consumers who don’t use HookFormRRStack.- Docs refresh for release readiness: - Rewrite README to reflect Hook Form Semantic purpose, components, install matrix, CSS, quick start, tests, playground, and ESM notes. - Update typedoc.json hostedBaseUrl and GitHub links to this repo. - Keep CHANGELOG and scripts as-is; no code changes required.

- Fix failing tests:
  - HookFormField: function-child calls `field.onChange` with both event and `{ value }` data (Semantic UI signature) to avoid undefined value. - HookFormPhone: await RHF state update with `waitFor` before asserting.

- Fix test infra and types:
  - Rename vitest.setup.ts → vitest.setup.tsx and update vitest.config.ts.
  - Remove setup from tsconfig include to avoid build/typecheck churn.
  - Rework mocks without `any`; add typed stubs for external widgets. - Remove `any` from tests; correct DateRange presets typing.
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
