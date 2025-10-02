# Assistant instructions — RRStack UI (project prompt)

This document augments the system prompt with repo‑specific assistant guidance. Durable product requirements live in `.stan/system/stan.requirements.md`.

## Testing & Benchmarking Policy

- Unit tests and component interaction:
  - Use Vitest + Testing Library (happy-dom). Mocks for semantic-ui-react and third-party widgets live in vitest.setup.tsx.
  - For RRStackRuleDescription, assert that the description text updates when rule settings change via the UI (e.g., Frequency/Hours/Minutes). Avoid brittle expectations that depend on rrstack internal phrasing (bounds/timezone strings are not guaranteed across versions).
  - Stabilize field targeting:
    - getFieldByLabel should find the exact label element and return its closest [data-testid="form-field"] container.
    - Labels may include InfoLabel icons; use “includes” on label text.
    - Await accordion content before querying inside it.

- HookFormRRStack → RRStackRuleDescription (live updates):
  - Forward describe* props via HookFormRRStackRule.
  - RRStackRuleDescription derives text from rrstack.describeRule(index, { includeBounds, includeTimeZone, formatTimeZone }) and MUST recompute on render (do not memoize solely on rrstack identity).

- Benchmarks:
  - Implement benchmarks under src/\*_/_.bench.{ts,tsx}; discovered by Vitest’s benchmark include; excluded from coverage; Knip aware.
  - Drive the UI with Testing Library; do not call rrstack APIs directly.
  - Known console warnings in benches (act/ref) are acceptable for perf runs and stem from mocks/refs. Optionally silence later.

- Coverage:
  - Exclude .bench.\* from coverage; keep existing vitest config as the single source of truth for inclusion/exclusion.
