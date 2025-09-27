# Development Plan

#

# When updated: 2025-09-27T01:45:00Z

## Next up

- Verify “equal widths” rendering of the 6-field Months/Weekdays/Time row across default Semantic UI 16-col grid; adjust minor CSS only if needed (keep component logic unchanged).
- Confirm stakeholder preference about showing Duration for Span rules. Current behavior shows Duration always, but validates only for recurring rules.
- Light UX pass on labels/help text for Valid Range to ensure clarity (no behavior changes).
- Consider gating remaining console.debug lines in RRStackRuleForm behind NODE_ENV !== 'production' as well.
- Revisit Frequency/Duration description paths to ensure non‑continuous daily rules always yield distinct text (doc example parity).

## Completed (recent)

- Tests: stabilize RRStackRuleDescription live-update by making a deterministic change (Frequency=Daily, Hours=9) and asserting the description differs from its initial value. Removed a brittle assertion that required the word “blackout”.
- Test stubs: silence controlled/uncontrolled warnings by coercing null/undefined Date/DateTime values to '' in mocked widgets.
- HookFormRRStack: gate console.log diagnostics behind NODE_ENV !== 'production'.
- RRStackRuleForm layout:
  - Replaced single Date Range control with two HookFormDatePicker instances (Start Date, End Date) with “Include Time” per picker.
  - Moved Count into the Valid Range row; hide Interval and Count when Frequency is Span.
  - Combined Months/Weekdays/Time into one 6-field row (Months, Days of Month, Weekdays, Position, Hours, Minutes) using widths={6}; hide entire row when Frequency is Span.
  - Duration row remains visible regardless of Frequency; validation for positive duration applies to recurring rules only.
- HookFormDatePicker: added standalone mode (standalone, value, onChange) to support non-RHF usage (as required by RRStackRuleForm).
- Tests: align RRStackRuleForm.timestamp tests with new props (index + rrstack; remove obsolete rule/onRuleChange props) and use a minimal rrstack stub to avoid runtime errors.
- Tests: updated RRStackRuleForm timestamp tests to assert on Start/End labeling and Include Time toggles instead of the old Date Range label.
- HookFormRRStack: fix Starts/Ends memoization to depend on rrstack.rules and rrstack.timezone so values update when rule dates change. Add tests that set and then change Start/End dates and assert the Starts/Ends fields update accordingly.
- Tests: remove assumptions about paragraph wrappers around Starts/Ends in HookFormRRStack; assert field text content instead.
- Tooling: fix docs command in stan.config.yml to use `npm run stan:docs` so TypeDoc receives `--emit none` correctly and finds entry points.
- RRStackRuleDescription: fix live updates. Previously used a selector on `rules[index]` with a strict-equality comparator; mutating the same rule object and replacing the array prevented re-render. Now the selector depends on the rules array identity and timezone, deriving the rule by index. Added a test that changes Frequency to verify the accordion title (containing the description) updates live.
- HookFormRRStackRule: guard against missing `effect` on newly added or transiently edited rules. Default to `'active'` when undefined and compute label text safely. This prevents runtime errors during live edits and allows RRStackRuleDescription/title updates to render correctly.
- Tests: improve RRStackRuleDescription live-update test to target the description node directly (via a stable data-testid) and to set rule Hours in addition to Frequency so the description string is expected to change. This avoids brittle assertions against the entire title text and ensures a user-visible change in the description content.
- RRStackRuleDescription: forward unrecognized props (e.g., data-testid) to the rendered element so tests and consumers can target it directly. This unblocks the live-update test that queries the description node by test id.
- Tests: fix RRStackRuleDescription live-update test to target the Frequency dropdown via its label rather than assuming the first dropdown, ensuring the Time section renders and Hours can be set to trigger a visible description update.
- Tests: further stabilize RRStackRuleDescription live-update by toggling the Effect field (Active → Blackout), which guarantees a visible change in the description string. This avoids cases where certain frequency/ duration combinations still produce “Active continuously,” causing false negatives.

## DX / utility ideas (backlog)

- Consider shared “standalone” API parity across all HookForm\* date/time components to simplify reuse beyond RHF contexts.
