import type { DateRange } from './DateRange';

export const extractTimestamps = (dateRange: DateRange) =>
  dateRange
    ? (dateRange as (Date | null)[]).map((d) => (d ? d.getTime() : undefined))
    : [undefined, undefined];
