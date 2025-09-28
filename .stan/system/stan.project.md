# Project Requirements — RRStack UI

This document captures durable, repo-specific behavior and layout rules
for the RRStackRuleForm component and related date/time inputs.

## RRStackRuleForm layout (authoritative)

- Top row
  - Label (free text)
  - Effect (Active | Blackout)

- Valid Range (section)
  - Start Date (HookFormDatePicker; standalone; returns Date | null,
    written to options.starts as epoch ms or undefined)
  - End Date (HookFormDatePicker; standalone; returns Date | null,
    written to options.ends as epoch ms or undefined)
  - Frequency (Span | Yearly | Monthly | Weekly | Daily | Hourly |
    Minutely | Secondly). “Span” is modeled as freq = undefined.
  - Interval (number; hidden when Frequency is Span)
  - Count (number; hidden when Frequency is Span)

- Months / Weekdays / Time (section)
  - Single row with 6 equal-width fields (widths={6}):
    1) Months (multi-select)
    2) Days of Month (comma-separated 1–31)
    3) Weekdays (multi-select)
    4) Position (multi-select 1,2,3,4,-1)
    5) Hours (comma-separated 0–23)
    6) Minutes (comma-separated 0–59)
  - Entire section is hidden when Frequency is Span.

- Duration (section)
  - Six equal-width fields (widths={6}): Years, Months, Days, Hours,
    Min, Sec.
  - Displayed for both Span and recurring rules.
  - Validation for having at least one positive component applies only
    to recurring rules; for Span, no duration is required.

## Data modeling (rrstack source of truth)

- RuleJson.options:
  - starts / ends are epoch milliseconds (number) when present.
  - freq is absent (undefined) to represent a Span rule.
  - interval and count are defined and editable only when Frequency is
    present (recurrence).
  - bymonth, bymonthday, byweekday, bysetpos, byhour, byminute are
    optional and omitted when empty.

## Date components — standalone usage

- HookFormDatePicker supports both RHF (hook*) and standalone usage:
  - standalone?: boolean
  - value?: Date | null
  - onChange?: (value: Date | null) => void
  - RRStackRuleForm uses the standalone form.

## Timezone source of truth

- HookFormRRStack does not accept a `timezone` (or `rrstackTimezone`)
  prop. The RRStack timezone originates from the schedule JSON value and
  is edited exclusively via the component’s “Timezone” dropdown in the UI.
- Consumers should initialize the field’s JSON with a sensible default
  timezone (e.g., browser timezone) in their form’s default values. The
  dropdown remains the authoritative editor for the RRStack timezone.

## Testing & Benchmarking Policy

- Unit tests and component interaction:
  - Use Vitest + Testing Library (happy-dom). Mocks for semantic-ui-react
    and third-party widgets live in vitest.setup.tsx.
  - For RRStackRuleDescription, assert that the description text updates
    when rule settings change via the UI (e.g., Frequency/Hours/Minutes).
    Avoid brittle expectations that depend on rrstack internal phrasing
    (bounds/timezone strings are not guaranteed across versions).
  - Stabilize field targeting:
    - getFieldByLabel should find the exact label element and return its
      closest [data-testid="form-field"] container.
    - Labels may include InfoLabel icons; use “includes” on label text.
    - Await accordion content before querying inside it.

- HookFormRRStack → RRStackRuleDescription:
  - HookFormRRStack forwards describe* props to RRStackRuleDescription
    via HookFormRRStackRule.
  - RRStackRuleDescription derives text from
    rrstack.describeRule(index, { includeBounds, includeTimeZone,
    formatTimeZone }) and subscribes to rrstack via
    useRRStackSelector([rules, timezone]) for live updates.

- Benchmarks:
  - Implement benchmarks under src/**/*.bench.{ts,tsx}; discovered by
    Vitest’s benchmark include; excluded from coverage; Knip aware.
  - Drive the UI with Testing Library; do not call rrstack APIs directly.
  - Known console warnings in benches (act/ref) are acceptable for perf
    runs and stem from mocks/refs. Optionally silence later.

- Coverage:
  - Exclude .bench.* from coverage; keep existing vitest config as the
    single source of truth for inclusion/exclusion.
