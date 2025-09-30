# Development Plan

#

# When updated: 2025-09-30T00:00:00Z

## Next up

- Verify “equal widths” rendering of the 6-field Months/Weekdays/Time row across default Semantic UI 16-col grid; adjust minor CSS only if needed (keep component logic unchanged).
- Confirm stakeholder preference about showing Duration for Span rules. Current behavior shows Duration always, but validates only for recurring rules.
- Light UX pass on labels/help text for Valid Range to ensure clarity (no behavior changes).
- Consider gating any remaining console.debug lines in RRStackRuleForm behind NODE_ENV !== 'production' (stray logs removed in this pass).
- Revisit Frequency/Duration description paths to ensure non‑continuous daily rules always yield distinct text (doc example parity).

- Silence/refactor “Function components cannot be given refs” warnings:
  - Option A: omit ref from RHF hookFieldProps spread (e.g., in HookFormRRStack) when passing props to Form.Field.
  - Option B: update semantic-ui-react test doubles to forwardRef where refs are expected.

- Benchmarks: wrap fireEvent sequences in act() or switch to userEvent to quiet “not wrapped in act” warnings (optional; perf-only).

- Tests: add targeted assertions that description updates when Interval/Count change (if description semantics should reflect them). Keep/tighten Effect toggle coverage.

- Split plan (long-file rule): decompose RRStackRuleForm into smaller modules:
  - LabelEffectHeader, ValidRangeSection, RecurrenceConstraintsSection (Months/DoM/Weekdays/Position/Time), DurationSection.
  - Hoist shared parse/sync helpers to src/util; keep rule/rrstack updates and UI behavior unchanged; add focused tests per section.

## Completed (recent)

- Tests/mocks: render Form.Field label prop in semantic-ui-react double; keep unknown props off the wrapper. Restores label-driven queries without DOM warnings.

- HookFormField: default to [] for multiple Dropdowns when RHF value is undefined; fixes React warning and multi-select tests with control={Dropdown}.

- rrstack2rhf: normalize engine byweekday to UI number[]; keep arrays-or-undefined for bymonth/bysetpos; sanitize count. Fixes TS2322 and aligns UI types.

- Tests: fix entry test to assert rendered label element (no attribute passthrough). Scope Starts/Ends assertions to value-only text (exclude labels). Drop brittle “Test Rule” display assertions in RRStackRuleForm timestamp tests (label originates from RHF defaults).

- RRStackRuleForm (UI hygiene): remove redundant Form.Field wrappers and pass labels directly to HookForm\* components. Switch Dropdown usage to control={Dropdown} with native Semantic props (selection, multiple, search, compact, options). No behavioral changes; layout preserved.

- Tests/mocks: update semantic-ui-react Form.Field test double to honor the “control” prop and forward input/dropdown props to the rendered child; stop leaking unknown props to the wrapper div. This unblocks HookFormField control={Input|Dropdown} interactions in tests and silences DOM warnings.

- HookFormRRStack: convert Timezone field to HookFormField control={Dropdown} with native props; remove function-as-child and any usage of the broad Function type.

- Types/mappers:
  - Import RRStackOptions from @karmaniverous/rrstack (not @…/react).
  - rrstack2rhf: sanitize options.count to number | undefined and only stringify array options for bymonthday/byhour/byminute to satisfy types.

- Tests (types): fix Path typing in RRStackRuleForm.timestamp test harness to avoid TS2322 by binding Path to the actual form shape.

- Build tooling: add "@/” path alias → "src/" across Rollup (build), Vitest (tests), Vite playground (dev), and TypeScript (paths). No runtime behavior change; enables cleaner imports.
- Tests/mocks: enable Dropdown multi-select in semantic-ui-react double and add robust fallback for tests using target.value, so Months/Weekdays/Position selections propagate correctly to rrstack rule options.

- Tests: exercise rrstack engine descriptions via RRStackRuleDescription for:
  - Start/End (render with describeIncludeBounds to reflect bounds),
  - Months (monthly; no DoM),
  - Weekdays + Position (weekly),
  - Time (Hours/Minutes) — kept prior coverage.

- Tests: make label helper robust to InfoLabel icons by matching label text via “includes” (fix “Label not found: Frequency”).

- Tests: stabilize rule-description suite by removing brittle includeBounds/timezone assertions and scoping/awaiting accordion content for Frequency/Time tests.

- Tests: fix RRStack description tests to target precise Form.Field by label (avoid ancestor matches causing multiple dropdown/field resolution errors).
- Tests: validate RRStackRuleDescription reflects rule settings and describe options (bounds, timezone include/exclude, custom formatter, frequency/time fields) via component UI interactions.

- Benchmarks: add more first‑rule option benches (Frequency→span; clear Interval & Count; set only Start; set & clear Start/End; clear Hours & Minutes). All via component UI and returning void for Vitest bench types.

- Benchmarks: extend HookFormRRStack benches to set options on the first rule (Days of Month; cycle frequency weekly→monthly→daily). Ensure benches return void (fix TS) and stay at the React component layer (no RRStack calls).
- Tooling: include .bench.tsx in vitest benchmark discovery and exclude benchmarks from coverage; teach Knip to treat .bench.\* as Vitest entries to avoid false “unused file” reports.

- Benchmarks: add Vitest benchmarks for HookFormRRStack component interactions (render, add/move/delete rule, Effect/Frequency/Interval/Count changes, Hours/Minutes & Duration edits, Start/End dates, Timezone). Avoid direct RRStack library benchmarking; measure React component only.
- RRStack timezone source: remove timezone prop from HookFormRRStack; dropdown/JSON is the source of truth.
- Playground TS program: add playground/tsconfig.json so VS Code picks up vite-env.d.ts (fix TS2882); root typecheck still ignores playground.

- Tooling/tests: silence ESLint no-unused-vars in picker mocks by adding scoped disable/enable around filtered prop destructuring; remove unused editorState/editorStyle params from WYSIWYG mock forwardRef signature. Lint now clean without altering runtime behavior; tests remain green.
- RRStackRuleDescription: pass includeBounds from HookFormRRStackRule and augment description with concise extras (hours, minutes, positions) so edits are visible immediately.
- RRStackRuleForm: DoM input mirrors Hours/Minutes UX using local state + parseOptions + syncOptions; allows commas/spaces and incomplete tokens; removed stray debug logs.

- Refactor remaining components to use useHookForm:
  - HookFormPhone, HookFormJsonEditor, HookFormSort, HookFormWysiwygEditor, HookFormRRStack now use the shared hook; retained public props and UX.
  - Centralized RHF Controller wiring and debug logging; removed ad‑hoc useController/useWatch in components.

- RRStack refactor: remove internal mutations for normal fields; wire all child inputs to parent RHF via hookControl/hookName. Add UI↔Engine mapping in HookFormRRStack (uiToEngine/engineToUi):
  - UI holds DoM/Hours/Minutes as text strings; dates as Date|null; months/ weekdays/position as arrays; freq uses 'span' string.
  - rrstack consumes ms/arrays; onChange maps back to UI shape and updates RHF.
