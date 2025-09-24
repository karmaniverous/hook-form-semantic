import type { RuleJson } from '@karmaniverous/rrstack';
import { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Container,
  Dropdown,
  Form,
  Header,
  Icon,
  Input,
  Message,
} from 'semantic-ui-react';

import { type DateRange, DateRangePickerComponent } from './DateRangePicker';

interface RRStackRuleFormProps {
  rule: RuleJson;
  mode: 'add' | 'edit';
  validationError?: string;
  onRuleChange: (updates: Partial<RuleJson>) => void;
  onSave: () => void;
  onCancel: () => void;
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
  { key: 0, text: 'Monday', value: 0 },
  { key: 1, text: 'Tuesday', value: 1 },
  { key: 2, text: 'Wednesday', value: 2 },
  { key: 3, text: 'Thursday', value: 3 },
  { key: 4, text: 'Friday', value: 4 },
  { key: 5, text: 'Saturday', value: 5 },
  { key: 6, text: 'Sunday', value: 6 },
];

const POSITION_OPTIONS = [
  { key: 1, text: '1st', value: 1 },
  { key: 2, text: '2nd', value: 2 },
  { key: 3, text: '3rd', value: 3 },
  { key: 4, text: '4th', value: 4 },
  { key: -1, text: 'Last', value: -1 },
];

const MONTH_OPTIONS = [
  { key: 1, text: 'January', value: 1 },
  { key: 2, text: 'February', value: 2 },
  { key: 3, text: 'March', value: 3 },
  { key: 4, text: 'April', value: 4 },
  { key: 5, text: 'May', value: 5 },
  { key: 6, text: 'June', value: 6 },
  { key: 7, text: 'July', value: 7 },
  { key: 8, text: 'August', value: 8 },
  { key: 9, text: 'September', value: 9 },
  { key: 10, text: 'October', value: 10 },
  { key: 11, text: 'November', value: 11 },
  { key: 12, text: 'December', value: 12 },
];

export const RRStackRuleForm = ({
  rule,
  mode,
  validationError,
  onRuleChange,
  onSave,
  onCancel,
}: RRStackRuleFormProps) => {
  const [showDateValidation, setShowDateValidation] = useState(false);

  const labelWithInfo = useCallback(
    (text: string, help: string) => (
      <label>
        {text}{' '}
        <Icon
          name="info circle"
          title={help}
          style={{ marginLeft: 4, opacity: 0.6 }}
        />
      </label>
    ),
    [],
  );

  // Get current date range from rule data
  const getDateRange = useMemo((): DateRange => {
    const startDate = rule.options.starts
      ? new Date(rule.options.starts)
      : null;
    const endDate = rule.options.ends ? new Date(rule.options.ends) : null;
    return [startDate, endDate];
  }, [rule.options.starts, rule.options.ends]);

  // Validate date range - only check order when both dates are present
  const validateDateRange = useMemo((): string | null => {
    const [startDate, endDate] = getDateRange;
    // Only validate date order if both dates are present (both are optional)
    if (startDate && endDate && startDate >= endDate) {
      return 'Start date must be before end date';
    }

    return null;
  }, [getDateRange]);

  // Validate duration - at least one field must be positive for recurring rules
  const validateDuration = (): string | null => {
    // Skip duration validation for span rules (freq is undefined)
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
  };

  // Handle save with validation
  const handleSave = () => {
    const durationValidationError = validateDuration();

    if (validateDateRange || durationValidationError) {
      setShowDateValidation(true);
      return;
    }
    setShowDateValidation(false);
    onSave();
  };

  // Handle date range changes
  const handleDateRangeChange = useCallback(
    (dateRange: DateRange) => {
      const [startDate, endDate] = dateRange;

      // Clear validation error if validation passes after this change
      if (showDateValidation) {
        if (
          (!startDate && !endDate) ||
          (startDate && endDate && startDate < endDate)
        ) {
          setShowDateValidation(false);
        }
      }

      onRuleChange({
        options: {
          ...rule.options,
          starts: startDate ? startDate.getTime() : undefined,
          ends: endDate ? endDate.getTime() : undefined,
        },
      });
    },
    [onRuleChange, rule.options, showDateValidation],
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

  return (
    <Container>
      <Form.Group widths="equal">
        <Form.Field>
          <label>Label</label>
          <Input
            size="small"
            value={rule.label || ''}
            onChange={(e) => handleFieldChange({ label: e.target.value })}
            placeholder="Rule label"
          />
        </Form.Field>
        <Form.Field>
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
        <Form.Field>
          {labelWithInfo(
            'Frequency',
            'Span = a continuous time range (no recurrence). Yearly/Monthly/etc. define recurring schedules.',
          )}
          <Dropdown
            selection
            compact
            options={FREQUENCY_OPTIONS}
            value={rule.options.freq === undefined ? 'span' : rule.options.freq}
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

              // When switching to span rule, clear duration
              if (freq === undefined) {
                handleFieldChange({
                  options: {
                    ...rule.options,
                    freq: undefined,
                  },
                  duration: undefined,
                });
              } else {
                // When switching from span to recurring rule, ensure duration exists
                handleFieldChange({
                  options: {
                    ...rule.options,
                    freq,
                  },
                  duration: rule.duration || {},
                });
              }
            }}
          />
        </Form.Field>
        {/* Only show interval for recurring rules */}
        {rule.options.freq !== undefined && (
          <Form.Field>
            {labelWithInfo(
              'Interval',
              'Number of frequency units to skip between occurrences. Example: every 2 weeks.',
            )}
            <Input
              size="small"
              type="number"
              value={rule.options.interval || 1}
              onChange={(e) =>
                handleOptionsChange({
                  interval: parseInt(e.target.value) || 1,
                })
              }
              min={1}
            />
          </Form.Field>
        )}
      </Form.Group>

      {/* Only show duration section for recurring rules */}
      {rule.options.freq !== undefined && (
        <>
          <Header size="tiny">Duration</Header>
          <Form.Group>
            <Form.Field width={2}>
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
            <Form.Field width={2}>
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
            <Form.Field width={2}>
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
            <Form.Field width={2}>
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
            <Form.Field width={2}>
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
            <Form.Field width={2}>
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
        </>
      )}

      {/* Recurrence-only constraints: hide when Span (no freq) */}
      {rule.options.freq !== undefined && (
        <>
          <Header size="tiny">Time of Day</Header>
          <Form.Group widths="equal">
            <Form.Field>
              {labelWithInfo(
                'Hours',
                'Comma-separated hours (0–23). Example: 9, 13, 17',
              )}
              <Input
                size="small"
                value={
                  rule.options.byhour
                    ? Array.isArray(rule.options.byhour)
                      ? rule.options.byhour.join(', ')
                      : rule.options.byhour.toString()
                    : ''
                }
                onChange={(e) => {
                  const hours = e.target.value
                    .split(',')
                    .map((h) => parseInt(h.trim()))
                    .filter((h) => !isNaN(h) && h >= 0 && h <= 23);
                  handleOptionsChange({
                    byhour: hours.length > 0 ? hours : undefined,
                  });
                }}
                placeholder="e.g., 9, 13, 17"
              />
            </Form.Field>
            <Form.Field>
              {labelWithInfo(
                'Minutes',
                'Comma-separated minutes (0–59). Example: 0, 30',
              )}
              <Input
                size="small"
                value={
                  rule.options.byminute
                    ? Array.isArray(rule.options.byminute)
                      ? rule.options.byminute.join(', ')
                      : rule.options.byminute.toString()
                    : ''
                }
                onChange={(e) => {
                  const minutes = e.target.value
                    .split(',')
                    .map((m) => parseInt(m.trim()))
                    .filter((m) => !isNaN(m) && m >= 0 && m <= 59);
                  handleOptionsChange({
                    byminute: minutes.length > 0 ? minutes : undefined,
                  });
                }}
                placeholder="e.g., 0, 30"
              />
            </Form.Field>
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
                'Select nth occurrence within the period (e.g., 1st, 2nd, Last).',
              )}
              <Dropdown
                selection
                multiple
                compact
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
        </>
      )}

      {rule.options.freq !== undefined && (
        <Form.Group widths="equal">
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
              placeholder="Select months"
            />
          </Form.Field>
          <Form.Field>
            {labelWithInfo(
              'Days of Month (1-31)',
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
              placeholder="e.g., 25 (for 25th) or 1, 15, 31"
            />
          </Form.Field>
          <Form.Field>
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
              placeholder="Number of occurrences"
            />
          </Form.Field>
        </Form.Group>
      )}

      <DateRangePickerComponent
        label={labelWithInfo(
          'Date Range',
          'Optional start/end timestamps that bound the rule’s validity window.',
        )}
        value={getDateRange}
        onChange={handleDateRangeChange}
        error={
          showDateValidation && validateDateRange
            ? validateDateRange
            : undefined
        }
      />
      {showDateValidation &&
        (() => {
          const durationValidationError = validateDuration();

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

      <Container style={{ marginTop: '1em' }}>
        <Button type="button" primary size="small" onClick={handleSave}>
          {mode === 'add' ? 'Add Rule' : 'Update Rule'}
        </Button>
        <Button
          type="button"
          size="small"
          onClick={onCancel}
          style={{ marginLeft: '0.5em' }}
        >
          Cancel
        </Button>
      </Container>

      {validationError && (
        <Message negative size="small" style={{ marginTop: '1em' }}>
          <Message.Header>Rule Validation Error</Message.Header>
          <Message.Content>{validationError}</Message.Content>
        </Message>
      )}
    </Container>
  );
};
