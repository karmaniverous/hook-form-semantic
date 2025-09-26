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

