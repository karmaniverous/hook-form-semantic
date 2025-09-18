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
  Accordion,
  Button,
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
        const rawValue = stack.toJson();
        // Clean the data using JSON serialization to remove any comments or non-serializable properties
        const newValue = JSON.parse(JSON.stringify(rawValue));
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

  const handleAddRule = useCallback(() => {
    setEditingRule(createDefaultRule());
    setEditingIndex(null);
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

      <Segment basic style={{ padding: '0 0 1em 0' }}>
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
      </Segment>

      <Segment
        basic
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 0 1em 0',
        }}
      >
        <Header size="small">Rules ({rulesCount})</Header>
        <Button type="button" primary onClick={handleAddRule} size="small">
          <Icon name="plus" />
          Add Rule
        </Button>
      </Segment>

      {/* Show form for adding new rule */}
      {editingRule && editingIndex === null && (
        <Segment style={{ fontSize: '0.9em', marginBottom: '1em' }}>
          <Header size="tiny">Add New Rule</Header>
          <Segment basic>
            <Form.Group widths="equal">
              <Form.Field>
                <label style={{ fontSize: '0.9em' }}>Label</label>
                <Input
                  size="small"
                  value={editingRule.label || ''}
                  onChange={(e) => {
                    const updates = { label: e.target.value };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
                  placeholder="Rule label"
                />
              </Form.Field>
              <Form.Field>
                <label style={{ fontSize: '0.9em' }}>Effect</label>
                <Dropdown
                  selection
                  compact
                  options={EFFECT_OPTIONS}
                  value={editingRule.effect}
                  onChange={(e, { value }) => {
                    const updates = { effect: value as 'active' | 'blackout' };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
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
                  value={editingRule.options.freq}
                  onChange={(e, { value }) => {
                    const updates = {
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
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
                />
              </Form.Field>
              <Form.Field>
                <label style={{ fontSize: '0.9em' }}>Interval</label>
                <Input
                  size="small"
                  type="number"
                  value={editingRule.options.interval || 1}
                  onChange={(e) => {
                    const updates = {
                      options: {
                        ...editingRule.options,
                        interval: parseInt(e.target.value) || 1,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
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
                  value={editingRule.duration.years || ''}
                  onChange={(e) => {
                    const updates = {
                      duration: {
                        ...editingRule.duration,
                        years: parseInt(e.target.value) || undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
                  min={0}
                  placeholder="0"
                />
              </Form.Field>
              <Form.Field width={2}>
                <label style={{ fontSize: '0.8em' }}>Months</label>
                <Input
                  size="mini"
                  type="number"
                  value={editingRule.duration.months || ''}
                  onChange={(e) => {
                    const updates = {
                      duration: {
                        ...editingRule.duration,
                        months: parseInt(e.target.value) || undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
                  min={0}
                  placeholder="0"
                />
              </Form.Field>
              <Form.Field width={2}>
                <label style={{ fontSize: '0.8em' }}>Days</label>
                <Input
                  size="mini"
                  type="number"
                  value={editingRule.duration.days || ''}
                  onChange={(e) => {
                    const updates = {
                      duration: {
                        ...editingRule.duration,
                        days: parseInt(e.target.value) || undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
                  min={0}
                  placeholder="0"
                />
              </Form.Field>
              <Form.Field width={2}>
                <label style={{ fontSize: '0.8em' }}>Hours</label>
                <Input
                  size="mini"
                  type="number"
                  value={editingRule.duration.hours || ''}
                  onChange={(e) => {
                    const updates = {
                      duration: {
                        ...editingRule.duration,
                        hours: parseInt(e.target.value) || undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
                  min={0}
                  placeholder="0"
                />
              </Form.Field>
              <Form.Field width={2}>
                <label style={{ fontSize: '0.8em' }}>Min</label>
                <Input
                  size="mini"
                  type="number"
                  value={editingRule.duration.minutes || ''}
                  onChange={(e) => {
                    const updates = {
                      duration: {
                        ...editingRule.duration,
                        minutes: parseInt(e.target.value) || undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
                  min={0}
                  placeholder="0"
                />
              </Form.Field>
              <Form.Field width={2}>
                <label style={{ fontSize: '0.8em' }}>Sec</label>
                <Input
                  size="mini"
                  type="number"
                  value={editingRule.duration.seconds || ''}
                  onChange={(e) => {
                    const updates = {
                      duration: {
                        ...editingRule.duration,
                        seconds: parseInt(e.target.value) || undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
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
                    const updates = {
                      options: {
                        ...editingRule.options,
                        byhour: hours.length > 0 ? hours : undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
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
                    const updates = {
                      options: {
                        ...editingRule.options,
                        byminute: minutes.length > 0 ? minutes : undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
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
                    Array.isArray(editingRule.options.byweekday)
                      ? editingRule.options.byweekday.filter(
                          (day): day is number => typeof day === 'number',
                        )
                      : typeof editingRule.options.byweekday === 'number'
                        ? [editingRule.options.byweekday]
                        : []
                  }
                  onChange={(e, { value }) => {
                    const updates = {
                      options: {
                        ...editingRule.options,
                        byweekday:
                          (value as number[]).length > 0
                            ? (value as number[])
                            : undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
                  placeholder="Select weekdays"
                />
              </Form.Field>
              <Form.Field>
                <label style={{ fontSize: '0.9em' }}>
                  Position (1st, 2nd, etc.)
                </label>
                <Dropdown
                  selection
                  multiple
                  compact
                  options={POSITION_OPTIONS}
                  value={editingRule.options.bysetpos || []}
                  onChange={(e, { value }) => {
                    const updates = {
                      options: {
                        ...editingRule.options,
                        bysetpos:
                          (value as number[]).length > 0
                            ? (value as number[])
                            : undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
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
                  value={editingRule.options.bymonth || []}
                  onChange={(e, { value }) => {
                    const updates = {
                      options: {
                        ...editingRule.options,
                        bymonth:
                          (value as number[]).length > 0
                            ? (value as number[])
                            : undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
                  placeholder="Select months"
                />
              </Form.Field>
              <Form.Field>
                <label style={{ fontSize: '0.9em' }}>
                  Days of Month (1-31)
                </label>
                <Input
                  size="small"
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
                    const updates = {
                      options: {
                        ...editingRule.options,
                        bymonthday: days.length > 0 ? days : undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
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
                  value={editingRule.options.count || ''}
                  onChange={(e) => {
                    const updates = {
                      options: {
                        ...editingRule.options,
                        count: parseInt(e.target.value) || undefined,
                      },
                    };
                    setEditingRule((prev) =>
                      prev ? { ...prev, ...updates } : null,
                    );
                  }}
                  min={1}
                  placeholder="Number of occurrences"
                />
              </Form.Field>
            </Form.Group>

            <Button.Group size="small">
              <Button
                type="button"
                primary
                onClick={() => {
                  // Validate rule before attempting to save
                  const ruleError = validateRule(editingRule);
                  if (ruleError) {
                    setValidationErrors({ editingRule: ruleError });
                    return;
                  }

                  // Add new rule
                  try {
                    rrstack.addRule(editingRule);
                    setValidationErrors({});
                    setEditingRule(null);
                    setEditingIndex(null);
                  } catch (error) {
                    const errorMessage =
                      error instanceof Error
                        ? error.message
                        : 'Failed to add rule';
                    setValidationErrors({ editingRule: errorMessage });
                  }
                }}
              >
                Add Rule
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setEditingRule(null);
                  setEditingIndex(null);
                }}
              >
                Cancel
              </Button>
            </Button.Group>

            {validationErrors.editingRule && (
              <Message negative size="small" style={{ marginTop: '1em' }}>
                <Message.Header>Rule Validation Error</Message.Header>
                <p>{validationErrors.editingRule}</p>
              </Message>
            )}
          </Segment>
        </Segment>
      )}

      {rulesCount === 0 ? (
        <Message info size="small">
          <Message.Header>No rules defined</Message.Header>
          <p>Add your first rule to start building your schedule.</p>
        </Message>
      ) : (
        <Accordion fluid styled>
          {rules.map((rule: RuleJson, index: number) => {
            const isActive = activeIndex === index;
            const ruleDescription = rrstack.describeRule(index);

            return [
              <Accordion.Title
                key={`title-${index}`}
                active={isActive}
                index={index}
                onClick={() => {
                  if (isActive) {
                    // Close accordion and clear editing state
                    setActiveIndex(null);
                    setEditingRule(null);
                    setEditingIndex(null);
                  } else {
                    // Open accordion and start editing
                    setActiveIndex(index);
                    setEditingRule({ ...rule });
                    setEditingIndex(index);
                  }
                }}
                style={{ fontSize: '0.9em', padding: '0.8em 1em' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Icon name="dropdown" />
                    <Label
                      color={rule.effect === 'active' ? 'green' : 'red'}
                      size="mini"
                    >
                      {rule.effect.toUpperCase()}
                    </Label>
                    <span style={{ fontSize: '0.9em' }}>
                      {rule.label || `Rule ${index + 1}`}
                    </span>
                  </div>
                  <div
                    style={{ display: 'flex', gap: 2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button.Group size="mini">
                      <Button
                        type="button"
                        icon="angle double up"
                        onClick={() => index > 0 && rrstack.top(index)}
                        disabled={index === 0}
                        title="Move to top"
                        size="mini"
                      />
                      <Button
                        type="button"
                        icon="angle up"
                        onClick={() => index > 0 && rrstack.up(index)}
                        disabled={index === 0}
                        title="Move up"
                        size="mini"
                      />
                      <Button
                        type="button"
                        icon="angle down"
                        onClick={() =>
                          index < rulesCount - 1 && rrstack.down(index)
                        }
                        disabled={index === rulesCount - 1}
                        title="Move down"
                        size="mini"
                      />
                      <Button
                        type="button"
                        icon="angle double down"
                        onClick={() =>
                          index < rulesCount - 1 && rrstack.bottom(index)
                        }
                        disabled={index === rulesCount - 1}
                        title="Move to bottom"
                        size="mini"
                      />
                    </Button.Group>
                    <Button
                      type="button"
                      icon="delete"
                      onClick={() => rrstack.removeRule(index)}
                      title="Delete rule"
                      color="red"
                      size="mini"
                    />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '0.8em',
                    color: '#666',
                    marginTop: 4,
                    marginLeft: 16,
                  }}
                >
                  {ruleDescription}
                </div>
              </Accordion.Title>,
              <Accordion.Content key={`content-${index}`} active={isActive}>
                {editingIndex === index && editingRule ? (
                  // Show edit form inside accordion
                  <Segment
                    basic
                    style={{ fontSize: '0.9em', padding: '1em 0' }}
                  >
                    <Form.Group widths="equal">
                      <Form.Field>
                        <label style={{ fontSize: '0.9em' }}>Label</label>
                        <Input
                          size="small"
                          value={editingRule.label || ''}
                          onChange={(e) => {
                            const updates = { label: e.target.value };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
                          placeholder="Rule label"
                        />
                      </Form.Field>
                      <Form.Field>
                        <label style={{ fontSize: '0.9em' }}>Effect</label>
                        <Dropdown
                          selection
                          compact
                          options={EFFECT_OPTIONS}
                          value={editingRule.effect}
                          onChange={(e, { value }) => {
                            const updates = {
                              effect: value as 'active' | 'blackout',
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
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
                          value={editingRule.options.freq}
                          onChange={(e, { value }) => {
                            const updates = {
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
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
                        />
                      </Form.Field>
                      <Form.Field>
                        <label style={{ fontSize: '0.9em' }}>Interval</label>
                        <Input
                          size="small"
                          type="number"
                          value={editingRule.options.interval || 1}
                          onChange={(e) => {
                            const updates = {
                              options: {
                                ...editingRule.options,
                                interval: parseInt(e.target.value) || 1,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
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
                          value={editingRule.duration.years || ''}
                          onChange={(e) => {
                            const updates = {
                              duration: {
                                ...editingRule.duration,
                                years: parseInt(e.target.value) || undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
                          min={0}
                          placeholder="0"
                        />
                      </Form.Field>
                      <Form.Field width={2}>
                        <label style={{ fontSize: '0.8em' }}>Months</label>
                        <Input
                          size="mini"
                          type="number"
                          value={editingRule.duration.months || ''}
                          onChange={(e) => {
                            const updates = {
                              duration: {
                                ...editingRule.duration,
                                months: parseInt(e.target.value) || undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
                          min={0}
                          placeholder="0"
                        />
                      </Form.Field>
                      <Form.Field width={2}>
                        <label style={{ fontSize: '0.8em' }}>Days</label>
                        <Input
                          size="mini"
                          type="number"
                          value={editingRule.duration.days || ''}
                          onChange={(e) => {
                            const updates = {
                              duration: {
                                ...editingRule.duration,
                                days: parseInt(e.target.value) || undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
                          min={0}
                          placeholder="0"
                        />
                      </Form.Field>
                      <Form.Field width={2}>
                        <label style={{ fontSize: '0.8em' }}>Hours</label>
                        <Input
                          size="mini"
                          type="number"
                          value={editingRule.duration.hours || ''}
                          onChange={(e) => {
                            const updates = {
                              duration: {
                                ...editingRule.duration,
                                hours: parseInt(e.target.value) || undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
                          min={0}
                          placeholder="0"
                        />
                      </Form.Field>
                      <Form.Field width={2}>
                        <label style={{ fontSize: '0.8em' }}>Min</label>
                        <Input
                          size="mini"
                          type="number"
                          value={editingRule.duration.minutes || ''}
                          onChange={(e) => {
                            const updates = {
                              duration: {
                                ...editingRule.duration,
                                minutes: parseInt(e.target.value) || undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
                          min={0}
                          placeholder="0"
                        />
                      </Form.Field>
                      <Form.Field width={2}>
                        <label style={{ fontSize: '0.8em' }}>Sec</label>
                        <Input
                          size="mini"
                          type="number"
                          value={editingRule.duration.seconds || ''}
                          onChange={(e) => {
                            const updates = {
                              duration: {
                                ...editingRule.duration,
                                seconds: parseInt(e.target.value) || undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
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
                            const updates = {
                              options: {
                                ...editingRule.options,
                                byhour: hours.length > 0 ? hours : undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
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
                            const updates = {
                              options: {
                                ...editingRule.options,
                                byminute:
                                  minutes.length > 0 ? minutes : undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
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
                            Array.isArray(editingRule.options.byweekday)
                              ? editingRule.options.byweekday.filter(
                                  (day): day is number =>
                                    typeof day === 'number',
                                )
                              : typeof editingRule.options.byweekday ===
                                  'number'
                                ? [editingRule.options.byweekday]
                                : []
                          }
                          onChange={(e, { value }) => {
                            const updates = {
                              options: {
                                ...editingRule.options,
                                byweekday:
                                  (value as number[]).length > 0
                                    ? (value as number[])
                                    : undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
                          placeholder="Select weekdays"
                        />
                      </Form.Field>
                      <Form.Field>
                        <label style={{ fontSize: '0.9em' }}>
                          Position (1st, 2nd, etc.)
                        </label>
                        <Dropdown
                          selection
                          multiple
                          compact
                          options={POSITION_OPTIONS}
                          value={editingRule.options.bysetpos || []}
                          onChange={(e, { value }) => {
                            const updates = {
                              options: {
                                ...editingRule.options,
                                bysetpos:
                                  (value as number[]).length > 0
                                    ? (value as number[])
                                    : undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
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
                          value={editingRule.options.bymonth || []}
                          onChange={(e, { value }) => {
                            const updates = {
                              options: {
                                ...editingRule.options,
                                bymonth:
                                  (value as number[]).length > 0
                                    ? (value as number[])
                                    : undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
                          placeholder="Select months"
                        />
                      </Form.Field>
                      <Form.Field>
                        <label style={{ fontSize: '0.9em' }}>
                          Days of Month (1-31)
                        </label>
                        <Input
                          size="small"
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
                            const updates = {
                              options: {
                                ...editingRule.options,
                                bymonthday: days.length > 0 ? days : undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
                          placeholder="e.g., 25 (for 25th) or 1, 15, 31"
                        />
                      </Form.Field>
                    </Form.Group>

                    <Form.Group>
                      <Form.Field width={8}>
                        <label style={{ fontSize: '0.9em' }}>
                          Count (optional)
                        </label>
                        <Input
                          size="small"
                          type="number"
                          value={editingRule.options.count || ''}
                          onChange={(e) => {
                            const updates = {
                              options: {
                                ...editingRule.options,
                                count: parseInt(e.target.value) || undefined,
                              },
                            };
                            setEditingRule((prev) =>
                              prev ? { ...prev, ...updates } : null,
                            );
                          }}
                          min={1}
                          placeholder="Number of occurrences"
                        />
                      </Form.Field>
                    </Form.Group>

                    <Button.Group size="small" style={{ marginTop: '1em' }}>
                      <Button
                        type="button"
                        primary
                        onClick={() => {
                          // Validate rule before attempting to save
                          const ruleError = validateRule(editingRule);
                          if (ruleError) {
                            setValidationErrors({ editingRule: ruleError });
                            return;
                          }

                          // Save the rule
                          try {
                            rrstack.removeRule(editingIndex);
                            rrstack.addRule(editingRule, editingIndex);
                            setValidationErrors({});
                            setEditingRule(null);
                            setEditingIndex(null);
                          } catch (error) {
                            const errorMessage =
                              error instanceof Error
                                ? error.message
                                : 'Failed to save rule';
                            setValidationErrors({ editingRule: errorMessage });
                          }
                        }}
                      >
                        Update Rule
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setEditingRule(null);
                          setEditingIndex(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </Button.Group>

                    {validationErrors.editingRule && (
                      <Message
                        negative
                        size="small"
                        style={{ marginTop: '1em' }}
                      >
                        <Message.Header>Rule Validation Error</Message.Header>
                        <p>{validationErrors.editingRule}</p>
                      </Message>
                    )}
                  </Segment>
                ) : (
                  // Show summary when not editing
                  <Segment
                    basic
                    style={{ fontSize: '0.85em', padding: '0.5em 0' }}
                  >
                    <Segment basic style={{ marginBottom: 6, padding: 0 }}>
                      <strong>Effect:</strong> {rule.effect}
                    </Segment>
                    <Segment basic style={{ marginBottom: 6, padding: 0 }}>
                      <strong>Duration:</strong>{' '}
                      {Object.entries(rule.duration).length > 0
                        ? Object.entries(rule.duration)
                            .map(([key, value]) => `${value} ${key}`)
                            .join(', ')
                        : 'None'}
                    </Segment>
                    <Segment basic style={{ marginBottom: 6, padding: 0 }}>
                      <strong>Frequency:</strong> {rule.options.freq}
                    </Segment>
                    {rule.options.byhour && (
                      <Segment basic style={{ marginBottom: 6, padding: 0 }}>
                        <strong>Hours:</strong>{' '}
                        {Array.isArray(rule.options.byhour)
                          ? rule.options.byhour.join(', ')
                          : rule.options.byhour}
                      </Segment>
                    )}
                    {rule.options.byminute && (
                      <Segment basic style={{ marginBottom: 6, padding: 0 }}>
                        <strong>Minutes:</strong>{' '}
                        {Array.isArray(rule.options.byminute)
                          ? rule.options.byminute.join(', ')
                          : rule.options.byminute}
                      </Segment>
                    )}
                    {rule.options.bysecond && (
                      <Segment basic style={{ marginBottom: 6, padding: 0 }}>
                        <strong>Seconds:</strong>{' '}
                        {Array.isArray(rule.options.bysecond)
                          ? rule.options.bysecond.join(', ')
                          : rule.options.bysecond}
                      </Segment>
                    )}
                    {rule.options.count && (
                      <Segment basic style={{ marginBottom: 6, padding: 0 }}>
                        <strong>Count:</strong> {rule.options.count}
                      </Segment>
                    )}
                    {rule.options.interval && rule.options.interval > 1 && (
                      <Segment basic style={{ marginBottom: 6, padding: 0 }}>
                        <strong>Interval:</strong> {rule.options.interval}
                      </Segment>
                    )}
                    {rule.options.byweekday && (
                      <Segment basic style={{ marginBottom: 6, padding: 0 }}>
                        <strong>Weekdays:</strong>{' '}
                        {Array.isArray(rule.options.byweekday)
                          ? rule.options.byweekday
                              .map((day) =>
                                typeof day === 'number'
                                  ? WEEKDAY_OPTIONS.find((w) => w.value === day)
                                      ?.text || String(day)
                                  : String(day),
                              )
                              .join(', ')
                          : typeof rule.options.byweekday === 'number'
                            ? WEEKDAY_OPTIONS.find(
                                (w) => w.value === rule.options.byweekday,
                              )?.text || String(rule.options.byweekday)
                            : String(rule.options.byweekday)}
                      </Segment>
                    )}
                    {rule.options.bymonth && (
                      <Segment basic style={{ marginBottom: 6, padding: 0 }}>
                        <strong>Months:</strong>{' '}
                        {Array.isArray(rule.options.bymonth)
                          ? rule.options.bymonth
                              .map(
                                (month) =>
                                  MONTH_OPTIONS.find((m) => m.value === month)
                                    ?.text || month,
                              )
                              .join(', ')
                          : MONTH_OPTIONS.find(
                              (m) => m.value === rule.options.bymonth,
                            )?.text || rule.options.bymonth}
                      </Segment>
                    )}
                    {rule.options.bymonthday && (
                      <Segment basic style={{ marginBottom: 6, padding: 0 }}>
                        <strong>Days of Month:</strong>{' '}
                        {Array.isArray(rule.options.bymonthday)
                          ? rule.options.bymonthday.join(', ')
                          : rule.options.bymonthday}
                      </Segment>
                    )}
                  </Segment>
                )}
              </Accordion.Content>,
            ];
          })}
        </Accordion>
      )}
    </div>
  );
};
