import { Options } from 'rrule';

/**
 * Public RRStack types, options, and JSON shapes.
 *
 * Design notes
 * - Unit-aware domain: no EPOCH_* constants exported; domain bounds are handled
 *   internally according to {@link UnixTimeUnit}.
 * - Keep module small and testable (SRP).
 */

/** Instant status classification for a timestamp. */
type instantStatus = 'active' | 'blackout';
/** Range classification across `[from, to)`. */
type rangeStatus = instantStatus | 'partial';
/** Time unit for inputs/outputs and internal computation. */
type UnixTimeUnit = 'ms' | 's';
/**
 * Branded IANA timezone id after runtime validation. Use
 * {@link RRStack.asTimeZoneId | RRStack.asTimeZoneId} to construct one from a string.
 */
type TimeZoneId = string & {
    __brand: 'TimeZoneId';
};
/**
 * Human-readable RRULE frequency (lower-case) for recurring rules.
 * Mapped internally to rrule's numeric Frequency enum during compilation.
 */
type FrequencyStr = 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly' | 'minutely' | 'secondly';
/**
 * Structured duration parts for UI-friendly, lossless round-tripping.
 * - All fields are non-negative integers.
 * - At least one field must be \> 0 (duration must be strictly positive).
 * - Calendar vs exact:
 *   • \{ days: 1 \} → calendar day (can be 23/25 hours across DST),
 *   • \{ hours: 24 \} → exact 24 hours.
 */
interface DurationParts {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}
/**
 * JSON shape for rule options:
 * - Derived from rrule Options with `dtstart`/`until`/`tzid` removed.
 * - `freq` is optional:
 *   • present → recurring rule (RRULE-based),
 *   • absent  → continuous span rule (no recurrence).
 * - Adds `starts`/`ends` in the configured {@link UnixTimeUnit} for domain clamping.
 * - When `freq` is present, RRStack maps it to rrule's numeric enum internally.
 */
type RuleOptionsJson = Partial<Omit<Options, 'dtstart' | 'until' | 'tzid' | 'freq'>> & {
    /**
     * Optional frequency. When omitted, the rule is a continuous span and must
     * omit `duration`.
     */
    freq?: FrequencyStr;
    starts?: number;
    ends?: number;
};
/** A single rule in the cascade. */
interface RuleJson {
    /** `'active' | 'blackout'` — effect applied at covered instants. */
    effect: instantStatus;
    /** Structured duration for recurring rules; must be omitted for span rules. */
    duration?: DurationParts;
    /** Subset of rrule options (see {@link RuleOptionsJson}). */
    options: RuleOptionsJson;
    /** Optional label for diagnostics/UI. */
    label?: string;
}
/**
 * Constructor input and serialized output (round-trippable).
 * - `version` is optional on input and ignored by the constructor.
 * - {@link RRStack.toJson | toJson()} always writes the current package version.
 */
interface RRStackOptions {
    /** Optional version string; ignored by the constructor. */
    version?: string;
    /** IANA timezone id (validated at runtime). */
    timezone: string;
    /** Time unit ('ms' | 's'). Defaults to 'ms'. */
    timeUnit?: UnixTimeUnit;
    /** Baseline effect for uncovered instants. Defaults to 'auto'. */
    defaultEffect?: instantStatus | 'auto';
    /** Rule list. Defaults to empty. */
    rules?: RuleJson[];
}
/**
 * Normalized options stored on the instance (frozen). * - `timeUnit` is required.
 * - `rules` is a readonly array.
 * - `timezone` is a branded, validated string.
 */
interface RRStackOptionsNormalized extends Omit<RRStackOptions, 'timeUnit' | 'rules' | 'timezone'> {
    timeUnit: UnixTimeUnit;
    rules: readonly RuleJson[];
    timezone: TimeZoneId;
    defaultEffect: instantStatus | 'auto';
}
/**
 * Notices emitted by {@link RRStack.update | RRStack.update()} to describe
 * version/unit handling outcomes. Returned in order and also delivered via
 * {@link UpdatePolicy.onNotice | onNotice} when provided.
 *
 * Example: log all notices while accepting newer versions with a warning
 * ```ts
 * const notices = stack.update(incomingJson, {
 *   onVersionDown: 'warn',
 *   onNotice: (n) => {
 *     console.info('[rrstack.notice]', n.kind, n.action);
 *   },
 * });
 * // `notices` contains the same entries, in the same order
 * ```
 *
 * @public
 * Notices emitted by RRStack.update() to describe version/unit handling outcomes.
 */
type Notice = {
    kind: 'versionUp';
    level: 'error' | 'warn' | 'info';
    from: string | null;
    to: string;
    action: 'upgrade' | 'rejected' | 'ingestAsCurrent';
    message?: string;
} | {
    kind: 'versionDown';
    level: 'error' | 'warn' | 'info';
    from: string | null;
    to: string;
    action: 'rejected' | 'ingestAsCurrent';
    message?: string;
} | {
    kind: 'versionInvalid';
    level: 'error' | 'warn' | 'info';
    raw: unknown;
    to: string;
    action: 'rejected' | 'ingestAsCurrent';
    message?: string;
} | {
    kind: 'timeUnitChange';
    level: 'error' | 'warn' | 'info';
    from: UnixTimeUnit;
    to: UnixTimeUnit;
    action: 'convertedExisting' | 'acceptedIncomingRules' | 'rejected';
    convertedRuleCount?: number;
    replacedRuleCount?: number;
    message?: string;
};
/**
 * Policy switches for {@link RRStack.update | RRStack.update()}. Defaults:
 * - onVersionUp: 'off'; onVersionDown: 'error'; onVersionInvalid: 'error';
 * - onTimeUnitChange: 'warn'.
 *
 * Example: accept newer versions with a warning and surface time‑unit changes
 * ```ts
 * stack.update(incoming, {
 *   onVersionDown: 'warn',
 *   onTimeUnitChange: 'warn',
 *   onNotice: (n) => {
 *     // route to your logger/telemetry
 *     logger.info({ notice: n });
 *   },
 * });
 * ```
 *
 * React passthrough:
 * When supplied via `useRRStack({ policy })`, this policy is applied to both:
 * - prop ingestion (`json` → engine), and
 * - staged UI commits (timezone/rules/timeUnit).
 *
 * @public
 */
interface UpdatePolicy {
    onVersionUp?: 'error' | 'warn' | 'off';
    onVersionDown?: 'error' | 'warn' | 'off';
    onVersionInvalid?: 'error' | 'warn' | 'off';
    onTimeUnitChange?: 'error' | 'warn' | 'off';
    onNotice?: (n: Notice) => void;
}

interface RuleDescriptorBase {
    kind: 'span' | 'recur';
    effect: 'active' | 'blackout';
    tz: string;
    unit: UnixTimeUnit;
    clamps?: {
        starts?: number;
        ends?: number;
    };
}
interface WeekdayPos {
    /** 1..7 (Mon..Sun) */
    weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    /** ±1..±5; -1 === last */
    nth?: number;
}
interface RuleDescriptorRecur extends RuleDescriptorBase {
    kind: 'recur';
    freq: FrequencyStr;
    interval: number;
    duration: DurationParts;
    by: {
        months?: number[];
        monthDays?: number[];
        yearDays?: number[];
        weekNos?: number[];
        weekdays?: WeekdayPos[];
        hours?: number[];
        minutes?: number[];
        seconds?: number[];
        setpos?: number[];
        wkst?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    };
    count?: number;
    until?: number;
}
interface RuleDescriptorSpan extends RuleDescriptorBase {
    kind: 'span';
}
type RuleDescriptor = RuleDescriptorRecur | RuleDescriptorSpan;

type FrequencyAdjectiveLabels = Record<FrequencyStr, string>;
type FrequencyNounLabels = Record<FrequencyStr, string>;
interface FrequencyLexicon {
    adjective: FrequencyAdjectiveLabels;
    noun: FrequencyNounLabels;
    pluralize?: (noun: string, n: number) => string;
}

type OrdinalStyle = 'long' | 'short';
interface TranslatorOptions {
    frequency?: Partial<FrequencyLexicon>;
    timeFormat?: 'hm' | 'hms' | 'auto';
    hourCycle?: 'h23' | 'h12';
    ordinals?: OrdinalStyle;
    /** Optional BCP‑47 locale for labels (Luxon setLocale). Defaults to runtime locale. */
    locale?: string;
    /** Lowercase labels (strict style). Defaults to true. */
    lowercase?: boolean;
}
type DescribeTranslator = (desc: RuleDescriptor, opts?: TranslatorOptions) => string;

/**
 * Requirements addressed:
 * - Provide a human-readable rule description leveraging rrule's toText().
 * - Include effect and duration; optionally include timezone and bounds.
 * - Include effect and duration; optionally include timezone and bounds.
 * - Allow custom formatting of the timezone label.
 */

interface DescribeOptions {
    /** Append "(timezone <tz>)" — default false */
    includeTimeZone?: boolean;
    /** Append "[from <dtstart>; until <until>]" if clamps are present — default false */
    includeBounds?: boolean;
    /**
     * Optional formatter for the timezone label. When provided and
     * includeTimeZone is true, the description will use
     * `(timezone formatTimeZone(tzId))` instead of the raw tz id.
     */
    formatTimeZone?: (tzId: string) => string;
    /**
     * Optional format string for bounds when `includeBounds` is true.
     * When provided, bound instants are rendered via Luxon's `toFormat(boundsFormat)`
     * in the rule's timezone. When omitted, bounds use ISO with milliseconds
     * suppressed (default behavior).
     *
     * Examples:
     * - 'yyyy-LL-dd' → "2025-04-01"
     * - "dd LLL yyyy 'at' HH:mm" → "01 Apr 2025 at 07:30"
     *
     * Backward compatible: if undefined, behavior is unchanged.
     */
    boundsFormat?: string;
    /** Optional translator override ('strict-en' or custom) */
    translator?: 'strict-en' | DescribeTranslator;
    /** Options for the translator. */
    translatorOptions?: TranslatorOptions;
}

/**
 * RRStack — timezone-aware cascade of RRULE-based coverage.
 *
 * RRStack evaluates a prioritized list of rules to answer point queries,
 * enumerate contiguous coverage segments, classify ranges, and compute
 * effective bounds. All computations are performed in the configured IANA * timezone with DST-correct duration arithmetic (Luxon).
 *
 * Notes
 * - Options are normalized and frozen on the instance.
 * - `timeUnit` is mutable via update(); retained rules convert clamp timestamps.
 * - Intervals are half-open [start, end). In 's' mode, ends are rounded up to
 *   the next integer second to avoid boundary false negatives.
 *
 * @public
 */

declare class RRStack {
    /** Internal: listeners for post‑mutation notifications. */
    private readonly __listeners;
    /** Internal: true after construction; used to suppress initial notify. */
    private __initialized;
    /**
     * Normalized, frozen options. Mutate via {@link timezone}, {@link rules},
     * or {@link update}.   */
    readonly options: RRStackOptionsNormalized;
    private compiled;
    /**
     * Build the baseline (virtual) span rule from defaultEffect.
     * - 'auto' =\> opposite of rule 0's effect, or 'active' when no rules.
     * - otherwise =\> the provided defaultEffect.
     */
    private baselineEffect;
    /** Construct the compiled baseline span (open-start/open-end) in current tz/unit. */
    private makeBaseline;
    /** Working set with baseline prepended (lowest priority). */
    private compiledWithBaseline;
    /**
     * Create a new RRStack.
     *
     * @param opts - Constructor options. `timeUnit` defaults to `'ms'`.
     * @remarks Options are normalized and frozen on the instance. The stack   *          compiles its rules immediately. The optional `version` is ignored.
     */
    constructor(opts: RRStackOptions);
    private recompile;
    /**
     * Validate an IANA timezone id.
     * @param tz - Candidate IANA timezone string.
     * @returns True if recognized by the host ICU/Intl data.
     */
    static isValidTimeZone(tz: string): boolean;
    /**
     * Validate and brand a timezone id.
     * @param tz - Candidate IANA timezone string.
     * @returns The branded {@link TimeZoneId}.
     * @throws If the timezone is invalid in the current environment.
     */
    static asTimeZoneId(tz: string): TimeZoneId;
    /**
     * Subscribe to post‑mutation notifications. The listener is invoked exactly
     * once after a successful state change (after recompile). The constructor
     * initialization does not trigger notifications.
     *
     * @returns Unsubscribe function.
     */
    subscribe(listener: (self: RRStack) => void): () => void;
    /** @internal Notify all listeners (best‑effort; errors are swallowed). */
    private __notify;
    /**
     * Get the current IANA timezone id (unbranded string).
     */
    get timezone(): string;
    /**
     * Set the timezone and recompile.
     * @param next - IANA timezone id (validated).
     * @throws If the timezone is invalid.
     */
    set timezone(next: string);
    /**
     * Get the rule list (frozen).
     */
    get rules(): readonly RuleJson[];
    /**
     * Replace the rule list and recompile.
     * @param next - New rule array. A lightweight runtime check is applied;
     *               full validation occurs during compilation.
     */
    set rules(next: readonly RuleJson[]);
    /**   * Get the configured time unit ('ms' | 's'). Immutable.
     */
    get timeUnit(): UnixTimeUnit;
    /**
     * Ingest a partial RRStackOptions JSON with version/unit handling, replacements, and notices.
     * - Applies timezone, defaultEffect, rules, and timeUnit in one pass.
     * - Version pipeline (upgrade-config) executes first; defaults:
     *   • onVersionUp: 'off', onVersionDown: 'error', onVersionInvalid: 'error'.
     * - timeUnit change:
     *   • If rules provided: replace rules as-is (assumed in new unit).
     *   • If not: convert retained rules' options.starts/options.ends between units (ms ↔ s).
     * - Recompiles exactly once on success.
     */
    update(partial?: Partial<RRStackOptions>, policy?: UpdatePolicy): readonly Notice[];
    /**
     * Return the current time in the configured unit.
     */
    now(): number;
    /**
     * Format an instant using this stack's configured timezone and time unit.
     * - In 'ms' mode, `t` is interpreted as milliseconds since epoch.
     * - In 's' mode, `t` is interpreted as integer seconds since epoch.
     *
     * @param t - Instant in the configured unit.
     * @param opts - Optional formatting:
     *   - format?: Luxon toFormat string (e.g., 'yyyy-LL-dd HH:mm').
     *   - locale?: BCP-47 locale tag applied prior to formatting.
     * @returns A string representation (ISO by default).
     *
     * @example
     * stack.formatInstant(Date.UTC(2024, 0, 2, 5, 30, 0)); // '2024-01-02T05:30:00Z' (UTC)
     * stack.formatInstant(ms, \{ format: 'yyyy-LL-dd HH:mm' \}); // '2024-01-02 05:30'
     */
    formatInstant(t: number, opts?: {
        format?: string;
        locale?: string;
    }): string;
    /**
     * Serialize the stack to JSON.
     * @returns A {@link RRStackOptions} including `version` injected at build time   *          (fallback `'0.0.0'` in dev/test).
     */
    toJson(): RRStackOptions;
    /**
     * Determine whether the stack is active at `t`.
     * @param t - Timestamp in the configured unit.
     * @returns true when active; false when blackout.
     */
    isActiveAt(t: number): boolean;
    /**   * Stream contiguous status segments over `[from, to)`.   *
     * @param from - Start of the window (inclusive), in the configured unit.
     * @param to - End of the window (exclusive), in the configured unit.
     * @param opts - Optional settings:
     *   - limit?: number — maximum number of segments to yield; throws
     *     if more would be produced (no silent truncation).
     * @returns An iterable of `{ start, end, status }` entries. Memory-bounded
     *          and stable for long windows.
     *
     * @example
     * ```ts
     * for (const seg of stack.getSegments(from, to)) {
     *   // { start: number; end: number; status: 'active' | 'blackout' }
     * }
     * ```
     *
     * @example Using a limit to cap enumeration and guard long windows
     * ```ts
     * const segs: Array<{ start: number; end: number; status: 'active' | 'blackout' }> = [];
     * try {
     *   for (const seg of stack.getSegments(from, to, { limit: 1000 })) {
     *     segs.push(seg);
     *   }
     * } catch (err) {
     *   // If more than 1000 segments would be produced, an Error is thrown.
     *   // Consider reducing the window or processing in chunks (e.g., day/week).
     * }
     * ```
     *
     * Note: The iterator is streaming and memory-bounded, but the number of
     * segments can be large when many rules overlap across long windows.
     * Use the `limit` option to make this explicit, or query in smaller chunks
     * for real-time UIs.
     */
    getSegments(from: number, to: number, opts?: {
        limit?: number;
    }): Iterable<{
        start: number;
        end: number;
        status: instantStatus;
    }>; /**
     * Classify a range `[from, to)` as `'active'`, `'blackout'`, or `'partial'`.
     * @param from - Start of the window (inclusive), in the configured unit.
     * @param to - End of the window (exclusive), in the configured unit.   */
    classifyRange(from: number, to: number): rangeStatus;
    /**   * Compute effective active bounds across all rules.
     * @returns `{ start?: number; end?: number; empty: boolean }`
     * - `start` and/or `end` are omitted for open-sided coverage.
     * - `empty` indicates no active coverage.
     *
     * @example Open-ended end
     * ```ts
     * const stack = new RRStack({
     *   timezone: 'UTC',
     *   rules: [{
     *     effect: 'active',
     *     duration: { hours: 1 },
     *     options: { freq: 'daily', byhour: [5], byminute: [0], bysecond: [0], starts: Date.UTC(2024, 0, 10, 0, 0, 0) },
     *   }],
     * });
     * const b = stack.getEffectiveBounds();
     * // b.start is 2024-01-10T05:00:00Z (number); b.end is undefined (open end)
     * ```
     */
    getEffectiveBounds(): {
        start?: number;
        end?: number;
        empty: boolean;
    };
    /**
     * Describe a rule by index as human-readable text.
     * Leverages rrule.toText() plus effect and duration phrasing.   *
     * @param index - Zero-based index into {@link rules}.
     * @param opts - Description options (timezone/bounds toggles).
     * @throws RangeError if index is out of bounds; TypeError if not an integer.
     *
     * @example
     * ```ts
     * const text = stack.describeRule(0, { includeTimeZone: true, includeBounds: true });
     * // e.g., "Active for 1 hour: every day at 5:00 (timezone UTC) [from 2024-01-10T00:00:00Z]"
     * ```
     */
    describeRule(index: number, opts?: DescribeOptions): string;
    /**
     * Insert a rule at a specific index (or append when index is omitted).
     * Delegates to the {@link rules} setter (single recompile).
     * When called with no arguments, inserts a default span rule:
     * `{ effect: 'active', options: {} }`.
     */
    addRule(rule?: RuleJson, index?: number): void;
    /**   * Remove the rule at the specified index.
     * Delegates to the {@link rules} setter (single recompile).
     *
     * @param i - Zero-based index of the rule to remove.
     * @throws TypeError if `i` is not an integer; RangeError if out of range.
     */
    removeRule(i: number): void;
    /**
     * Swap two rules by index (no-op if indices are equal).
     */
    swap(i: number, j: number): void;
    /**
     * Move a rule up by one (toward index 0). No-op if already at the top.
     */
    up(i: number): void;
    /**
     * Move a rule down by one (toward the end). No-op if already at the bottom.
     */
    down(i: number): void;
    /**
     * Move a rule to the top (index 0).
     */
    top(i: number): void;
    /**
     * Move a rule to the bottom (last index).
     */
    bottom(i: number): void;
}

type LogEventType = 'init' | 'reset' | 'mutate' | 'commit' | 'flushChanges' | 'flushMutations' | 'flushRender' | 'cancel';

type DebounceSpec = true | number | {
    delay?: number;
    leading?: boolean;
};
/**
 * Shared base options for RRStack React hooks.
 */
interface UseRRStackBaseProps {
    renderDebounce?: DebounceSpec;
    logger?: boolean | ((e: {
        type: LogEventType;
        rrstack: RRStack;
    }) => void);
    resetKey?: string | number;
}
/**
 * Shared base output for RRStack React hooks.
 */
interface UseRRStackBaseOutput {
    version: number;
    flushRender: () => void;
}

interface UseRRStackProps extends UseRRStackBaseProps {
    changeDebounce?: DebounceSpec;
    json?: RRStackOptions | null;
    mutateDebounce?: DebounceSpec;
    onChange?: (stack: RRStack) => void;
    policy?: UpdatePolicy;
}
interface UseRRStackOutput extends UseRRStackBaseOutput {
    cancelMutations: () => void;
    flushChanges: () => void;
    flushMutations: () => void;
    rrstack: RRStack;
}
declare function useRRStack({ changeDebounce, json, logger, mutateDebounce, onChange, policy, renderDebounce, resetKey, }: UseRRStackProps): UseRRStackOutput;

interface UseRRStackSelectorProps<T> extends UseRRStackBaseProps {
    rrstack: RRStack;
    selector: (s: RRStack) => T;
    isEqual?: (a: T, b: T) => boolean;
}
interface UseRRStackSelectorOutput<T> extends UseRRStackBaseOutput {
    selection: T;
}
/**
 * Subscribe to an RRStack-derived value with optional debounced renders.
 * Re-evaluates `selector` on stack mutations; only schedules a paint when
 * `isEqual` deems the selection to have changed. Renders can be coalesced
 * via `renderDebounce` (trailing is always true; optional leading).
 */
declare function useRRStackSelector<T>({ rrstack, selector, isEqual, renderDebounce, logger, resetKey, }: UseRRStackSelectorProps<T>): UseRRStackSelectorOutput<T>;

export { useRRStack, useRRStackSelector };
export type { DebounceSpec, UseRRStackBaseOutput, UseRRStackBaseProps, UseRRStackOutput, UseRRStackProps, UseRRStackSelectorOutput, UseRRStackSelectorProps };
