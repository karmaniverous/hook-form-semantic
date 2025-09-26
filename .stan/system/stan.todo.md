# Development Plan
#
# When updated: 2025-09-26T00:00:00Z

## Next up

- Verify “equal widths” rendering of the 6-field Months/Weekdays/Time
  row across default Semantic UI 16-col grid; adjust minor CSS only if
  needed (keep component logic unchanged).
- Confirm stakeholder preference about showing Duration for Span rules.
  Current behavior shows Duration always, but validates only for
  recurring rules.
- Light UX pass on labels/help text for Valid Range to ensure clarity
  (no behavior changes).

## Completed (recent)

- RRStackRuleForm layout:
  - Replaced single Date Range control with two HookFormDatePicker
    instances (Start Date, End Date) with “Include Time” per picker.
  - Moved Count into the Valid Range row; hide Interval and Count when
    Frequency is Span.
  - Combined Months/Weekdays/Time into one 6-field row (Months, Days of
    Month, Weekdays, Position, Hours, Minutes) using widths={6}; hide
    entire row when Frequency is Span.
  - Duration row remains visible regardless of Frequency; validation for
    positive duration applies to recurring rules only.
- HookFormDatePicker: added standalone mode (standalone, value,
  onChange) to support non-RHF usage (as required by RRStackRuleForm).
- Tests: updated RRStackRuleForm timestamp tests to assert on Start/End
  labeling and Include Time toggles instead of the old Date Range label.

## DX / utility ideas (backlog)

- Consider shared “standalone” API parity across all HookForm*
  date/time components to simplify reuse beyond RHF contexts.

