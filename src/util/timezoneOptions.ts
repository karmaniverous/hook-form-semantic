// Generate timezone options from browser
export const timezoneOptions = (() => {
  try {
    // Use type assertion for supportedValuesOf as it's newer and may not be in all TS versions
    const intlWithSupportedValuesOf = Intl as typeof Intl & {
      supportedValuesOf?: (input: 'timeZone') => string[];
    };
    const timezones = intlWithSupportedValuesOf.supportedValuesOf?.(
      'timeZone',
    ) || [
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'America/Denver',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'UTC',
    ];
    return timezones.map((tz: string) => ({
      key: tz,
      value: tz,
      text: tz.replace(/_/g, ' '),
    }));
  } catch {
    // Fallback for older browsers
    return [
      {
        key: 'America/New_York',
        value: 'America/New_York',
        text: 'America/New York',
      },
      {
        key: 'America/Chicago',
        value: 'America/Chicago',
        text: 'America/Chicago',
      },
      {
        key: 'America/Denver',
        value: 'America/Denver',
        text: 'America/Denver',
      },
      {
        key: 'America/Los_Angeles',
        value: 'America/Los_Angeles',
        text: 'America/Los Angeles',
      },
      { key: 'Europe/London', value: 'Europe/London', text: 'Europe/London' },
      { key: 'Europe/Paris', value: 'Europe/Paris', text: 'Europe/Paris' },
      { key: 'Asia/Tokyo', value: 'Asia/Tokyo', text: 'Asia/Tokyo' },
      { key: 'UTC', value: 'UTC', text: 'UTC' },
    ];
  }
})();

export const formatTimeZone = (tz: string) =>
  timezoneOptions.find(({ key }) => key === tz)?.text ?? tz;
