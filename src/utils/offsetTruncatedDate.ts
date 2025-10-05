export const offsetTruncatedDate = ({
  date,
  truncateAt,
  offsetYears,
  offsetMonths,
  offsetDays,
  offsetHours,
  offsetMinutes,
  offsetSeconds,
  offsetMilliseconds,
}: {
  date?: number | Date | null;
  truncateAt?:
    | 'year'
    | 'month'
    | 'day'
    | 'hour'
    | 'minute'
    | 'second'
    | 'millisecond';
  offsetYears?: number;
  offsetMonths?: number;
  offsetDays?: number;
  offsetHours?: number;
  offsetMinutes?: number;
  offsetSeconds?: number;
  offsetMilliseconds?: number;
}) => {
  const isNil = (v: unknown): v is null | undefined =>
    v === null || v === undefined;
  const isNumber = (v: unknown): v is number =>
    typeof v === 'number' && Number.isFinite(v);

  const baseDate = isNil(date)
    ? new Date()
    : isNumber(date)
      ? new Date(date)
      : date;

  const truncation = truncateAt
    ? (
        {
          year: 6,
          month: 5,
          day: 4,
          hour: 3,
          minute: 2,
          second: 1,
          millisecond: 0,
        } as Record<NonNullable<typeof truncateAt>, number>
      )[truncateAt]
    : 0;

  return new Date(
    baseDate.getFullYear() + (offsetYears ?? 0),
    (truncation > 5 ? 0 : baseDate.getMonth()) + (offsetMonths ?? 0),
    truncation > 4 ? (offsetDays ?? 1) : baseDate.getDate() + (offsetDays ?? 0),
    (truncation > 3 ? 0 : baseDate.getHours()) + (offsetHours ?? 0),
    (truncation > 2 ? 0 : baseDate.getMinutes()) + (offsetMinutes ?? 0),
    (truncation > 1 ? 0 : baseDate.getSeconds()) + (offsetSeconds ?? 0),
    (truncation > 0 ? 0 : baseDate.getMilliseconds()) +
      (offsetMilliseconds ?? 0),
  );
};
