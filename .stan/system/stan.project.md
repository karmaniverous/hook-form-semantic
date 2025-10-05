# Assistant instructions — RRStack UI (project prompt)

This document augments the system prompt with repo‑specific assistant guidance. Durable product requirements live in `.stan/system/stan.requirements.md`.

Component naming (displayName) policy

- Library components (HookForm*):
  - Optional: do not add `displayName` universally.
  - Required when React cannot infer a helpful name:
    - forwardRef/memo/HOC/lazy wrappers.
    - Any case that triggers the `react/display-name` rule.
  - Rationale: avoid noise; keep explicit names where DevTools/linting needs them.
- Test doubles/mocks:
  - Always set `displayName` to keep lint clean and error output readable.

Testing policy — React state updates and act()

- Goal: no “not wrapped in act(…)” warnings in CI.
- State‑changing interactions must be contained in one of:
  - `act(() => { …fireEvent… })` or `await act(async () => { … })` for async.
  - userEvent (preferred for click/type), which wraps `act` internally.
  - A `waitFor`/`findBy*` await that observes the resulting change (when the
    interaction is immediately followed by assertions gated on a re‑render).
- Guidance:
  - Prefer Testing Library userEvent for realistic input (click/type/select).
  - For composed interactions, wrap the block in `act` or factor a helper
    (e.g., `actAsync(fn)`).
  - Do not change component behavior to satisfy this; tests own the responsibility
    to await or wrap updates.


## Testing & Benchmarking Policy

- Unit tests and component interaction:
  - Use Vitest + Testing Library (happy-dom). Mocks for semantic-ui-react and third-party widgets live in vitest.setup.tsx.
  - For RRStackRuleDescription, assert that the description text updates when rule settings change via the UI (e.g., Frequency/Hours/Minutes). Avoid brittle expectations that depend on rrstack internal phrasing (bounds/timezone strings are not guaranteed across versions).
  - Stabilize field targeting:
    - getFieldByLabel should find the exact label element and return its closest [data-testid="form-field"] container.
    - Labels may include InfoLabel icons; use “includes” on label text.
    - Await accordion content before querying inside it.
  - Act policy:
    - Wrap state‑changing interactions in `act` or use `userEvent`; alternatively,
      await the resulting render via `waitFor`/`findBy*`. Aim for zero “not wrapped
      in act” warnings.
  - displayName policy:
    - Mocks and wrapped components must set `displayName`; plain named HookForm* components need not.

- HookFormRRStack → RRStackRuleDescription (live updates):
  - Forward describe\* props via HookFormRRStackRule.
  - RRStackRuleDescription derives text by calling `describeRule(value, timezone, timeUnit, { includeBounds, includeTimeZone, formatTimeZone })` with the current RHF rule value and the watched timezone. It MUST recompute on render (do not memoize solely on rrstack identity).

Implementation guardrails

- RHF is the single source of truth. Do not write values back from rrstack into RHF.
- Derive `RRStackOptions` for useRRStack via `useWatch({ control, name, compute })` and feed only what’s needed to render effective bounds (starts/ends) in the parent.
  - Note: `compute` is an official `useWatch` prop (see RHF docs: https://react-hook-form.com/docs/usewatch). Use it to map RHF’s schedule shape to the engine’s `RRStackOptions` without extra effects.
- Rule descriptions should not depend on a live rrstack instance; compute them from the RHF rule value + timezone/timeUnit.

- Benchmarks:
  - Implement benchmarks under src/\*_/_.bench.{ts,tsx}; discovered by Vitest’s benchmark include; excluded from coverage; Knip aware.
  - Drive the UI with Testing Library; do not call rrstack APIs directly.
  - Known console warnings in benches (act/ref) are acceptable for perf runs and stem from mocks/refs. Optionally silence later.

- Coverage:
  - Exclude .bench.\* from coverage; keep existing vitest config as the single source of truth for inclusion/exclusion.
