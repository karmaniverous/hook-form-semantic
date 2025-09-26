import type { RuleJson } from '@karmaniverous/rrstack';
import type { RRStack } from '@karmaniverous/rrstack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Container,
  Dropdown,
  Form,
  Grid,
  Header,
  Icon,
  Input,
  Message,
  Popup,
  Segment,
} from 'semantic-ui-react';

import { HookFormDatePicker } from './HookFormDatePicker';

interface RRStackRuleFormProps {
  rule: RuleJson;
  rrstack: RRStack;
  validationError?: string;
  onRuleChange: (updates: Partial<RuleJson>) => void;
}

const FREQUENCY_OPTIONS = [
  { key: 'span', text: 'Span', value: 'span' },
  { key: 'yearly', text: 'Yearly', value: 'yearly' },
  { key: 'monthly', text: 'Monthly', value: 'monthly' },
  { key: 'weekly', text: 'Weekly', value: 'weekly' },
  { key: 'daily', text: 'Daily', value: 'daily' },
  { key: 'hourly', text: 'Hourly', value: 'hourly' },
  { key: 'minutely', text: 'Minutely', value: 'minutely' },
  { key: 'secondly', text: 'Secondly', value: 'secondly' },
];
const EFFECT_OPTIONS = [
  { key: 'active', text: 'Active', value: 'active' },
  { key: 'blackout', text: 'Blackout', value: 'blackout' },
];

const WEEKDAY_OPTIONS = [
  { key: 0, text: 'Mon', value: 0 },
  { key: 1, text: 'Tue', value: 1 },
  { key: 2, text: 'Wed', value: 2 },
  { key: 3, text: 'Thu', value: 3 },
  { key: 4, text: 'Fri', value: 4 },
  { key: 5, text: 'Sat', value: 5 },
  { key: 6, text: 'Sun', value: 6 },
];

const POSITION_OPTIONS = [
  { key: 1, text: '1st', value: 1 },
  { key: 2, text: '2nd', value: 2 },
  { key: 3, text: '3rd', value: 3 },
  { key: 4, text: '4th', value: 4 },
  { key: -1, text: 'Last', value: -1 },
];

const MONTH_OPTIONS = [
  { key: 1, text: 'Jan', value: 1 },
  { key: 2, text: 'Feb', value: 2 },
  { key: 3, text: 'Mar', value: 3 },
  { key: 4, text: 'Apr', value: 4 },
  { key: 5, text: 'May', value: 5 },
  { key: 6, text: 'Jun', value: 6 },
  { key: 7, text: 'Jul', value: 7 },
  { key: 8, text: 'Aug', value: 8 },
  { key: 9, text: 'Sep', value: 9 },
  { key: 10, text: 'Oct', value: 10 },
  { key: 11, text: 'Nov', value: 11 },
  { key: 12, text: 'Dec', value: 12 },
];

export const RRStackRuleForm = ({
  rule,
  rrstack,
  validationError,
  onRuleChange,
}: RRStackRuleFormProps) => {
  const [showDateValidation, setShowDateValidation] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Local state for Hours and Minutes inputs to allow typing intermediate values
  const [hoursInputValue, setHoursInputValue] = useState('');
  const [minutesInputValue, setMinutesInputValue] = useState('');

  // Sync local state with rule state when rule changes externally
  useEffect(() => {
    const hoursValue = rule.options.byhour
      ? Array.isArray(rule.options.byhour)
        ? rule.options.byhour.join(', ')
        : rule.options.byhour.toString()
      : '';

    // Only update local state if rule value changed (don't depend on current input)
    if (hoursInputValue !== hoursValue) {
      // Parse current input to compare with rule value
      const currentParsedHours = hoursInputValue
        .split(',')
        .map((h) => h.trim())
        .filter((h) => h !== '')
        .map((h) => parseInt(h))
        .filter((h) => !isNaN(h) && h >= 0 && h <= 23)
        .sort();

      const ruleParsedHours = Array.isArray(rule.options.byhour)
        ? [...rule.options.byhour].sort()
        : rule.options.byhour
          ? [rule.options.byhour]
          : [];

      // Only update if the parsed arrays are actually different
      const arraysEqual =
        currentParsedHours.length === ruleParsedHours.length &&
        currentParsedHours.every(
          (val, index) => val === ruleParsedHours[index],
        );

      if (!arraysEqual) {
        setHoursInputValue(hoursValue);
      }
    }
  }, [rule.options.byhour]);

  useEffect(() => {
    const minutesValue = rule.options.byminute
      ? Array.isArray(rule.options.byminute)
        ? rule.options.byminute.join(', ')
        : rule.options.byminute.toString()
      : '';

    // Only update local state if rule value changed (don't depend on current input)
    if (minutesInputValue !== minutesValue) {
      // Parse current input to compare with rule value
      const currentParsedMinutes = minutesInputValue
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m !== '')
        .map((m) => parseInt(m))
        .filter((m) => !isNaN(m) && m >= 0 && m <= 59)
        .sort();

      const ruleParsedMinutes = Array.isArray(rule.options.byminute)
        ? [...rule.options.byminute].sort()
        : rule.options.byminute
          ? [rule.options.byminute]
          : [];

      // Only update if the parsed arrays are actually different
      const arraysEqual =
        currentParsedMinutes.length === ruleParsedMinutes.length &&
        currentParsedMinutes.every(
          (val, index) => val === ruleParsedMinutes[index],
        );

      if (!arraysEqual) {
        setMinutesInputValue(minutesValue);
      }
    }
  }, [rule.options.byminute]);

  // Check if screen is desktop size (768px+) - Semantic UI breakpoint
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Responsive style object that applies maxWidth only on desktop
  const responsiveMaxWidthStyle: React.CSSProperties = isDesktop
    ? { maxWidth: '100px' }
    : {};

  const labelWithInfo = useCallback(
    (text: string, help: string, style?: React.CSSProperties) => (
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          ...style,
        }}
      >
        {text}{' '}
        <Popup
          content={help}
          trigger={
            <Icon
              name="info circle"
              style={{
                marginLeft: 4,
                marginBottom: 6,
                opacity: 0.6,
                cursor: 'help',
              }}
            />
          }
          position="top center"
          size="small"
          inverted
        />
      </label>
    ),
    [],
  );

  // Calculate effective bounds from rrstack (live updates when rules change)
  // Use rrstack.rules and rrstack.timezone as dependencies instead of entire rrstack object
  const effectiveBounds = useMemo(() => {
    try {
      return rrstack.getEffectiveBounds();
    } catch (error) {
      console.warn('Error getting effective bounds:', error);
      return { empty: true };
    }
  }, [rrstack.rules, rrstack.timezone]);

  // Extract current start/end dates from rule options (for manual overrides)
  const manualStartDate = useMemo(
    () => (rule.options.starts ? new Date(rule.options.starts) : null),
    [rule.options.starts],
  );
  const manualEndDate = useMemo(
    () => (rule.options.ends ? new Date(rule.options.ends) : null),
    [rule.options.ends],
  );

  // Use effective bounds when available, fallback to manual dates
  const startDate = useMemo(() => {
    if (manualStartDate) return manualStartDate;
    if (!effectiveBounds.empty && effectiveBounds.start) {
      return new Date(effectiveBounds.start);
    }
    return null;
  }, [manualStartDate, effectiveBounds]);

  const endDate = useMemo(() => {
    if (manualEndDate) return manualEndDate;
    if (!effectiveBounds.empty && effectiveBounds.end) {
      return new Date(effectiveBounds.end);
    }
    return null;
  }, [manualEndDate, effectiveBounds]);

  // Validate date range - only check order when both dates are present
  const validateDateRange = useMemo((): string | null => {
    if (startDate && endDate && startDate >= endDate) {
      return 'Start date must be before end date';
    }

    return null;
  }, [startDate, endDate]);

  // Validate duration - at least one field must be positive for recurring rules
  const validateDuration = useMemo((): string | null => {
    // Only recurring rules require a positive duration
    if (rule.options.freq === undefined) {
      return null;
    }

    const { years, months, weeks, days, hours, minutes, seconds } =
      rule.duration || {};

    const hasPositiveDuration = [
      years,
      months,
      weeks,
      days,
      hours,
      minutes,
      seconds,
    ].some((value) => value && value > 0);

    if (!hasPositiveDuration) {
      return 'Duration must have at least one positive value (years, months, weeks, days, hours, minutes, or seconds)';
    }

    return null;
  }, [rule.options.freq, rule.duration]);

  const handleStartChange = useCallback(
    (d: Date | null) => {
      const nextStart = d ?? null;
      // Validate order if both present
      if (nextStart && endDate && nextStart >= endDate) {
        setShowDateValidation(true);
      } else {
        setShowDateValidation(false);
      }
      onRuleChange({
        options: {
          ...rule.options,
          starts: nextStart ? nextStart.getTime() : undefined,
        },
      });
    },
    [endDate, onRuleChange, rule.options],
  );

  const handleEndChange = useCallback(
    (d: Date | null) => {
      const nextEnd = d ?? null;
      // Validate order if both present
      if (startDate && nextEnd && startDate >= nextEnd) {
        setShowDateValidation(true);
      } else {
        setShowDateValidation(false);
      }
      onRuleChange({
        options: {
          ...rule.options,
          ends: nextEnd ? nextEnd.getTime() : undefined,
        },
      });
    },
    [onRuleChange, rule.options, startDate],
  );

  const handleFieldChange = (updates: Partial<RuleJson>) => {
    onRuleChange(updates);
  };

  const handleOptionsChange = (optionUpdates: Partial<RuleJson['options']>) => {
    handleFieldChange({
      options: {
        ...rule.options,
        ...optionUpdates,
      },
    });
  };

  const handleDurationChange = (
    durationUpdates: Partial<RuleJson['duration']>,
  ) => {
    handleFieldChange({
      duration: {
        ...rule.duration,
        ...durationUpdates,
      },
    });
  };

  // Check if any weekdays are selected to enable/disable Position field
  const hasWeekdaysSelected = useMemo(() => {
    const weekdays = rule.options.byweekday;
    if (Array.isArray(weekdays)) {
      return weekdays.some((day) => typeof day === 'number');
    }
    return typeof weekdays === 'number';
  }, [rule.options.byweekday]);

  return (
    <Container>
      {/* Top row: Label, Effect */}
      <Form.Group>
        <Form.Field width={12}>
          {labelWithInfo(
            'Label',
            'Optional descriptive name for this rule to help identify its purpose.',
          )}
          <Input
            size="small"
            value={rule.label || ''}
            onChange={(e) => {
              handleFieldChange({ label: e.target.value });
            }}
            placeholder="Rule label"
          />
        </Form.Field>
        <Form.Field width={4}>
          {labelWithInfo(
            'Effect',
            'Active enables windows; Blackout blocks them. Use Blackout to exclude periods.',
          )}
          <Dropdown
            selection
            compact
            options={EFFECT_OPTIONS}
            value={rule.effect}
            onChange={(e, { value }) =>
              handleFieldChange({ effect: value as 'active' | 'blackout' })
            }
          />
        </Form.Field>
      </Form.Group>

      {/* Valid Range */}
      <Segment style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Header size="tiny">Valid Range</Header>
        <Form.Group style={{ alignItems: 'flex-end' }}>
          <Form.Field width={5}>
            <HookFormDatePicker
              standalone
              label="Start Date"
              value={startDate}
              onChange={handleStartChange}
            />
          </Form.Field>
          <Form.Field width={5}>
            <HookFormDatePicker
              standalone
              label="End Date"
              value={endDate}
              onChange={handleEndChange}
            />
          </Form.Field>
          <Form.Field width={rule.options.freq === undefined ? 6 : 2}>
            {labelWithInfo(
              'Frequency',
              'Span = a continuous time range (no recurrence). Yearly/Monthly/etc. define recurring schedules.',
            )}
            <Dropdown
              selection
              compact
              options={FREQUENCY_OPTIONS}
              value={
                rule.options.freq === undefined ? 'span' : rule.options.freq
              }
              onChange={(e, { value }) => {
                const freq =
                  value === 'span'
                    ? undefined
                    : (value as
                        | 'yearly'
                        | 'monthly'
                        | 'weekly'
                        | 'daily'
                        | 'hourly'
                        | 'minutely'
                        | 'secondly');

                if (freq === undefined) {
                  // Switch to span: clear duration as span rules must omit it
                  handleFieldChange({
                    options: { ...rule.options, freq: undefined },
                    duration: undefined,
                  });
                } else {
                  // Switch to recurring: ensure a default positive duration if missing
                  handleFieldChange({
                    options: { ...rule.options, freq },
                    duration: rule.duration || { days: 1 },
                  });
                }
              }}
              style={{ width: '100%', height: '42px' }}
            />
          </Form.Field>
          {rule.options.freq !== undefined && (
            <Form.Field width={2}>
              {labelWithInfo(
                'Interval',
                'Number of frequency units to skip between occurrences. Example: every 2 weeks.',
              )}
              <Input
                size="small"
                type="number"
                value={rule.options.interval || 1}
                onChange={(e: { target: { value: string } }) =>
                  handleOptionsChange({
                    interval: parseInt(e.target.value) || 1,
                  })
                }
                min={1}
                style={{ width: '100%', height: '39px' }}
              />
            </Form.Field>
          )}
          {rule.options.freq !== undefined && (
            <Form.Field width={2}>
              {labelWithInfo(
                'Count',
                'Maximum number of occurrences to generate for this rule.',
              )}
              <Input
                size="small"
                type="number"
                value={rule.options.count || ''}
                onChange={(e) => {
                  handleOptionsChange({
                    count: parseInt(e.target.value) || undefined,
                  });
                }}
                min={1}
                style={{ width: '100%', height: '39px' }}
              />
            </Form.Field>
          )}
        </Form.Group>
      </Segment>

      {/* Recurrence-only constraints (hidden for Span): Months / Weekdays / Time */}
      {rule.options.freq !== undefined && (
        <Grid columns={3} stackable style={{ margin: 0, padding: 0 }}>
          {/* Months Column */}
          <Grid.Column style={{ paddingLeft: 0 }}>
            <Segment>
              <Header size="tiny">Months</Header>
              <Form.Group widths="equal" style={{ marginBottom: 0 }}>
                <Form.Field>
                  {labelWithInfo(
                    'Months',
                    'Restrict recurrences to specific months.',
                  )}
                  <Dropdown
                    selection
                    multiple
                    search
                    compact
                    options={MONTH_OPTIONS}
                    value={rule.options.bymonth || []}
                    onChange={(e, { value }) => {
                      handleOptionsChange({
                        bymonth:
                          (value as number[]).length > 0
                            ? (value as number[])
                            : undefined,
                      });
                    }}
                    placeholder="Select"
                    style={responsiveMaxWidthStyle}
                  />
                </Form.Field>
                <Form.Field>
                  {labelWithInfo(
                    'DoM',
                    'Comma-separated days within the month for recurrences (e.g., 1, 15, 31).',
                  )}
                  <Input
                    size="small"
                    value={
                      rule.options.bymonthday
                        ? Array.isArray(rule.options.bymonthday)
                          ? rule.options.bymonthday.join(', ')
                          : rule.options.bymonthday.toString()
                        : ''
                    }
                    onChange={(e) => {
                      const days = e.target.value
                        .split(',')
                        .map((d) => parseInt(d.trim()))
                        .filter((d) => !isNaN(d) && d >= 1 && d <= 31);
                      handleOptionsChange({
                        bymonthday: days.length > 0 ? days : undefined,
                      });
                    }}
                    placeholder="25 (for 25th)"
                    style={responsiveMaxWidthStyle}
                  />
                </Form.Field>
              </Form.Group>
            </Segment>
          </Grid.Column>

          {/* Weekdays Column */}
          <Grid.Column style={{ paddingLeft: 0 }}>
            <Segment>
              <Header size="tiny">Weekdays</Header>
              <Form.Group widths="equal" style={{ marginBottom: '-5px' }}>
                <Form.Field>
                  {labelWithInfo(
                    'Weekdays',
                    'Select days of the week for recurrences within periods.',
                  )}
                  <Dropdown
                    selection
                    multiple
                    search
                    compact
                    options={WEEKDAY_OPTIONS}
                    value={
                      Array.isArray(rule.options.byweekday)
                        ? rule.options.byweekday.filter(
                            (day): day is number => typeof day === 'number',
                          )
                        : typeof rule.options.byweekday === 'number'
                          ? [rule.options.byweekday]
                          : []
                    }
                    onChange={(e, { value }) => {
                      handleOptionsChange({
                        byweekday:
                          (value as number[]).length > 0
                            ? (value as number[])
                            : undefined,
                      });
                    }}
                  />
                </Form.Field>
                <Form.Field>
                  {labelWithInfo(
                    'Position',
                    'Select nth occurrence within the period (e.g., 1st, 2nd, Last). Requires weekdays to be selected.',
                  )}
                  <Dropdown
                    selection
                    multiple
                    compact
                    disabled={!hasWeekdaysSelected}
                    options={POSITION_OPTIONS}
                    value={rule.options.bysetpos || []}
                    onChange={(e, { value }) => {
                      handleOptionsChange({
                        bysetpos:
                          (value as number[]).length > 0
                            ? (value as number[])
                            : undefined,
                      });
                    }}
                  />
                </Form.Field>
              </Form.Group>
            </Segment>
          </Grid.Column>

          {/* Time Column */}
          <Grid.Column style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Segment>
              <Header size="tiny">Time</Header>
              <Form.Group widths="equal" style={{ marginBottom: 0 }}>
                <Form.Field>
                  {labelWithInfo(
                    'Hours',
                    'Comma-separated hours (0–23) when events should occur. Example: 9, 13, 17',
                  )}
                  <Input
                    size="small"
                    value={hoursInputValue}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      setHoursInputValue(inputValue);

                      // Parse and validate hours
                      const parts = inputValue.split(',').map((h) => h.trim());
                      const validHours = parts
                        .filter((h) => h !== '') // Only process non-empty parts
                        .map((h) => parseInt(h))
                        .filter((h) => !isNaN(h) && h >= 0 && h <= 23);

                      // Only update rule if input is empty or all non-empty parts are valid
                      const nonEmptyParts = parts.filter((h) => h !== '');
                      const allNonEmptyPartsValid =
                        nonEmptyParts.length === 0 ||
                        nonEmptyParts.every((h) => {
                          const num = parseInt(h);
                          return !isNaN(num) && num >= 0 && num <= 23;
                        });

                      if (allNonEmptyPartsValid) {
                        handleOptionsChange({
                          byhour:
                            validHours.length > 0 ? validHours : undefined,
                        });
                      }
                    }}
                    placeholder="9, 13, 17"
                    style={responsiveMaxWidthStyle}
                  />
                </Form.Field>
                <Form.Field>
                  {labelWithInfo(
                    'Minutes',
                    'Comma-separated minutes (0–59). Example: 0, 30',
                  )}
                  <Input
                    size="small"
                    value={minutesInputValue}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      setMinutesInputValue(inputValue);

                      // Parse and validate minutes
                      const parts = inputValue.split(',').map((m) => m.trim());
                      const validMinutes = parts
                        .filter((m) => m !== '') // Only process non-empty parts
                        .map((m) => parseInt(m))
                        .filter((m) => !isNaN(m) && m >= 0 && m <= 59);

                      // Only update rule if input is empty or all non-empty parts are valid
                      const nonEmptyParts = parts.filter((m) => m !== '');
                      const allNonEmptyPartsValid =
                        nonEmptyParts.length === 0 ||
                        nonEmptyParts.every((m) => {
                          const num = parseInt(m);
                          return !isNaN(num) && num >= 0 && num <= 59;
                        });

                      if (allNonEmptyPartsValid) {
                        handleOptionsChange({
                          byminute:
                            validMinutes.length > 0 ? validMinutes : undefined,
                        });
                      }
                    }}
                    placeholder="0, 30"
                    style={responsiveMaxWidthStyle}
                  />
                </Form.Field>
              </Form.Group>
            </Segment>
          </Grid.Column>
        </Grid>
      )}

      {/* Only show duration section for recurring rules */}
      {rule.options.freq !== undefined && (
        <Segment style={{ marginTop: 0, paddingBottom: 0 }}>
          <Header size="tiny" style={{ marginTop: 0 }}>
            Duration
          </Header>
          <Form.Group widths={6}>
            <Form.Field>
              {labelWithInfo('Years', 'Duration years component (0+).')}
              <Input
                size="small"
                type="number"
                value={rule.duration?.years || ''}
                onChange={(e) =>
                  handleDurationChange({
                    years: parseInt(e.target.value) || undefined,
                  })
                }
                min={0}
                placeholder="0"
              />
            </Form.Field>
            <Form.Field>
              {labelWithInfo('Months', 'Duration months component (0+).')}
              <Input
                size="small"
                type="number"
                value={rule.duration?.months || ''}
                onChange={(e) =>
                  handleDurationChange({
                    months: parseInt(e.target.value) || undefined,
                  })
                }
                min={0}
                placeholder="0"
              />
            </Form.Field>
            <Form.Field>
              {labelWithInfo('Days', 'Duration days component (0+).')}
              <Input
                size="small"
                type="number"
                value={rule.duration?.days || ''}
                onChange={(e) =>
                  handleDurationChange({
                    days: parseInt(e.target.value) || undefined,
                  })
                }
                min={0}
                placeholder="0"
              />
            </Form.Field>
            <Form.Field>
              {labelWithInfo('Hours', 'Duration hours component (0+).')}
              <Input
                size="small"
                type="number"
                value={rule.duration?.hours || ''}
                onChange={(e) =>
                  handleDurationChange({
                    hours: parseInt(e.target.value) || undefined,
                  })
                }
                min={0}
                placeholder="0"
              />
            </Form.Field>
            <Form.Field>
              {labelWithInfo('Min', 'Duration minutes component (0+).')}
              <Input
                size="small"
                type="number"
                value={rule.duration?.minutes || ''}
                onChange={(e) =>
                  handleDurationChange({
                    minutes: parseInt(e.target.value) || undefined,
                  })
                }
                min={0}
                placeholder="0"
              />
            </Form.Field>
            <Form.Field>
              {labelWithInfo('Sec', 'Duration seconds component (0+).')}
              <Input
                size="small"
                type="number"
                value={rule.duration?.seconds || ''}
                onChange={(e) =>
                  handleDurationChange({
                    seconds: parseInt(e.target.value) || undefined,
                  })
                }
                min={0}
                placeholder="0"
              />
            </Form.Field>
          </Form.Group>
        </Segment>
      )}

      {showDateValidation &&
        (() => {
          const durationValidationError = validateDuration;

          if (!validateDateRange && !durationValidationError) {
            return null;
          }

          return (
            <Message negative size="small">
              <Message.Header>Validation Error</Message.Header>
              {validateDateRange && (
                <Message.Content>{validateDateRange}</Message.Content>
              )}
              {durationValidationError && (
                <Message.Content>{durationValidationError}</Message.Content>
              )}
            </Message>
          );
        })()}

      {validationError && (
        <Message negative size="small" style={{ marginTop: '1em' }}>
          <Message.Header>Rule Validation Error</Message.Header>
          <Message.Content>{validationError}</Message.Content>
        </Message>
      )}
    </Container>
  );
};
