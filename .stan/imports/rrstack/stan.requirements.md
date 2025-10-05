# RRStack — Requirements

Last updated: 2025-10-05 (UTC)

Purpose

- Define durable, repository-specific requirements for RRStack (timezone‑aware RRULE stacking engine for Node/TypeScript).
- This document captures functional and non‑functional requirements, API surface, algorithms, validation, error taxonomy, packaging, and documentation/testing policies.
- Project-specific assistant instructions live in stan.project.md. The system prompt (stan.system.md) remains repo‑agnostic.

Targets and runtime

- Library runs in both Node and browsers.
- Pure library surface (no I/O side effects); suitable for UI, workers, and server.
- ESM and CJS bundles provided via Rollup; TypeScript typings are included.
- Node engine: >= 20 (per package.json).

Functional scope

- Compose a prioritized stack of time-based rules (rrule + continuous spans) to:
  - Answer point queries: isActiveAt(ms|s) → boolean.
  - Stream contiguous segments of active/blackout status over a window.
  - Classify a whole range as 'active' | 'blackout' | 'partial'.
  - Compute effective active bounds across all rules, including open-sided detection.
- Timezone/DST correctness: all coverage is computed in the rule’s IANA timezone with Luxon for duration arithmetic.
- JSON persistence with round-tripping (toJson()/constructor).
- Minimal React adapter shipped at subpath export ./react.

Public API (core types and shapes)

- RRStackOptions (constructor input/serialized output)
  - version?: string (ignored by constructor for behavior; used by the version pipeline in update(); written by toJson)
  - timezone: string (validated at runtime; narrowed internally)
  - timeUnit?: 'ms' | 's' (default 'ms')
  - defaultEffect?: 'active' | 'blackout' | 'auto' (default 'auto')
  - rules?: RuleJson[] (default [])
- RRStackOptionsNormalized (stored on the instance; frozen)
  - timeUnit: 'ms' | 's'
  - rules: readonly RuleJson[]
  - timezone: TimeZoneId (branded, validated string)
  - defaultEffect: 'active' | 'blackout' | 'auto'
- RuleJson
  - effect: 'active' | 'blackout'
  - duration?: DurationParts (required for recurring rules; must be omitted for spans)
  - options: RuleOptionsJson (JSON-friendly subset of rrule Options)
  - label?: string
- RuleOptionsJson
  - freq?: 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly' | 'minutely' | 'secondly'
  - starts?: number (timestamp in configured unit)
  - ends?: number (timestamp in configured unit)
  - Other RRULE-compatible keys are accepted (dtstart/until/tzid are controlled internally).
- DurationParts (integers; total > 0): years, months, weeks, days, hours, minutes, seconds
- UnixTimeUnit: 'ms' | 's'
- TimeZoneId: branded string (validated IANA zone)

Continuous (span) rules

- Omit options.freq to declare a span rule; duration must be omitted for spans.
- Coverage is continuous across [starts, ends); either side may be open.
- Spans participate in the cascade identically to recurring rules; later rules override earlier coverage at covered instants.

Baseline (defaultEffect)

- RRStack behaves as if a virtual, open-ended span rule is prepended (lowest priority):
  - defaultEffect: 'auto' → opposite of the first rule’s effect, or 'active' when no rules.
  - defaultEffect: 'active' | 'blackout' → exactly that baseline where no rule covers.
- The baseline applies uniformly to isActiveAt, getSegments, classifyRange, and getEffectiveBounds.
- getEffectiveBounds returns open-sided bounds when the baseline is 'active' and no finite active contributors exist.

Units and domain

- All public inputs/outputs (and internal algorithms) operate in the configured unit end-to-end.
- 'ms': millisecond timestamps (Date.now()) + Luxon millisecond methods.
- 's': integer seconds; ends are rounded up to the next integer second to preserve [start, end) with boundary correctness.
- Domain bounds:
  - domainMin() = 0
  - domainMax(unit):
    - 'ms' → 8_640_000_000_000_000 (approx max JS Date)
    - 's' → 8_640_000_000_000
- timeUnit is MUTABLE via RRStack.update(...). When timeUnit changes, the engine converts retained rules’ clamp timestamps (starts/ends) between units before compile; incoming rules provided in the same update are accepted as already expressed in the new unit (no conversion applied to those).

Version handling (ingestion pipeline)

- Effective (engine) version
  - The “current RRStack version” is the engine’s build-time version (**RRSTACK_VERSION**). toJson() always writes that value.
- Version detector and upgrader (front of update pipeline)
  - On every update(), detect the incoming JSON version string (may be missing or invalid).
  - Invoke internal upgradeConfig(from: string | null, to: string, json: RRStackOptions):
    - Today: no-op (returns json unchanged).
    - Purpose: future-proofing for data model changes. It runs on every accepted version mismatch per policy.
- UpdatePolicy (defaults and behavior)
  - onVersionUp: incoming version older than engine version.
    - 'error' | 'warn' | 'off' (default 'off'). Applying is allowed by default; upgrader runs (no-op today).
  - onVersionDown: incoming version newer than engine version.
    - 'error' | 'warn' | 'off' (default 'error'). Default is to reject; if 'warn' or 'off', ingest “as if current version” (treat incoming version as engine version for this update; upgrader is still invoked with (engine→engine)).
  - onVersionInvalid: incoming version not valid semver.
    - 'error' | 'warn' | 'off' (default 'error'). Default reject; if 'warn' or 'off', ingest “as if current version” (invoke upgrader with engine→engine).
  - onTimeUnitChange:
    - 'error' | 'warn' | 'off' (default 'warn'). If 'warn' or 'off', convert retained clamp timestamps prior to applying other replacements (see Unit conversion below).
  - onNotice?: (n: Notice) => void
    - Optional callback invoked for each notice the update() produces.

Update API (single entry point)

- Signature
  - update(partial?: Partial<RRStackOptions>, policy?: UpdatePolicy): readonly Notice[]
- Behavior
  - Applies timezone, defaultEffect, rules, and timeUnit in one pass.
  - Version pipeline executes first; policies can reject or accept with warnings/informational notices.
  - Rules semantics: if rules is provided, it replaces the entire list (no per-rule merge).
  - Recompile exactly once at the end of a successful apply.
  - Returns a readonly array of Notice values; also invokes onNotice (if provided) for each notice in order.

Notices (return type and callback payloads)

- Notice is a discriminated union with stable kinds and levels so hosts can branch or log consistently:

```ts
export type Notice =
  | {
      kind: 'versionUp';
      level: 'error' | 'warn' | 'info';
      from: string | null; // null when missing/invalid
      to: string; // engine version
      action: 'upgrade' | 'rejected' | 'ingestAsCurrent';
      message?: string;
    }
  | {
      kind: 'versionDown';
      level: 'error' | 'warn' | 'info';
      from: string | null;
      to: string; // engine version
      action: 'rejected' | 'ingestAsCurrent';
      message?: string;
    }
  | {
      kind: 'versionInvalid';
      level: 'error' | 'warn' | 'info';
      raw: unknown; // original incoming value
      to: string; // engine version
      action: 'rejected' | 'ingestAsCurrent';
      message?: string;
    }
  | {
      kind: 'timeUnitChange';
      level: 'error' | 'warn' | 'info';
      from: UnixTimeUnit;
      to: UnixTimeUnit;
      action: 'convertedExisting' | 'acceptedIncomingRules' | 'rejected';
      convertedRuleCount?: number;
      replacedRuleCount?: number;
      message?: string;
    };
```

Persistence and version

- toJson() remains the single source of serialized truth:
  - Writes the build-time version (**RRSTACK_VERSION**).
  - Unbrands timezone to a plain string.
  - Clones arrays.
  - In the React façade, overlays staged rules/timezone so autosave receives exactly what the user sees.
- The constructor accepts RRStackOptions with an optional version but does not alter runtime behavior based on it; all version handling occurs in update().

Algorithms (unit/timezone-aware; streaming where applicable)

Point query

- isActiveAt(t): boolean
  - Span: s <= t < e (open sides use domainMin/domainMax)
  - Recurrence: robust coverage via day-window enumeration + structural matches + bounded backward enumeration using rrule and computeOccurrenceEnd in rule tz.

Streaming segments

- getSegments(from, to, { limit? }): Iterable<{ start, end, status }>
  - Streaming, memory-bounded k-way merge over per-rule boundary streams (starts/ends).
  - Ends processed before starts at the same timestamp to preserve last‑wins semantics.
  - Optional limit caps emissions and throws if exceeded (no silent truncation).

Range classification

- classifyRange(from, to): 'active' | 'blackout' | 'partial'
  - Derived via scanning segments; early-exits on mixed coverage.

Effective bounds

- getEffectiveBounds(): { start?: number; end?: number; empty: boolean }
  - Earliest-bound: candidate-filtered small forward sweep; detects open-start when coverage is active at domainMin due to open-start active sources.
  - Open-end detection: O(1) stack inspection — cascade is open-ended iff the last open-ended candidate is an active source (active open span, infinite active recurrence with any start, or active baseline).
  - Latest-bound: finite/local — compute a finite probe (max end across finite contributors) and run a bounded reverse sweep to find the latest active→blackout transition; short‑circuit when applicable. Never scan far-future.

Validation (shape vs semantic) — STRICT

Shape validation (zod)

- zod is used to parse and normalize RRStackOptions and minimal rule constraints:
  - Types, presence, and simple invariants (e.g., DurationParts integers and total > 0).
  - zod does NOT attempt timezone/frequency-aware semantics.

Semantic validation (compile-time; tz/unit/freq-aware)

- Per recurring rule (options.freq present), compile-time validation performs:
  1. Duration non‑positive
     - Duration must be strictly positive. Violations error with code 'DURATION_NON_POSITIVE'.
  2. Duration < shortest inter‑start period (no self‑overlap)
     - For YEARLY/MONTHLY/WEEKLY/DAILY freqs, the rule’s duration must be strictly less than the minimum elapsed time between any two consecutive starts produced by that rule in its timezone (“shortest inter‑start period”).
     - Measure in the configured unit ('ms'|'s') on the real timeline (occurrence starts placed via tzid).
     - Shortest period computation (sampling policy, conservative and bounded): • daily: sample within‑day sets (BYHOUR/BYMINUTE/BYSECOND) and a week’s worth of days.  
       • weekly: sample 8 consecutive weeks.  
       • monthly: sample 24 consecutive months (28/29/30/31-day variance).  
       • yearly: sample 6–8 consecutive years (leap years and weekday positions).  
       • clamps (count/ends) limiting the series to < 2 starts → treat min gap as Infinity (no overlap).
     - Sub‑daily freqs (hourly/minutely/secondly): this validation is not enforced (for now) to avoid unrealistic constraints with integer units; revisit as needed.
     - Violations error with code 'DURATION_EXCEEDS_SHORTEST_PERIOD' and include meta { freq, tz, unit, duration, shortestPeriod, sampledPairs, exampleStarts? }.
  3. Invalid BYSETPOS usage (no real set to select from)
     - BYSETPOS is invalid when, for the current freq and the provided BY\* lists, the per‑period candidate set cannot exceed 1 element; in such cases BYSETPOS would be a no‑op or non‑functional.
     - Multiplicity hints (deterministic, array-length based): • YEARLY: set can exceed 1 iff (bymonth >1) OR (bymonthday >1) OR (byyearday >1) OR (byweekno >1) OR (byweekday non-empty) OR (byhour >1 OR byminute >1 OR bysecond >1).  
       • MONTHLY: set can exceed 1 iff (bymonthday >1) OR (byweekday non-empty) OR (byhour/byminute/bysecond >1).  
       • WEEKLY: set can exceed 1 iff (byweekday >1) OR (byhour/byminute/bysecond >1).  
       • DAILY: set can exceed 1 iff (byhour >1) OR (byminute >1 with fixed hour) OR (bysecond >1 with fixed hour/minute).  
       • HOURLY: set can exceed 1 iff (byminute >1) OR (bysecond >1).  
       • MINUTELY: set can exceed 1 iff (bysecond >1).  
       • SECONDLY: BYSETPOS always invalid (per-second period cannot create multiple candidates).
     - Violations error with code 'BYSETPOS_WITHOUT_SET' and include meta { freq, tz, unit, bymonthLen, bymonthdayLen, byweekdayLen, byhourLen, byminuteLen, bysecondLen }.
  4. Invalid timezone in the host environment
     - Throws 'INVALID_TIME_ZONE'.

Invalid but tolerated combinations

- We do not treat “bymonthday without bymonth” as invalid (it means “that day number in every month”).
- Unusual combinations (e.g., weekly filtered by bymonthday) are allowed; description logic may not render all filters, but the rule remains valid.

Error taxonomy and delivery (frontend‑friendly)

Types (exported)

```ts
// Union
export type RRStackError =
  | RRStackZodError
  | RRStackCompileError
  | RRStackCompileAggregateError
  | RRStackRuntimeError;

// zod errors (shape)
export interface RRStackZodError {
  kind: 'zod';
  message: string;
  issues: Array<{ path: (string | number)[]; message: string; code?: string }>;
}

// compile-time semantic errors (single rule)
export interface RRStackCompileError {
  kind: 'compile';
  code:
    | 'DURATION_NON_POSITIVE'
    | 'DURATION_EXCEEDS_SHORTEST_PERIOD'
    | 'BYSETPOS_WITHOUT_SET'
    | 'INVALID_TIME_ZONE';
  message: string;
  ruleIndex?: number;
  meta?: Record<string, unknown>;
}

// aggregate over multiple rules
export interface RRStackCompileAggregateError {
  kind: 'compile-aggregate';
  message: string;
  errors: RRStackCompileError[]; // each with ruleIndex
}

// everything else
export interface RRStackRuntimeError {
  kind: 'runtime';
  code: string;
  message: string;
  cause?: unknown;
}

// Predicates
export function isRRStackError(e: unknown): e is RRStackError;
export function isRRStackZodError(e: unknown): e is RRStackZodError;
export function isRRStackCompileError(e: unknown): e is RRStackCompileError;
export function isRRStackCompileAggregateError(
  e: unknown,
): e is RRStackCompileAggregateError;
export function isRRStackRuntimeError(e: unknown): e is RRStackRuntimeError;
```

Where errors originate

- zod errors: thrown during options normalization (constructor/update).
- compile errors: thrown during compileRule; RRStack’s recompile step aggregates multiple per‑rule compile errors and throws a single RRStackCompileAggregateError with ruleIndex attributions.
- runtime errors: unexpected exceptions (rare).

React adapter (./react)

- Hooks observe a live RRStack instance without re‑wrapping its control surface:
  - useRRStack({ json, onChange?, resetKey?, policy?, changeDebounce?, mutateDebounce?, renderDebounce?, logger? }) → { rrstack, version, flushChanges, flushMutations, cancelMutations, flushRender, error }
    - error?: RRStackError | RRStackCompileAggregateError | null • Set when ingestion/commit fails; cleared on next successful commit.  
      • onChange is not called when an error occurs.
    - mutateDebounce stages UI edits (rules/timezone) and commits once per window.
    - renderDebounce coalesces paints (optional leading; trailing always true).
    - changeDebounce coalesces autosave calls (trailing always true).
  - useRRStackSelector({ rrstack, selector, isEqual?, renderDebounce?, logger?, resetKey? }) → { selection, version, flushRender }
- Ingestion loop (form → engine)
  - The hook watches the json prop (by comparator ignoring version); when it changes, it invokes rrstack.update(json, policy) (debounced if configured). On commit, it triggers one onChange (debounced if configured).
  - The optional policy applies to both ingestion and staged commits. Use onNotice to surface notices.
  - On errors (zod/compile/runtime), the hook sets error and does not call onChange.

Rule descriptions — pluggable translator and frequency lexicon

Descriptor (AST)

- Build a normalized descriptor from CompiledRule; no rrule objects leak through.
- Base: { kind: 'span' | 'recur', effect, tz, unit, clamps?: { starts?, ends? } }
- Recur: { freq: FrequencyStr, interval: number, duration: DurationParts, by: { months?, monthDays?, yearDays?, weekNos?, weekdays?: Array<{ weekday: 1..7; nth?: ±1..±5 }>, hours?, minutes?, seconds?, setpos?, wkst? }, count?, until? }
- clamps timestamps are in the configured unit; until semantics reflect rrule’s inclusive start.

Translators (pluggable)

- type DescribeTranslator = (desc: RuleDescriptor, opts?: TranslatorOptions) => string
- TranslatorOptions:
  - frequency?: Partial<FrequencyLexicon>
  - timeFormat?: 'hm' | 'hms' | 'auto'
  - hourCycle?: 'h23' | 'h12'
  - ordinals?: 'long' | 'short'
  - locale?: string (Luxon setLocale)
  - lowercase?: boolean
- Built-in strict-en:
  - Literal phrasing with complete constraints where supported.
  - Interval phrasing:
    - interval === 1 → noun form (“every year/month/week/day/hour/minute/second”)
    - interval > 1 → “every N {plural(noun)}”
  - Nth weekday: “on the third tuesday”; last via -1.
  - Time of day via formatLocalTime in rule tz.
  - COUNT/UNTIL appended (“for N occurrences”, “until YYYY‑MM‑DD”).
- Coverage notes
  - Yearly/monthly/weekly/daily have broad coverage; sub-daily freqs render cadence only.

Testing

- Unit tests cover:
  - DST transitions (spring forward/fall back) and duration correctness.
  - Daily start-at-midnight patterns.
  - Odd-month and every-2-month scenarios with blackout/reactivation cascades.
  - Segment sweeps, range classification, and effective bounds (open/closed sides, ties).
  - update(): version policies (up/down/invalid), timeUnit change (retained vs incoming rules), notices and callback invocation.
  - React hooks (debounce behaviors, ingestion via update).
  - NEW: semantic validation tests • DURATION_EXCEEDS_SHORTEST_PERIOD across supported freqs (ms/s, clamps).  
    • BYSETPOS_WITHOUT_SET across freqs (multiplicity heuristics).  
    • Aggregate compile error (multiple rules) with ruleIndex and meta.  
    • useRRStack.error behavior on failure and clearing on success.

Documentation

- README and Handbook document:
  - API surface and behavior (including segments limit, bounds semantics).
  - timeUnit semantics, unit-change conversion details, and 's' rounding.
  - Timezone/ICU environment notes.
  - React hooks options, staged vs compiled, debounce knobs, and the form→engine ingestion flow via update().
  - Algorithms (deep dive).
  - NEW: Validation & error handling: • Non‑overlap (duration < shortest inter‑start period) validation.  
    • Invalid BYSETPOS combinations.  
    • Error taxonomy, aggregate errors, and useRRStack.error usage.
