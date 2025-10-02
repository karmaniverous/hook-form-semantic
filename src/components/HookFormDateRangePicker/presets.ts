import { offsetTruncatedDate } from '@/utils/offsetTruncatedDate';

import type { DateRange } from './DateRange';

export type Presets = Record<
  string,
  {
    text: string;
    value: DateRange | (() => DateRange);
    epoch: 'past' | 'present' | 'future';
  }
>;

export const defaultPresets: Presets = {
  today: {
    text: 'Today',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'day' }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: 1,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'present',
  },
  yesterday: {
    text: 'Yesterday',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'day', offsetDays: -1 }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'past',
  },
  tomorrow: {
    text: 'Tomorrow',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'day', offsetDays: 1 }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: 2,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'future',
  },
  thisWeek: {
    text: 'This Week',
    value: () => [
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: -new Date().getDay(),
      }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: 7 - new Date().getDay(),
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'present',
  },
  lastWeek: {
    text: 'Last Week',
    value: () => [
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: -new Date().getDay() - 7,
      }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: -new Date().getDay(),
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'past',
  },
  nextWeek: {
    text: 'Next Week',
    value: () => [
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: 7 - new Date().getDay(),
      }),
      offsetTruncatedDate({
        truncateAt: 'day',
        offsetDays: 14 - new Date().getDay(),
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'future',
  },
  thisMonth: {
    text: 'This Month',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'month' }),
      offsetTruncatedDate({
        truncateAt: 'month',
        offsetMonths: 1,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'present',
  },
  lastMonth: {
    text: 'Last Month',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'month', offsetMonths: -1 }),
      offsetTruncatedDate({
        truncateAt: 'month',
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'past',
  },
  nextMonth: {
    text: 'Next Month',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'month', offsetMonths: 1 }),
      offsetTruncatedDate({
        truncateAt: 'month',
        offsetMonths: 2,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'future',
  },
  thisYear: {
    text: 'This Year',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'year' }),
      offsetTruncatedDate({
        truncateAt: 'year',
        offsetYears: 1,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'present',
  },
  lastYear: {
    text: 'Last Year',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'year', offsetYears: -1 }),
      offsetTruncatedDate({
        truncateAt: 'year',
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'past',
  },
  nextYear: {
    text: 'Next Year',
    value: () => [
      offsetTruncatedDate({ truncateAt: 'year', offsetYears: 1 }),
      offsetTruncatedDate({
        truncateAt: 'year',
        offsetYears: 2,
        offsetMilliseconds: -1,
      }),
    ],
    epoch: 'future',
  },
};

export const filterPresets = (
  epochs: Presets[string]['epoch'][],
  presets: Presets = defaultPresets,
) =>
  Object.fromEntries(
    Object.entries(presets).filter(([, v]) => epochs.includes(v.epoch)),
  ) as Presets;
