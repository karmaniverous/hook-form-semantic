# Project Prompt — Hook Form Semantic

This document records durable repository-specific standards for component
implementation and maintenance. System-wide rules remain in
`.stan/system/stan.system.md`.

## HookForm component patterns (Semantic UI React + RHF)

- Always wrap fields with `Form.Field` and propagate incoming
  `FormFieldProps`. Set `error={error?.message}` to surface RHF errors.
- Display RHF validation messages with a `Label` (basic, red, pointing).
  Keep specialized validation (widget/lib specific) in `Message` blocks
  where helpful to users.
- Use a stable CSS class on the wrapper: `hook-form-<component>` to allow
  theme overrides (see playground CSS).

## RHF wiring

- Use `useController` with generics `T extends FieldValues` and
  `UseControllerProps` for type safety.
- Bridge change handlers by passing a minimal, event-like payload to RHF:
  `hookFieldOnChange({ target: { value } })`. For toggles, pass booleans;
  for numeric controls, pass numbers; for dates, `Date | null` (or ranges).
- When spreading RHF `hookFieldProps` onto function components (e.g.,
  Semantic UI `Form.Field`), omit `ref` and other DOM-incompatible props:
  `omit(hookFieldProps, ['ref'])`.

## Prefixed props convention

- Expose RHF props under the `hook*` prefix via `PrefixedPartial`.
- For third-party controls that accept large prop sets, prefer prefixed
  groups (e.g., `datePicker*`, `timePicker*`, `numeric*`, `phone*`), with
  the component responsible for mapping or forwarding as appropriate.

## File size and decomposition

- Aim to keep modules under ~300 LOC. For larger components, split into
  cohesive submodules (e.g., `RuleEditor`, `RuleCard`, `options.ts`) with
  co-located tests. Record the split plan in `stan.todo.md`.

## Testing

- Co-locate test files (`*.test.tsx`) with their components. Favor concise
  integration tests that exercise RHF wiring and error propagation paths.
- It is acceptable for test doubles to be lightweight; do not let
  double-induced DOM prop warnings drive production code changes.

## Type safety

- Prefer explicit types for values exchanged with RHF (e.g.,
  `Sort<[string | 'auto', boolean]>`, `DateRange`, `RRStackOptions`).
- Avoid `any`. Use module-provided types or narrowed shapes for
  third-party instances when necessary.
