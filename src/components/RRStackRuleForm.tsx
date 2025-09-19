import type { RuleJson } from '@karmaniverous/rrstack';
import { useCallback, useState } from 'react';
import DatePicker from 'react-date-picker';
import DateTimePicker from 'react-datetime-picker';
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  Header,
  Input,
  Message,
} from 'semantic-ui-react';

interface RRStackRuleFormProps {
  rule: RuleJson;
  mode: 'add' | 'edit';
  validationError?: string;
  onRuleChange: (updates: Partial<RuleJson>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const FREQUENCY_OPTIONS = [
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
  const [includeStartTime, setIncludeStartTime] = useState(false);
  const [includeEndTime, setIncludeEndTime] = useState(false);

  // Get current dates directly from rule data (assuming milliseconds)
  const getStartDate = (): Date | null => {
    return rule.options.starts ? new Date(rule.options.starts) : null;
  };

  const getEndDate = (): Date | null => {
    return rule.options.ends ? new Date(rule.options.ends) : null;
  };

  // Simple validation function using rule data directly
  const validateDateRange = (): string | null => {
    const startDate = getStartDate();
    const endDate = getEndDate();

    // Check date order first if both dates are present
    if (startDate && endDate && startDate >= endDate) {
      return 'Start date must be before end date';
    }

    // Then check for missing dates
    if (!startDate && !endDate) {
      return 'Both start and end dates are required';
    }
    if (!startDate) {
      return 'Start date is required';
    }
    if (!endDate) {
      return 'End date is required';
    }

    return null;
  };

  // Handle save with validation
  const handleSave = () => {
    const dateValidationError = validateDateRange();
    if (dateValidationError) {
      setShowDateValidation(true);
      return;
    }
    setShowDateValidation(false);
    onSave();
  };

  // Handle start date changes - let rrstack handle time calculations
  const handleStartDateChange = useCallback(
    (value: Date | null | [Date | null, Date | null]) => {
      // Handle the Value type from date picker (can be Date, null, or array)
      const date = Array.isArray(value) ? value[0] : value;

      if (!date) {
        onRuleChange({
          options: {
            ...rule.options,
            starts: undefined,
          },
        });
        return;
      }

      const startTimestamp = date.getTime();

      // Clear validation error if validation passes after this change
      if (showDateValidation) {
        const endDate = getEndDate();
        if (date && endDate && date < endDate) {
          setShowDateValidation(false);
        }
      }

      onRuleChange({
        options: {
          ...rule.options,
          starts: startTimestamp,
        },
      });
    },
    [onRuleChange, rule.options, showDateValidation, getEndDate],
  );

  // Handle end date changes - let rrstack handle time calculations
  const handleEndDateChange = useCallback(
    (value: Date | null | [Date | null, Date | null]) => {
      // Handle the Value type from date picker (can be Date, null, or array)
      const date = Array.isArray(value) ? value[0] : value;

      if (!date) {
        onRuleChange({
          options: {
            ...rule.options,
            ends: undefined,
          },
        });
        return;
      }

      const endTimestamp = date.getTime();

      // Clear validation error if validation passes after this change
      if (showDateValidation) {
        const startDate = getStartDate();
        if (startDate && date && startDate < date) {
          setShowDateValidation(false);
        }
      }

      onRuleChange({
        options: {
          ...rule.options,
          ends: endTimestamp,
        },
      });
    },
    [onRuleChange, rule.options, showDateValidation, getStartDate],
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
    <>
      <Form.Group widths="equal">
        <Form.Field>
          <label style={{ fontSize: '0.9em' }}>Label</label>
          <Input
            size="small"
            value={rule.label || ''}
            onChange={(e) => handleFieldChange({ label: e.target.value })}
            placeholder="Rule label"
          />
        </Form.Field>
        <Form.Field>
          <label style={{ fontSize: '0.9em' }}>Effect</label>
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

      <Form.Group widths="equal">
        <Form.Field>
          <label style={{ fontSize: '0.9em' }}>Frequency</label>
          <Dropdown
            selection
            compact
            options={FREQUENCY_OPTIONS}
            value={rule.options.freq}
            onChange={(e, { value }) =>
              handleOptionsChange({
                freq: value as
                  | 'yearly'
                  | 'monthly'
                  | 'weekly'
                  | 'daily'
                  | 'hourly'
                  | 'minutely'
                  | 'secondly',
              })
            }
          />
        </Form.Field>
        <Form.Field>
          <label style={{ fontSize: '0.9em' }}>Interval</label>
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
      </Form.Group>

      <Header size="tiny">Duration</Header>
      <Form.Group style={{ alignItems: 'flex-end' }}>
        <Form.Field width={2}>
          <label style={{ fontSize: '0.8em' }}>Years</label>
          <Input
            size="mini"
            type="number"
            value={rule.duration.years || ''}
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
          <label style={{ fontSize: '0.8em' }}>Months</label>
          <Input
            size="mini"
            type="number"
            value={rule.duration.months || ''}
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
          <label style={{ fontSize: '0.8em' }}>Days</label>
          <Input
            size="mini"
            type="number"
            value={rule.duration.days || ''}
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
          <label style={{ fontSize: '0.8em' }}>Hours</label>
          <Input
            size="mini"
            type="number"
            value={rule.duration.hours || ''}
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
          <label style={{ fontSize: '0.8em' }}>Min</label>
          <Input
            size="mini"
            type="number"
            value={rule.duration.minutes || ''}
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
          <label style={{ fontSize: '0.8em' }}>Sec</label>
          <Input
            size="mini"
            type="number"
            value={rule.duration.seconds || ''}
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

      <Header size="tiny">Time of Day</Header>
      <Form.Group style={{ alignItems: 'flex-end' }}>
        <Form.Field width={8}>
          <label style={{ fontSize: '0.8em' }}>
            Hours (0-23, comma-separated)
          </label>
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
        <Form.Field width={8}>
          <label style={{ fontSize: '0.8em' }}>
            Minutes (0-59, comma-separated)
          </label>
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
      </Form.Group>

      <Form.Group widths="equal">
        <Form.Field>
          <label style={{ fontSize: '0.9em' }}>
            Weekdays (for weekly/monthly rules)
          </label>
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
            placeholder="Select weekdays"
          />
        </Form.Field>
        <Form.Field>
          <label style={{ fontSize: '0.9em' }}>Position (1st, 2nd, etc.)</label>
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
            placeholder="Select positions"
          />
        </Form.Field>
      </Form.Group>

      <Form.Group widths="equal">
        <Form.Field>
          <label style={{ fontSize: '0.9em' }}>
            Months (for yearly/specific month rules)
          </label>
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
          <label style={{ fontSize: '0.9em' }}>Days of Month (1-31)</label>
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
      </Form.Group>

      <Form.Group>
        <Form.Field width={8}>
          <label style={{ fontSize: '0.9em' }}>Count (optional)</label>
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

      <Form.Group widths="equal">
        <Form.Field className="hook-form-date-picker">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '0.9em' }}>Start Date *</label>
            <Checkbox
              checked={includeStartTime}
              label="Include Time"
              onChange={(event, data) =>
                setIncludeStartTime(data.checked || false)
              }
            />
          </div>
          <div className="input">
            {includeStartTime ? (
              <DateTimePicker
                dayPlaceholder="dd"
                disableClock
                hourPlaceholder="hh"
                maxDetail="minute"
                minutePlaceholder="mm"
                monthPlaceholder="mm"
                onChange={handleStartDateChange}
                secondPlaceholder="ss"
                showLeadingZeros
                yearPlaceholder="yyyy"
                value={getStartDate()}
                calendarProps={{
                  showNeighboringMonth: false,
                  showNavigation: true,
                  returnValue: 'start',
                }}
              />
            ) : (
              <DatePicker
                dayPlaceholder="dd"
                monthPlaceholder="mm"
                onChange={handleStartDateChange}
                showLeadingZeros
                yearPlaceholder="yyyy"
                value={getStartDate()}
                calendarProps={{
                  showNeighboringMonth: false,
                  showNavigation: true,
                  returnValue: 'start',
                }}
              />
            )}
          </div>
        </Form.Field>
        <Form.Field className="hook-form-date-picker">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '0.9em' }}>End Date *</label>
            <Checkbox
              checked={includeEndTime}
              label="Include Time"
              onChange={(event, data) =>
                setIncludeEndTime(data.checked || false)
              }
            />
          </div>
          <div className="input">
            {includeEndTime ? (
              <DateTimePicker
                dayPlaceholder="dd"
                disableClock
                hourPlaceholder="hh"
                maxDetail="minute"
                minutePlaceholder="mm"
                monthPlaceholder="mm"
                onChange={handleEndDateChange}
                secondPlaceholder="ss"
                showLeadingZeros
                yearPlaceholder="yyyy"
                value={getEndDate()}
                calendarProps={{
                  showNeighboringMonth: false,
                  showNavigation: true,
                  returnValue: 'start',
                }}
              />
            ) : (
              <DatePicker
                dayPlaceholder="dd"
                monthPlaceholder="mm"
                onChange={handleEndDateChange}
                showLeadingZeros
                yearPlaceholder="yyyy"
                value={getEndDate()}
                calendarProps={{
                  showNeighboringMonth: false,
                  showNavigation: true,
                  returnValue: 'start',
                }}
              />
            )}
          </div>
        </Form.Field>
      </Form.Group>

      {showDateValidation &&
        (() => {
          const dateValidationError = validateDateRange();
          return dateValidationError ? (
            <Message negative size="small">
              <Message.Header>Date Range Error</Message.Header>
              <p>{dateValidationError}</p>
            </Message>
          ) : null;
        })()}

      <Button.Group size="small" style={{ marginTop: '1em' }}>
        <Button type="button" primary onClick={handleSave}>
          {mode === 'add' ? 'Add Rule' : 'Update Rule'}
        </Button>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
      </Button.Group>

      {validationError && (
        <Message negative size="small" style={{ marginTop: '1em' }}>
          <Message.Header>Rule Validation Error</Message.Header>
          <p>{validationError}</p>
        </Message>
      )}
    </>
  );
};
