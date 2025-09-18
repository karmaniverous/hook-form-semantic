/**
 * Requirements addressed:
 * - RHF-integrated RRStack field component following library patterns.
 * - Use Semantic UI Form.Field and propagate FormFieldProps.
 * - Surface RHF validation via Form.Field error and an inline Label.
 * - Use minimal event-like objects for RHF onChange compatibility.
 * - Maintain type safety with generics and UseControllerProps.
 * - Show RRStack-specific validation errors using Semantic UI Message.
 */

import type { RRStackOptions, RuleJson } from '@karmaniverous/rrstack';
import { RRStack } from '@karmaniverous/rrstack';
import { useRRStack, useRRStackSelector } from '@karmaniverous/rrstack/react';
import { useCallback, useMemo, useState } from 'react';
import type { FieldValues } from 'react-hook-form';
import {
  type ControllerProps,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import {
  Button,
  Card,
  Dropdown,
  Form,
  type FormFieldProps,
  Header,
  Icon,
  Input,
  Label,
  Message,
  Segment,
} from 'semantic-ui-react';

import {
  deprefix,
  type PrefixedPartial,
} from '../../lib/utils/PrefixedPartial';

export interface HookFormRRStackProps<T extends FieldValues>
  extends Omit<
      FormFieldProps,
      | 'children'
      | 'checked'
      | 'control'
      | 'disabled'
      | 'error'
      | 'name'
      | 'onBlur'
      | 'onChange'
      | 'ref'
      | 'value'
    >,
    PrefixedPartial<Omit<ControllerProps<T>, 'render'>, 'hook'> {
  timezone?: string;
  timeUnit?: 'ms' | 's';
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

const createDefaultRule = (): RuleJson => ({
  effect: 'active',
  duration: {},
  options: {
    freq: 'daily',
  },
  label: '',
});

export const HookFormRRStack = <T extends FieldValues>({
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  timeUnit = 'ms',
  ...props
}: HookFormRRStackProps<T>) => {
  const { hook: hookProps, rest: fieldProps } = useMemo(
    () => deprefix(props, 'hook'),
    [props],
  );

  const {
    field: { onChange: hookFieldOnChange, value },
    fieldState: { error },
  } = useController(hookProps as UseControllerProps);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [editingRule, setEditingRule] = useState<RuleJson | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    timezone?: string;
    rules?: string;
    editingRule?: string;
  }>({});

  const currentValue: RRStackOptions = value || {
    timezone,
    timeUnit,
    rules: [],
  };

  // Validate timezone using RRStack's built-in validation
  const validateTimezone = useCallback((tz: string): string | undefined => {
    if (!RRStack.isValidTimeZone(tz)) {
      return `Invalid timezone: ${tz}`;
    }
    return undefined;
  }, []);

  // Validate rule using RRStack's compilation process
  const validateRule = useCallback(
    (rule: RuleJson): string | undefined => {
      try {
        // Test rule by creating a temporary RRStack with just this rule
        new RRStack({
          timezone: currentValue.timezone,
          timeUnit: currentValue.timeUnit || 'ms',
          rules: [rule],
        });
        return undefined;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : 'Invalid rule configuration';
      }
    },
    [currentValue.timezone, currentValue.timeUnit],
  );

  // Use RRStack React hooks for optimized state management with error handling
  const handleRRStackChange = useCallback(
    (stack: { toJson: () => RRStackOptions }) => {
      try {
        const newValue = stack.toJson();
        // Clear validation errors on successful change
        setValidationErrors({});
        hookFieldOnChange({ target: { value: newValue } } as {
          target: { value: RRStackOptions };
        });
      } catch (error) {
        // Handle RRStack validation errors
        const errorMessage =
          error instanceof Error ? error.message : 'RRStack validation failed';
        setValidationErrors({ rules: errorMessage });
      }
    },
    [hookFieldOnChange],
  );

  // Use RRStack React hooks properly
  const { rrstack } = useRRStack(currentValue, handleRRStackChange, {
    debounce: { delay: 300, trailing: true },
    resetKey: `${currentValue.timezone}-${currentValue.timeUnit}`,
  });

  // Use selectors for optimized access to frequently used data
  const rulesCount = useRRStackSelector(rrstack, (s) => s.rules.length);
  const rules = useRRStackSelector(rrstack, (s) => s.rules);

  const renderRuleCard = useCallback(
    (
      rule: RuleJson,
      index: number,
      rrstack: {
        describeRule: (index: number) => string;
        removeRule: (index: number) => void;
        up: (index: number) => void;
        down: (index: number) => void;
        top: (index: number) => void;
        bottom: (index: number) => void;
      },
    ) => {
      const isActive = activeIndex === index;
      const ruleDescription = rrstack.describeRule(index);

      const handleToggle = () => {
        setActiveIndex(isActive ? null : index);
      };

      const handleEdit = () => {
        setEditingRule({ ...rule });
        setEditingIndex(index);
      };

      const handleDelete = () => {
        rrstack.removeRule(index);
      };

      const handleMoveUp = () => {
        if (index > 0) {
          rrstack.up(index);
        }
      };

      const handleMoveDown = () => {
        if (index < rulesCount - 1) {
          rrstack.down(index);
        }
      };

      const handleMoveTop = () => {
        if (index > 0) {
          rrstack.top(index);
        }
      };

      const handleMoveBottom = () => {
        if (index < rulesCount - 1) {
          rrstack.bottom(index);
        }
      };

      return (
        <Card key={index} fluid>
          <Card.Content>
            <Card.Header>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Label
                    color={rule.effect === 'active' ? 'green' : 'red'}
                    size="small"
                  >
                    {rule.effect.toUpperCase()}
                  </Label>
                  <span>{rule.label || `Rule ${index + 1}`}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Button.Group size="mini">
                    <Button
                      type="button"
                      icon="angle double up"
                      onClick={handleMoveTop}
                      disabled={index === 0}
                      title="Move to top"
                    />
                    <Button
                      type="button"
                      icon="angle up"
                      onClick={handleMoveUp}
                      disabled={index === 0}
                      title="Move up"
                    />
                    <Button
                      type="button"
                      icon="angle down"
                      onClick={handleMoveDown}
                      disabled={index === rulesCount - 1}
                      title="Move down"
                    />
                    <Button
                      type="button"
                      icon="angle double down"
                      onClick={handleMoveBottom}
                      disabled={index === rulesCount - 1}
                      title="Move to bottom"
                    />
                  </Button.Group>
                  <Button.Group size="mini">
                    <Button
                      type="button"
                      icon="edit"
                      onClick={handleEdit}
                      title="Edit rule"
                    />
                    <Button
                      type="button"
                      icon="delete"
                      onClick={handleDelete}
                      title="Delete rule"
                      color="red"
                    />
                  </Button.Group>
                  <Button
                    type="button"
                    icon={isActive ? 'chevron up' : 'chevron down'}
                    onClick={handleToggle}
                    title={isActive ? 'Collapse' : 'Expand'}
                  />
                </div>
              </div>
            </Card.Header>
            <Card.Meta>{ruleDescription}</Card.Meta>
          </Card.Content>
          {isActive && (
            <Card.Content>
              <Segment basic>
                <Header size="small">Rule Details</Header>
                <div style={{ marginBottom: 8 }}>
                  <strong>Effect:</strong> {rule.effect}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Duration:</strong>{' '}
                  {Object.entries(rule.duration)
                    .map(([key, value]) => `${value} ${key}`)
                    .join(', ')}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Frequency:</strong> {rule.options.freq}
                </div>
                {rule.options.byhour && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Hours:</strong>{' '}
                    {Array.isArray(rule.options.byhour)
                      ? rule.options.byhour.join(', ')
                      : rule.options.byhour}
                  </div>
                )}
                {rule.options.byminute && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Minutes:</strong>{' '}
                    {Array.isArray(rule.options.byminute)
                      ? rule.options.byminute.join(', ')
                      : rule.options.byminute}
                  </div>
                )}
                {rule.options.bysecond && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Seconds:</strong>{' '}
                    {Array.isArray(rule.options.bysecond)
                      ? rule.options.bysecond.join(', ')
                      : rule.options.bysecond}
                  </div>
                )}
                {rule.options.count && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Count:</strong> {rule.options.count}
                  </div>
                )}
                {rule.options.interval && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Interval:</strong> {rule.options.interval}
                  </div>
                )}
              </Segment>
            </Card.Content>
          )}
        </Card>
      );
    },
    [activeIndex],
  );

  const renderRuleEditor = useCallback(
    (onSave: (rule: RuleJson) => void, onCancel: () => void) => {
      if (!editingRule) return null;

      const handleSave = () => {
        // Validate rule before attempting to save
        const ruleError = validateRule(editingRule);
        if (ruleError) {
          setValidationErrors({ editingRule: ruleError });
          return; // Keep form open to show validation error
        }

        // Only proceed with save and close if validation passes
        onSave(editingRule);
        setEditingRule(null);
        setEditingIndex(null);
      };

      const handleCancel = () => {
        onCancel();
        setEditingRule(null);
        setEditingIndex(null);
      };

      const updateRule = (updates: Partial<RuleJson>) => {
        setEditingRule((prev) => (prev ? { ...prev, ...updates } : null));
      };

      return (
        <Segment>
          <Header size="small">
            {editingIndex !== null ? 'Edit Rule' : 'Add New Rule'}
          </Header>
          <div>
            <Form.Group widths="equal">
              <Form.Field>
                <label>Label</label>
                <Input
                  value={editingRule.label || ''}
                  onChange={(e) => updateRule({ label: e.target.value })}
                  placeholder="Rule label"
                />
              </Form.Field>
              <Form.Field>
                <label>Effect</label>
                <Dropdown
                  selection
                  options={EFFECT_OPTIONS}
                  value={editingRule.effect}
                  onChange={(e, { value }) =>
                    updateRule({ effect: value as 'active' | 'blackout' })
                  }
                />
              </Form.Field>
            </Form.Group>

            <Form.Group widths="equal">
              <Form.Field>
                <label>Frequency</label>
                <Dropdown
                  selection
                  options={FREQUENCY_OPTIONS}
                  value={editingRule.options.freq}
                  onChange={(e, { value }) =>
                    updateRule({
                      options: {
                        ...editingRule.options,
                        freq: value as
                          | 'yearly'
                          | 'monthly'
                          | 'weekly'
                          | 'daily'
                          | 'hourly'
                          | 'minutely'
                          | 'secondly',
                      },
                    })
                  }
                />
              </Form.Field>
              <Form.Field>
                <label>Interval</label>
                <Input
                  type="number"
                  value={editingRule.options.interval || 1}
                  onChange={(e) =>
                    updateRule({
                      options: {
                        ...editingRule.options,
                        interval: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                  min={1}
                />
              </Form.Field>
            </Form.Group>

            <Header size="tiny">Duration</Header>
            <Form.Group widths="equal">
              <Form.Field>
                <label>Years</label>
                <Input
                  type="number"
                  value={editingRule.duration.years || ''}
                  onChange={(e) =>
                    updateRule({
                      duration: {
                        ...editingRule.duration,
                        years: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  min={0}
                />
              </Form.Field>
              <Form.Field>
                <label>Months</label>
                <Input
                  type="number"
                  value={editingRule.duration.months || ''}
                  onChange={(e) =>
                    updateRule({
                      duration: {
                        ...editingRule.duration,
                        months: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  min={0}
                />
              </Form.Field>
              <Form.Field>
                <label>Days</label>
                <Input
                  type="number"
                  value={editingRule.duration.days || ''}
                  onChange={(e) =>
                    updateRule({
                      duration: {
                        ...editingRule.duration,
                        days: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  min={0}
                />
              </Form.Field>
            </Form.Group>

            <Form.Group widths="equal">
              <Form.Field>
                <label>Hours</label>
                <Input
                  type="number"
                  value={editingRule.duration.hours || ''}
                  onChange={(e) =>
                    updateRule({
                      duration: {
                        ...editingRule.duration,
                        hours: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  min={0}
                />
              </Form.Field>
              <Form.Field>
                <label>Minutes</label>
                <Input
                  type="number"
                  value={editingRule.duration.minutes || ''}
                  onChange={(e) =>
                    updateRule({
                      duration: {
                        ...editingRule.duration,
                        minutes: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  min={0}
                />
              </Form.Field>
              <Form.Field>
                <label>Seconds</label>
                <Input
                  type="number"
                  value={editingRule.duration.seconds || ''}
                  onChange={(e) =>
                    updateRule({
                      duration: {
                        ...editingRule.duration,
                        seconds: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  min={0}
                />
              </Form.Field>
            </Form.Group>

            <Header size="tiny">Time of Day</Header>
            <Form.Group widths="equal">
              <Form.Field>
                <label>Hours (0-23, comma-separated)</label>
                <Input
                  value={
                    editingRule.options.byhour
                      ? Array.isArray(editingRule.options.byhour)
                        ? editingRule.options.byhour.join(', ')
                        : editingRule.options.byhour.toString()
                      : ''
                  }
                  onChange={(e) => {
                    const hours = e.target.value
                      .split(',')
                      .map((h) => parseInt(h.trim()))
                      .filter((h) => !isNaN(h) && h >= 0 && h <= 23);
                    updateRule({
                      options: {
                        ...editingRule.options,
                        byhour: hours.length > 0 ? hours : undefined,
                      },
                    });
                  }}
                  placeholder="e.g., 9, 13, 17"
                />
              </Form.Field>
              <Form.Field>
                <label>Minutes (0-59, comma-separated)</label>
                <Input
                  value={
                    editingRule.options.byminute
                      ? Array.isArray(editingRule.options.byminute)
                        ? editingRule.options.byminute.join(', ')
                        : editingRule.options.byminute.toString()
                      : ''
                  }
                  onChange={(e) => {
                    const minutes = e.target.value
                      .split(',')
                      .map((m) => parseInt(m.trim()))
                      .filter((m) => !isNaN(m) && m >= 0 && m <= 59);
                    updateRule({
                      options: {
                        ...editingRule.options,
                        byminute: minutes.length > 0 ? minutes : undefined,
                      },
                    });
                  }}
                  placeholder="e.g., 0, 30"
                />
              </Form.Field>
            </Form.Group>

            <Form.Group widths="equal">
              <Form.Field>
                <label>Weekdays (for weekly/monthly rules)</label>
                <Dropdown
                  selection
                  multiple
                  search
                  options={WEEKDAY_OPTIONS}
                  value={
                    Array.isArray(editingRule.options.byweekday)
                      ? editingRule.options.byweekday.filter(
                          (day): day is number => typeof day === 'number',
                        )
                      : typeof editingRule.options.byweekday === 'number'
                        ? [editingRule.options.byweekday]
                        : []
                  }
                  onChange={(e, { value }) =>
                    updateRule({
                      options: {
                        ...editingRule.options,
                        byweekday:
                          (value as number[]).length > 0
                            ? (value as number[])
                            : undefined,
                      },
                    })
                  }
                  placeholder="Select weekdays"
                />
              </Form.Field>
              <Form.Field>
                <label>Position (1st, 2nd, etc.)</label>
                <Dropdown
                  selection
                  multiple
                  options={POSITION_OPTIONS}
                  value={editingRule.options.bysetpos || []}
                  onChange={(e, { value }) =>
                    updateRule({
                      options: {
                        ...editingRule.options,
                        bysetpos:
                          (value as number[]).length > 0
                            ? (value as number[])
                            : undefined,
                      },
                    })
                  }
                  placeholder="Select positions"
                />
              </Form.Field>
            </Form.Group>

            <Form.Group widths="equal">
              <Form.Field>
                <label>Months (for yearly/specific month rules)</label>
                <Dropdown
                  selection
                  multiple
                  search
                  options={MONTH_OPTIONS}
                  value={editingRule.options.bymonth || []}
                  onChange={(e, { value }) =>
                    updateRule({
                      options: {
                        ...editingRule.options,
                        bymonth:
                          (value as number[]).length > 0
                            ? (value as number[])
                            : undefined,
                      },
                    })
                  }
                  placeholder="Select months"
                />
              </Form.Field>
              <Form.Field>
                <label>Days of Month (1-31)</label>
                <Input
                  value={
                    editingRule.options.bymonthday
                      ? Array.isArray(editingRule.options.bymonthday)
                        ? editingRule.options.bymonthday.join(', ')
                        : editingRule.options.bymonthday.toString()
                      : ''
                  }
                  onChange={(e) => {
                    const days = e.target.value
                      .split(',')
                      .map((d) => parseInt(d.trim()))
                      .filter((d) => !isNaN(d) && d >= 1 && d <= 31);
                    updateRule({
                      options: {
                        ...editingRule.options,
                        bymonthday: days.length > 0 ? days : undefined,
                      },
                    });
                  }}
                  placeholder="e.g., 25 (for 25th) or 1, 15, 31"
                />
              </Form.Field>
            </Form.Group>

            <Form.Group>
              <Form.Field>
                <label>Count (optional)</label>
                <Input
                  type="number"
                  value={editingRule.options.count || ''}
                  onChange={(e) =>
                    updateRule({
                      options: {
                        ...editingRule.options,
                        count: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  min={1}
                  placeholder="Number of occurrences"
                />
              </Form.Field>
            </Form.Group>

            <Button.Group>
              <Button type="button" primary onClick={handleSave}>
                {editingIndex !== null ? 'Update Rule' : 'Add Rule'}
              </Button>
              <Button type="button" onClick={handleCancel}>
                Cancel
              </Button>
            </Button.Group>
          </div>
        </Segment>
      );
    },
    [editingRule, editingIndex],
  );

  const handleAddRule = useCallback(() => {
    setEditingRule(createDefaultRule());
    setEditingIndex(null);
  }, []);

  const handleSaveRule = useCallback(
    (rule: RuleJson) => {
      try {
        if (editingIndex !== null) {
          // Update existing rule by removing and re-adding at same index
          rrstack.removeRule(editingIndex);
          rrstack.addRule(rule, editingIndex);
        } else {
          // Add new rule using RRStack method
          rrstack.addRule(rule);
        }
        // Clear validation errors on successful save
        setValidationErrors({});
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to save rule';
        setValidationErrors({ editingRule: errorMessage });
      }
    },
    [editingIndex, rrstack],
  );

  const handleCancelEdit = useCallback(() => {
    // Just cancel without changes
  }, []);

  // Generate timezone options from browser
  const timezoneOptions = useMemo(() => {
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
  }, []);

  const handleTimezoneChange = useCallback(
    (value: string) => {
      // Validate timezone before setting it
      const timezoneError = validateTimezone(value);
      if (timezoneError) {
        setValidationErrors({ timezone: timezoneError });
        return;
      }

      try {
        rrstack.timezone = value;
        // Clear timezone validation errors on successful change
        setValidationErrors((prev) => ({ ...prev, timezone: undefined }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to set timezone';
        setValidationErrors({ timezone: errorMessage });
      }
    },
    [rrstack, validateTimezone],
  );

  return (
    <div className="field">
      {fieldProps.label && <label>{fieldProps.label}</label>}

      {/* Display React Hook Form errors */}
      {error?.message && (
        <Message negative size="small" style={{ marginBottom: 16 }}>
          <Message.Header>Form Validation Error</Message.Header>
          <p>{error.message}</p>
        </Message>
      )}

      {/* Display RRStack validation errors */}
      {validationErrors.rules && (
        <Message negative size="small" style={{ marginBottom: 16 }}>
          <Message.Header>RRStack Validation Error</Message.Header>
          <p>{validationErrors.rules}</p>
        </Message>
      )}

      <div style={{ marginBottom: 16 }}>
        <Form.Field error={!!validationErrors.timezone}>
          <label>Timezone</label>
          <Dropdown
            placeholder="Select timezone"
            fluid
            search
            selection
            options={timezoneOptions}
            value={currentValue.timezone}
            onChange={(e, { value }) => handleTimezoneChange(value as string)}
          />
          {validationErrors.timezone && (
            <Label basic color="red" pointing>
              {validationErrors.timezone}
            </Label>
          )}
        </Form.Field>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Header size="small">Rules ({rulesCount})</Header>
        <Button type="button" primary onClick={handleAddRule} size="small">
          <Icon name="plus" />
          Add Rule
        </Button>
      </div>

      {editingRule && renderRuleEditor(handleSaveRule, handleCancelEdit)}

      {/* Display rule validation errors below the form, near submit button */}
      {editingRule && validationErrors.editingRule && (
        <Message negative size="small" style={{ marginTop: 16 }}>
          <Message.Header>Rule Validation Error</Message.Header>
          <p>{validationErrors.editingRule}</p>
        </Message>
      )}

      {rulesCount === 0 ? (
        <Message info>
          <Message.Header>No rules defined</Message.Header>
          <p>Add your first rule to start building your schedule.</p>
        </Message>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rules.map((rule: RuleJson, index: number) =>
            renderRuleCard(rule, index, rrstack),
          )}
        </div>
      )}
    </div>
  );
};
