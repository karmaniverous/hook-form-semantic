# Hook Form Semantic — RRStack UI Requirements

Last updated: 2025-10-02 (UTC)

Purpose

- Define durable, repository-specific requirements for the RRStack UI embedded in this package (HookFormRRStack and related rule-editing components).
- Keep assistant instructions and transient process guidance out of this file (they belong in stan.project.md).

Scope

- React Hook Form UI for editing RRStackOptions JSON.
- Timezone-aware rule editing: span (continuous) and recurring rules (RRULE).
- Live description and effective-bounds display in the parent component.

Authoritative UI layout (HookFormRRStackRuleForm)

- Top row
  - Label (free text)
  - Effect (Active | Blackout)

- Valid Range (section)
  - Start Date (HookFormDatePicker; standalone; returns Date | null; persisted as epoch ms or undefined at options.starts)
  - End Date (HookFormDatePicker; standalone; returns Date | null; persisted as epoch ms or undefined at options.ends)
  - Frequency (Span | Yearly | Monthly | Weekly | Daily | Hourly | Minutely | Secondly). “Span” is modeled as freq = undefined.
  - Interval (number; hidden when Frequency is Span)
  - Count (number; hidden when Frequency is Span)

- Months / Weekdays / Time (section)
  - Single row with 6 equal-width fields (widths={6}):
    1. Months (multi-select)
    2. Days of Month (comma-separated 1–31)
    3. Weekdays (multi-select)
    4. Position (multi-select 1,2,3,4,-1)
    5. Hours (comma-separated 0–23)
    6. Minutes (comma-separated 0–59)
  - Entire section is hidden when Frequency is Span.

- Duration (section)
  - Six equal-width fields (widths={6}): Years, Months, Days, Hours, Min, Sec.
  - Displayed only when Frequency ≠ Span (i.e., for recurring rules).
  - Recurring rules require a strictly positive duration (sum of parts > 0).
  - Span rules must omit duration.

Data modeling (RHF is source of truth; rrstack is derived)

- RHF form value owns the schedule JSON (timezone + rules). The engine is fed from RHF; there is no rrstack→RHF writeback.
- RuleJson.options (engine JSON):
  - starts / ends are epoch timestamps in the configured unit when present.
  - freq is omitted (undefined) to represent a Span rule.
  - interval and count apply only when Frequency is present (recurrence).
  - bymonth, bymonthday, byweekday, bysetpos, byhour, byminute are omitted when empty.

- UI ↔ engine mapping (one way):
  - UI holds dates as Date | null; mapping converts to epoch numbers | undefined for the engine.
  - UI holds hours/minutes/monthdays as tolerant CSV text (e.g., "9, 13"); mapping converts to number[] or omits when empty.
  - UI represents span as options.freq === 'span'; mapping omits freq for the engine.
  - Implementation: useWatch({ control, name, compute }) is used to transform the RHF schedule value into RRStackOptions for useRRStack consumption. No reverse mapping is performed.

- Time unit configuration:
  - The RRStack timeUnit is a component concern (default 'ms'); it is not required to live in the RHF schedule value.
  - If a timeUnit is provided via props, it is applied when constructing the rrstack used for derived outputs (bounds/description).

Default duration (recurring rules)

-- When Frequency changes from Span → recurring, a default duration of { days: 1 } MUST be created if no positive duration exists.

- When Frequency changes from recurring → Span, duration MUST be removed (omitted).
- These defaults are applied via rhf2rrstack during form→engine mapping and reflected back to the form via rrstack2rhf.

Timezone source of truth

- HookFormRRStack does not accept a timezone prop. The RRStack timezone originates from the schedule JSON value and is edited exclusively via the component’s “Timezone” dropdown in the UI.
- Consumers should initialize form default values with a sensible timezone (e.g., browser’s).

Live updates (parent component display)

- Effective bounds (“Starts” / “Ends”)
  - The top-level HookFormRRStack displays “Starts” / “Ends” derived from rrstack.getEffectiveBounds().
  - These values must update live when rules or timezone change.
  - Display format: rrstack.formatInstant(ts, { format: 'yyyy-MM-dd HH:mm:ss' }); “Not Set” when no bound.

- Rule description
  - Each rule’s human-readable description (HookFormRRStackRuleDescription) MUST reflect current settings (effect, frequency, constraints, bounds if toggled).
  - The description text MUST recompute on every render (do not memoize only on rrstack identity).
  - Options:
    - includeTimeZone: false by default.
    - includeBounds: false by default.
    - formatTimeZone?: optional label formatter.

Date components

- HookFormDatePicker supports both RHF and standalone usage; HookFormRRStackRuleForm uses the standalone form for Start/End fields.
- HookFormDateRangePicker is an RHF component (Controller-based) with an “Include Time” toggle and optional presets. (No standalone mode in this repo.)

Validation policy

- Timezone values are validated via RRStack.isValidTimeZone.
- Recurring rules require a positive DurationParts; Span rules must omit duration.
- count/interval are optional but only when Frequency is present; hidden otherwise.

Derived values and visibility rules

- Visibility:
  - Recurrence constraints (Months/DoM/Weekdays/Position/Time) and Duration are visible only when Frequency ≠ Span.
  - Interval and Count are visible only when Frequency ≠ Span.

- Mapping guards:
  - CSV text fields produce number[] or are omitted when parsing yields no valid values.
  - Arrays are omitted from engine JSON when empty.

Performance / UX expectations

- Inputs should debounce internal re-renders appropriately, but final JSON (via rrstack.toJson()) must reflect user edits consistently.
- Description and bounds displays are allowed to lag only within a single debounced frame; they must converge immediately after commit and re-render.

Out of scope

- Per-field merges inside a single rule; the engine replaces the entire rules array when provided.
- Engine-specific algorithmic details (they live in RRStack requirements).

Acceptance criteria

- Switching Frequency from Span → Yearly (or any recurring) shows the Duration section and auto-fills a default duration ({ days: 1 }) when none is present.
- Switching back to Span hides the Duration section and removes duration from JSON.
- Starts/Ends reflect rrstack.getEffectiveBounds() and update when rule Start/End change.
- RuleDescription text changes when Effect, Frequency, Months, Weekdays/Position, or Hours/Minutes are edited.
