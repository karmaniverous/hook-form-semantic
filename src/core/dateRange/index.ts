/**
 * Date-range values and types with no JSX and no Semantic UI: the preset
 * calendar ranges, the filter that narrows them, and the timestamp extractor
 * the list screens sort by. The Semantic `HookFormDateRangePicker` and any
 * other renderer import from here rather than owning copies.
 *
 * @packageDocumentation
 */

export type { DateRange } from './DateRange';
export { extractTimestamps } from './extractTimestamps';
export { defaultPresets, filterPresets, type Presets } from './presets';
