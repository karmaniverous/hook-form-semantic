# RRStack — Development Plan

When updated: 2025-10-05 (UTC)

Next up (near‑term, prioritized)

1. Semantic validation (compile-time) — BYSETPOS set selection
   - Implement semanticOptionsValidator with multiplicity heuristics by FREQ: • YEARLY/MONTHLY/WEEKLY/DAILY/HOURLY/MINUTELY/SECONDLY (see requirements).  
     • Throw 'BYSETPOS_WITHOUT_SET' with meta { freq, tz, unit, lengths }.
   - Acceptance: • Targeted unit tests for each frequency case that should error.  
     • No false positives for legitimate multi-candidate rules (e.g., monthly byweekday).

2. Non-overlap validation — duration < shortest inter‑start period
   - For YEARLY/MONTHLY/WEEKLY/DAILY: • Enumerate starts with conservative sampling (years/months/weeks/days) in the rule tz.  
     • Compute min gap; enforce duration < min gap.  
     • Skip sub‑daily freqs for this validator (documented).
   - Acceptance: • Tests across TZ/DST edges (spring forward/fall back).  
     • Clamps/count limiting series → treated as no overlap (Infinity).  
     • Clear error payload 'DURATION_EXCEEDS_SHORTEST_PERIOD' with meta (duration, shortestPeriod, samples).

3. Error taxonomy & aggregation
   - Define/export error types & predicates: • RRStackError union, RRStackZodError, RRStackCompileError, RRStackCompileAggregateError, RRStackRuntimeError.  
     • isRRStackError\*, predicates.
   - Wrap zod errors (constructor/update) to RRStackZodError.
   - Aggregate per‑rule compile errors in RRStack.recompile and throw RRStackCompileAggregateError.
   - Acceptance: • Unit tests for wrapping, aggregation (multiple rules) with ruleIndex attributions.

4. React hook error surfacing
   - Add error?: RRStackError | RRStackCompileAggregateError | null to useRRStack output.
   - On ingestion/commit error: set error and suppress onChange; clear error on next successful commit.
   - Acceptance: • Tests simulating broken → fixed → broken sequences verify error state transitions.  
     • Docs update in Handbook (React) with usage snippet.

5. Docs & examples
   - Requirements doc: integrated validation & error taxonomy (this change).
   - Handbook/README: • Add “Validation & Errors” section (BYSETPOS, duration, hook error).  
     • Show UI mapping via predicates and meta for friendly copy.
   - Acceptance: • Docs build succeeds; examples compile in TypeDoc playground.

6. Nice‑to‑have (post‑merge)
   - Optional onError callback in useRRStack for imperative error routing (not required now).
   - Add lightweight helper to format common compile errors (copy strings).

Completed (recent)

- Docs: descriptions/bounds formatting
  - README “Rule description helpers”: corrected default (includeTimeZone is opt‑in) and added boundsFormat example.
  - Handbook “Descriptions”: added a short boundsFormat section with examples.

- DescribeOptions bounds formatting:
  - Added `boundsFormat?: string` to DescribeOptions; when provided, bounds use Luxon `toFormat(boundsFormat)` in the rule’s timezone; otherwise ISO formatting is preserved. Added tests (span/recurring).

- Time conversion utilities (DST normalization fix):
  - Treat Luxon’s normalized invalid wall times as invalid; probe successive minutes to map spring‑forward gaps (e.g., 02:30 → 03:00). All tests green. Exported wallTimeToEpoch/dateOnlyToEpoch/epochToWallDate with TSDoc and README/Handbook coverage.
