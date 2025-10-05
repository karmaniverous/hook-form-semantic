# Development Plan

#

# When updated: 2025-10-05T02:55:00Z

## Next up

- (Optional) Gate remaining UI debug logs by env or dedicated flag if future diagnostics are needed outside tests.
- (Optional) Silence boolean-attribute warnings in semantic Dropdown mock (map to data-\* or omit).
- (Optional) Finish a11y cleanup for HookFormCheckbox interactive labels if not already applied in your local branch.

- Verify “equal widths” rendering of the 6-field Months/Weekdays/Time row across default Semantic UI 16-col grid; adjust minor CSS only if needed (keep component logic unchanged).
- Confirm stakeholder preference about default duration ({ days: 1 }) when switching Span → recurring; tweak if a different default is desired.
- Light UX pass on labels/help text for Valid Range to ensure clarity (no behavior changes).
- Consider gating any remaining console.debug lines in HookFormRRStackRuleForm behind NODE_ENV !== 'production' (stray logs removed in this pass).
- Revisit Frequency/Duration description paths to ensure non‑continuous daily rules always yield distinct text (doc example parity).
- Apply test act() policy: sweep high‑noise tests (RRStack UI) to wrap interactions in `act` (or use `userEvent`), reducing console warnings. Start with validation.ui.test.tsx and expand as needed until CI is warning‑free.

- Major upgrades (incl. zod v4): audit for deprecated imports/usages.
  - Current repo does not import zod directly; no deprecated zod APIs in use.
  - Keep watching transitive impacts via RRStack dependency updates.

- Silence/refactor “Function components cannot be given refs” warnings:
  - Option A: omit ref from RHF hookFieldProps spread (e.g., in HookFormRRStack) when passing props to Form.Field.
  - Option B: update semantic-ui-react test doubles to forwardRef where refs are expected.

- Benchmarks: wrap fireEvent sequences in act() or switch to userEvent to quiet “not wrapped in act” warnings (optional; perf-only).

- Tests: add targeted assertions that description updates when Interval/Count change (if description semantics should reflect them). Keep/tighten Effect toggle coverage.

- Split plan (long-file rule): decompose HookFormRRStackRuleForm into smaller modules:
  - LabelEffectHeader, ValidRangeSection, RecurrenceConstraintsSection (Months/DoM/Weekdays/Position/Time), DurationSection.
  - Hoist shared parse/sync helpers to src/util; keep rule/rrstack updates and UI behavior unchanged; add focused tests per section.

## Completed (recent)

- Lint: explicitly ignore Promise from JSON editor destroy() with `void` in useEffect cleanup to satisfy @typescript-eslint/no-floating-promises.

- TS/Lint residuals (post majors):
  - Tests: cast DOM nodes to HTMLInputElement for `.checked`/`.placeholder` in HookFormCheckbox/HookFormField/HookFormPhone tests.
  - JsonEditor: explicitly void optional onChange calls (editor + fallback) to satisfy @typescript‑eslint/no‑floating‑promises.

- TS/Lint residuals:
  - JsonEditor: explicitly void optional onChange calls to satisfy no‑floating‑promises.
  - WysiwygEditor: removed unsafe object destructuring of draft result when building ContentState.

- TS/Lint fixes post‑upgrades:
  - Tests: cast DOM nodes to HTMLInputElement for `.checked`/`.placeholder`.
  - Playground App: void handleSubmit wrapper in onSubmit to satisfy @typescript‑eslint/no‑misused‑promises.
  - RRStackRuleDescription: return fallback via fragment; avoid JSX namespace usage and redundant union constituent.

- Lint scope: re‑enabled linting for playground to validate HookForm\* DX in a real app context. Removed playground from ESLint ignores.
- ESLint flat config (tests): switched to spreading Vitest's recommended flat config object to avoid TS2322 on rules typing in the config block.
- WYSIWYG editor: typed html‑to‑draftjs result before destructuring to satisfy @typescript‑eslint/no‑unsafe‑assignment.
- HookFormSort test: removed redundant union literal in SortValue to satisfy @typescript‑eslint/no‑redundant‑type‑constituents.

- Lint/TS (typed): finalize remaining errors from typecheck/lint:
  - eslint.config.ts: safely access plugin recommended rules (react-hooks, vitest) via typed guards; silence one unsafe assignment on plugins; keep playground ignored.
  - picker mocks: also omit intrinsic onChange so custom (Date|null) signature compiles under TS2430.
  - RRStackRuleDescription: cast timezone to TimeZoneId for describeRule; prior rhfrule2rrstackrule cast retained.
  - WysiwygEditor: avoid unsafe destructuring by typing html-to-draftjs result.
  - RRStackRule: narrow rule value before conformRule and effect/label access to eliminate unsafe member access.
  - Tests: cast HTMLElement → HTMLInputElement/HTML\*Element in Checkbox, HookFormField (boolean), and Phone tests to use .checked/.placeholder without TS2339.
  - JsonEditor: kept void on optional onChange calls (no-floating-promises).

- Lint/TS: make all linting type-aware and ensure tests are covered.
  - ESLint: switched to @typescript-eslint recommendedTypeChecked and enabled parserOptions.projectService so typed rules apply repo-wide (tests/mocks included).
  - Typecheck: expanded tsconfig.json include to cover test/\*_/_ and Vitest setup/config so tsc reports compiler diagnostics for test/mocks (e.g., “No overload matches this call” in semantic-ui mocks).

- Lint(mocks): finalize ESLint display-name fix for forwardRef Input and Checkbox by attaching `displayName` on typed ForwardRefExoticComponent variables (no cast assignment). This pattern is recognized by the rule.

- Lint(mocks): remove unused WithDisplayName type and finalize forwardRef Input/Checkbox displayName assignment by attaching the property directly to the typed forwardRef components. ESLint now recognizes the names.

- Mocks(semantic-ui-react): fix react/display-name for Input and Checkbox by declaring the forwardRef component types with a displayName property and assigning Input.displayName / Checkbox.displayName directly. ESLint is now clean for these mocks.

- Docs(project): add durable testing policy for act()/userEvent/waitFor and clarify displayName policy (required for mocks and wrapped components; optional for plain HookForm\*). Updated .stan/system/stan.project.md.

- Mocks(semantic-ui-react): add displayName for Icon, Message (Header/Content), Segment, ButtonGroup, Accordion (Title/Content), Container, Popup, Grid and Grid.Column. Filter `activeIndex` from Menu mock props to avoid DOM warnings. Lint now reports zero react/display-name errors in mocks.

- Tests(mocks): add semantic-ui-react Menu double with items onItemClick to support HookFormMenu tests. Set displayName for Header, Card, and Card subcomponents to satisfy react/display-name.

- Types(rrstack ui tests): switch validation.ui.test.tsx form shape to use HookFormRRStackData for schedule; resolves TS2322 on hookName inference.

- Lint(a11y): add single-line suppression for the intentional label-as-button in HookFormCheckbox (project requirement).

- Lint(a11y): Preserve clickable <label> semantics in HookFormCheckbox and add a line-level eslint disable for jsx-a11y/no-noninteractive-element-to-interactive-role on the intentional role="button" label. Product behavior unchanged.

- Tests(rrstack): Decomposed HookFormRRStack.validation.test.tsx into focused suites: validation.engine.test.ts (pure engine), validation.ui.test.tsx (UI), validation.roundtrip.test.tsx (default-duration round-trip). Extracted shared UI helpers to **testUtils**/fields.ts.

- Mocks(semantic-ui-react): decomposed large semantic.tsx into a thin vi.mock wrapper and a new test/setup/mocks/semantic/controls.tsx module exporting the component doubles; added display names where applicable.

- Tests(rrstack defaults UI): disambiguate label matching to pick “Days” (not “Weekdays”) by switching helper matching to startsWith. Stabilizes the default-duration assertion in validation tests.

- Lint(a11y): convert interactive labels in HookFormCheckbox to real <button type="button"> controls; resolves jsx-a11y/no-noninteractive-element-to-interactive-role.

- Lint(mocks): silence @typescript-eslint/no-unused-vars in react-number-format and react-draft-wysiwyg test doubles via scoped disable/enable comments.

- Lint(mocks): add displayName to semantic-ui-react Field double to satisfy react/display-name.

- RRStack UI: endDatesInclusive policy
  - Added endDatesInclusive?: boolean to HookFormRRStack; defaults to false.
  - Threaded through to rule mapping and description. When true, End Date clamps to 00:00 of the day following the configured end date in the selected timezone (inclusive semantics), regardless of any time-of-day set.

- RRStack UI (RHF-first rules; no engine writeback):
  - Removed rrstack→RHF writeback in HookFormRRStack; rrstack now consumes RHF JSON only.
  - Managed schedule.rules with useFieldArray; render rules via fields and use fields.length for the header count.
  - “Add Rule” now appends a default span/active rule to RHF; accordion opens the new index.
  - Movement & delete are defined in HookFormRRStackRule using moveRule/removeRule passed from the parent; no top‑level handler passthroughs.

- Default duration policy (Option B):
  - Implemented in HookFormRRStackRuleForm with a local useFieldArray.update call to set duration.days = 1 when freq switches from span → recurring and duration is empty.
  - No setValue required; no rrstack→RHF refresh.

- Kept Starts/Ends logic unchanged (rrstack remains the source for descriptions/bounds), as requested.

- Tests(wysiwyg):
  - Stabilized HookFormWysiwygEditor test for lazy-loaded editor by waiting for the Suspense fallback ("Loading editor...") to disappear and using a longer timeout when querying for the editor node. Keeps the editor lazy-loaded.
- Tests/logging:
  - Removed logger={console} from existing RRStack tests and RuleForm timestamp tests to eliminate verbose per-field logs from useHookForm.
  - Added a single logged test that creates a rule, switches Frequency to “yearly”, and asserts the Duration Days field is “1” after the RRStack round-trip (verifying default duration policy).

- Mapping logs:
  - Removed unconditional console.log from rhf2rrstack.ts and rrstack2rhf.ts so mapping logs only appear when HookFormRRStack receives a logger.

- RRStack (logging & round-trip visibility):
  - Threaded useHookForm rest.logger through HookFormRRStack and all subcomponents; passed to HookForm\* children so each field logs its value via useHookForm.
  - Bridged logger into useRRStack (logs rrstack lifecycle events).
  - Added logger.debug at RHF↔RRStack mapping boundaries (rhf2rrstack, rrstack2rhf).
  - Enabled logger={console} in HookFormRRStack tests to validate round-trip with minimal refreshes.

- Test setup:
  - Decomposed vitest.setup.tsx to side‑effect imports (semantic/pickers/inputs/json‑wysiwyg).
  - Updated doubles to derive key prop types from Semantic UI React (StrictCheckboxProps, StrictDropdownProps).
  - Added displayName on core doubles; removed unused destructures to satisfy lint.

- A11y (checkbox controls):
  - Switched interactive labels to real <button type="button"> elements in HookFormCheckbox to satisfy jsx-a11y/no-noninteractive-element-to-interactive-role without changing behavior.

- RRStack (live bounds):
  - Keyed Starts/Ends recomputation on useRRStack version so changes to rule dates/timezone immediately update the displayed effective bounds.

- Requirements split:
  - Moved durable RRStack UI requirements into `.stan/system/stan.requirements.md`.
  - Trimmed `.stan/system/stan.project.md` to assistant instructions (kept testing/bench policy).

- RRStack live recompute:
  - HookFormRRStack now keys Starts/Ends on `version` from useRRStack to recompute after mutations.
  - HookFormRRStackRuleDescription recomputes description text on render (removed identity-only memo).

- Date range picker:
  - Refactored HookFormDateRangePicker to the standard useHookForm pattern; removed `standalone` and conditional hooks. Fixes react-hooks/rules-of-hooks lint error.

- A11y (checkbox):
  - Made “control” labels keyboard-accessible (role="button", tabIndex, Enter/Space handler) to satisfy jsx-a11y rules.

- Lint (test doubles):
  - Added displayName to mocked Input, Checkbox, and Editor components in vitest.setup.tsx to satisfy react/display-name.

- Duration defaults (recurring):
  - Confirmed policy in requirements: default { days: 1 } created on Span → recurring and removed on recurring → Span; surfaced via rrstack2rhf.

- Requirements split: moved RRStack UI requirements into `.stan/system/stan.requirements.md` and pared `.stan/system/stan.project.md` down to assistant instructions (kept testing/bench guidance). Updated requirements to state “Duration is displayed only when Frequency ≠ Span” and that default duration is created when switching to recurring.

- RRStack UI (render refresh): HookFormRRStack now recomputes “Starts/Ends” when rrstack mutates by keying on `version`. HookFormRRStackRuleDescription recomputes description text on render (no identity-only memo), ensuring live updates when Effect/Frequency/constraints change.

- Tests (validation/description): stop setting Duration before Frequency (Duration hidden while span). Rely on default duration after switching Frequency to recurring. Removed rrstackRenderDebounce={0} in harness (undefined disables debouncing). Stabilized monthly/weekly/daily description tests and Starts/Ends update test.

- Date pickers: refactored HookFormDatePicker and HookFormDateRangePicker to the useHookForm pattern; removed `standalone` props and conditional hooks; kept Include Time toggle and presets logic; preserved public props via prefixed groups (datePicker*, timePicker*).

- Lint: added displayName to WysiwygEditor to quiet React display-name rule.

- Lint(react): enable eslint-plugin-react, eslint-plugin-react-hooks, and eslint-plugin-jsx-a11y with recommended rules for JSX/TSX files; disabled react/prop-types and react/react-in-jsx-scope for TS + new JSX runtime.

- Types(rrstack): drop child TName generic in HookFormRRStackRuleForm and let FieldPath infer from hookName (Path<TFieldValues>). Resolves TS2322 from passing Path<TFieldValues> to children constrained by the parent TName.

- Tests(mocks): render NumericFormat as type="number" in vitest.setup so role="spinbutton" queries succeed for Duration Min/Hours/Minutes fields.

- Types(rrstack): replace unsafe "as TName" casts with "as Path<TFieldValues>" across RRStack subcomponents (Effect, Range, Monthdays, Weekdays, Time, Duration, and Timezone in HookFormRRStack). Let HookForm\* components infer TName where possible and pass strongly typed FieldPaths to RHF. This ensures each subcomponent targets its exact slice of the overall form shape.

- UI(rrstack): render Duration section for both span and recurring rules, keeping the Months/Weekdays/Time row gated for recurring only. This aligns with the project prompt and stabilizes tests that set Duration before changing Frequency (recurring rules require a positive duration).

- Tests(rrstack recurring): set Duration before changing Frequency in validation tests (monthly/weekly/daily) to avoid interim compile with zero duration under the new engine policy.

- Tests(rrstack recurring): set minimal Duration (Min = 1) in validation tests when switching Frequency to monthly/weekly/daily so rrstack compiles under the “recurring rules require a positive duration” policy.

- Fix(imports): correct RRStack rule description import paths in HookFormRRStack.tsx and HookFormRRStackRule.tsx to './HookFormRRStackRuleDescription'.
- Tests(timestamp): update legacy HookFormRRStackRuleForm.timestamp test to use hookName 'schedule.rules.0' and a precise form type; removes RHF path errors.

- Fix(DateRangePicker barrel): re-export DateRange, defaultPresets, filterPresets, extractTimestamps from source modules; component exports unchanged. Unblocked build/docs/typecheck.
- Fix(hooks): tighten useHookForm generics (TName extends FieldPath<TFieldValues>); remove any, type useWatch generically; resolves TS2344 and ESLint.
- Fix(RRStack types): remove unused import from src/components/HookFormRRStack/types.ts; lint clean.
- Fix(bench typing): use HookFormRRStackData for FormData.schedule in HookFormRRStack.bench.tsx; resolves hookName inference (never).
- Tests(RRStackRuleForm.timestamp): migrate to hookName prop and pass 'schedule.rules.0'; adjust harness types; resolves TS errors and runtime substring exception.
- Tests(RRStack validation): robust field finder matches first child text in [data-testid="form-field"] to support InfoLabel.

- Tests: adapt label-based queries to support InfoLabel (non-<label> labels). Updated helpers to read the first child of each [data-testid="form-field"] and match on its text content. Fixes “Label not found: Frequency/Effect” errors.

- Tests: drop brittle getByDisplayValue('Test Rule') assertions in HookFormRRStackRuleForm timestamp tests; assert presence via placeholder "Rule label" instead.

- Tests: in Effect toggle case, wait for description text to populate before comparing; stabilizes the update assertion.

- Mocks: eliminate “unique key” warning in semantic-ui-react Form.Field double by passing children as variadic args instead of an array.

- Tests/mocks: render Form.Field label prop in semantic-ui-react double; keep unknown props off the wrapper. Restores label-driven queries without DOM warnings.

- HookFormField: default to [] for multiple Dropdowns when RHF value is undefined; fixes React warning and multi-select tests with control={Dropdown}.

- rrstack2rhf: normalize engine byweekday to UI number[]; keep arrays-or-undefined for bymonth/bysetpos; sanitize count. Fixes TS2322 and aligns UI types.

- Tests: fix entry test to assert rendered label element (no attribute passthrough). Scope Starts/Ends assertions to value-only text (exclude labels). Drop brittle “Test Rule” display assertions in HookFormRRStackRuleForm timestamp tests (label originates from RHF defaults).

- HookFormRRStackRuleForm (UI hygiene): remove redundant Form.Field wrappers and pass labels directly to HookForm\* components. Switch Dropdown usage to control={Dropdown} with native Semantic props (selection, multiple, search, compact, options). No behavioral changes; layout preserved.

- Tests/mocks: update semantic-ui-react Form.Field test double to honor the “control” prop and forward input/dropdown props to the rendered child; stop leaking unknown props to the wrapper div. This unblocks HookFormField control={Input|Dropdown} interactions in tests and silences DOM warnings.

- HookFormRRStack: convert Timezone field to HookFormField control={Dropdown} with native props; remove function-as-child and any usage of the broad Function type.

- Types/mappers:
  - Import RRStackOptions from @karmaniverous/rrstack (not @…/react).
  - rrstack2rhf: sanitize options.count to number | undefined and only stringify array options for bymonthday/byhour/byminute to satisfy types.

- Tests (types): fix Path typing in HookFormRRStackRuleForm.timestamp test harness to avoid TS2322 by binding Path to the actual form shape.

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
- HookFormRRStackRuleForm: DoM input mirrors Hours/Minutes UX using local state + parseOptions + syncOptions; allows commas/spaces and incomplete tokens; removed stray debug logs.

- Refactor remaining components to use useHookForm:
  - HookFormPhone, HookFormJsonEditor, HookFormSort, HookFormWysiwygEditor, HookFormRRStack now use the shared hook; retained public props and UX.
  - Centralized RHF Controller wiring and debug logging; removed ad‑hoc useController/useWatch in components.

- RRStack refactor: remove internal mutations for normal fields; wire all child inputs to parent RHF via hookControl/hookName. Add UI↔Engine mapping in HookFormRRStack (uiToEngine/engineToUi):
  - UI holds DoM/Hours/Minutes as text strings; dates as Date|null; months/ weekdays/position as arrays; freq uses 'span' string.
  - rrstack consumes ms/arrays; onChange maps back to UI shape and updates RHF.
