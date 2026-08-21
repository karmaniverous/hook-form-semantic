/* The date-range logic lives in `@/core/dateRange`, which carries no JSX and no
 * Semantic UI. Re-exported here so the package barrel keeps its existing
 * surface — a consumer that only wants the presets should import the subpath
 * and skip the component graph entirely. */
export {
  HookFormDateRangePicker,
  type HookFormDateRangePickerProps,
} from './HookFormDateRangePicker';
export type { DateRange, Presets } from '@/core/dateRange';
export {
  defaultPresets,
  extractTimestamps,
  filterPresets,
} from '@/core/dateRange';
