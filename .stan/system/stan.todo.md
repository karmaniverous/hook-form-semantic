# Development Plan

#

# When updated: 2025-09-28T21:50:00Z

## Next up

- Verify “equal widths” rendering of the 6-field Months/Weekdays/Time row across default Semantic UI 16-col grid; adjust minor CSS only if needed (keep component logic unchanged).
- Confirm stakeholder preference about showing Duration for Span rules. Current behavior shows Duration always, but validates only for recurring rules.
- Light UX pass on labels/help text for Valid Range to ensure clarity (no behavior changes).
- Consider gating any remaining console.debug lines in RRStackRuleForm behind NODE_ENV !== 'production' (stray logs removed in this pass).
- Revisit Frequency/Duration description paths to ensure non‑continuous daily rules always yield distinct text (doc example parity).

## Completed (recent)

 - Benchmarks: add Vitest benchmarks for HookFormRRStack component interactions (render, add/move/delete rule, Effect/Frequency/Interval/Count changes, Hours/Minutes & Duration edits, Start/End dates, Timezone). Avoid direct RRStack library benchmarking; measure React component only.
 - RRStack timezone source: remove timezone prop from HookFormRRStack; dropdown/JSON is the source of truth.
 - Playground TS program: add playground/tsconfig.json so VS Code picks up vite-env.d.ts (fix TS2882); root typecheck still ignores playground.
- Tooling/tests: silence ESLint no-unused-vars in picker mocks by adding scoped disable/enable around filtered prop destructuring; remove unused editorState/editorStyle params from WYSIWYG mock forwardRef signature. Lint now clean without altering runtime behavior; tests remain green.
- RRStackRuleDescription: pass includeBounds from HookFormRRStackRule and augment description with concise extras (hours, minutes, positions) so edits are visible immediately.
- RRStackRuleForm: DoM input mirrors Hours/Minutes UX using local state + parseOptions + syncOptions; allows commas/spaces and incomplete tokens; removed stray debug logs.
