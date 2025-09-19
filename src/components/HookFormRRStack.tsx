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
  Label,
  Message,
  Segment,
} from 'semantic-ui-react';

import {
  deprefix,
  type PrefixedPartial,
} from '../../lib/utils/PrefixedPartial';
import { RRStackRuleForm } from './RRStackRuleForm';

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
      // Validate starts/ends relationship
      if (
        typeof rule.options.starts === 'number' &&
        typeof rule.options.ends === 'number' &&
        rule.options.starts >= rule.options.ends
      ) {
        return 'Start date must be before end date';
      }

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

  // Memoized handlers for rule operations to prevent recreation on every render
  const handleAccordionClick = useCallback(
    (index: number, isActive: boolean) => {
      if (isActive) {
        // Close accordion and clear editing state
        setActiveIndex(null);
        setEditingRule(null);
        setEditingIndex(null);
      } else {
        // Open accordion and start editing
        setActiveIndex(index);
        setEditingRule({ ...rules[index] });
        setEditingIndex(index);
      }
    },
    [rules],
  );

  const handleEditClick = useCallback((index: number, rule: RuleJson) => {
    setActiveIndex(index);
    setEditingRule({ ...rule });
    setEditingIndex(index);
  }, []);

  const handleRuleMove = useCallback(
    (index: number, direction: 'top' | 'up' | 'down' | 'bottom') => {
      switch (direction) {
        case 'top':
          if (index > 0) rrstack.top(index);
          break;
        case 'up':
          if (index > 0) rrstack.up(index);
          break;
        case 'down':
          if (index < rulesCount - 1) rrstack.down(index);
          break;
        case 'bottom':
          if (index < rulesCount - 1) rrstack.bottom(index);
          break;
      }
    },
    [rrstack, rulesCount],
  );

  const handleRuleDelete = useCallback(
    (index: number) => {
      rrstack.removeRule(index);
    },
    [rrstack],
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
            <RRStackRuleForm
              rule={editingRule}
              mode="add"
              validationError={validationErrors.editingRule}
              onRuleChange={(updates) => {
                setEditingRule((prev) =>
                  prev ? { ...prev, ...updates } : null,
                );
              }}
              onSave={() => {
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
              onCancel={() => {
                setEditingRule(null);
                setEditingIndex(null);
              }}
            />
          </Segment>
        </Segment>
      )}

      {rulesCount === 0 &&
      activeIndex === null &&
      !(editingRule && editingIndex === null) ? (
        <Message info size="small">
          <Message.Header>No rules defined</Message.Header>
          <p>Add your first rule to start building your schedule.</p>
        </Message>
      ) : rulesCount > 0 ? (
        <Accordion fluid styled>
          {rules.map((rule: RuleJson, index: number) => {
            const isActive = activeIndex === index;
            const ruleDescription = rrstack.describeRule(index);

            return [
              <Accordion.Title
                key={`title-${index}`}
                active={isActive}
                index={index}
                onClick={() => handleAccordionClick(index, isActive)}
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
                    {!isActive && (
                      <Button
                        type="button"
                        icon="edit"
                        onClick={() => handleEditClick(index, rule)}
                        title="Edit rule"
                        color="blue"
                        size="mini"
                      />
                    )}
                    <Button.Group size="mini">
                      <Button
                        type="button"
                        icon="angle double up"
                        onClick={() => handleRuleMove(index, 'top')}
                        disabled={index === 0}
                        title="Move to top"
                        size="mini"
                      />
                      <Button
                        type="button"
                        icon="angle up"
                        onClick={() => handleRuleMove(index, 'up')}
                        disabled={index === 0}
                        title="Move up"
                        size="mini"
                      />
                      <Button
                        type="button"
                        icon="angle down"
                        onClick={() => handleRuleMove(index, 'down')}
                        disabled={index === rulesCount - 1}
                        title="Move down"
                        size="mini"
                      />
                      <Button
                        type="button"
                        icon="angle double down"
                        onClick={() => handleRuleMove(index, 'bottom')}
                        disabled={index === rulesCount - 1}
                        title="Move to bottom"
                        size="mini"
                      />
                    </Button.Group>
                    <Button
                      type="button"
                      icon="delete"
                      onClick={() => handleRuleDelete(index)}
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
                {editingIndex === index && editingRule && (
                  // Show edit form inside accordion
                  <Segment
                    basic
                    style={{ fontSize: '0.9em', padding: '1em 0' }}
                  >
                    <RRStackRuleForm
                      rule={editingRule}
                      mode="edit"
                      validationError={validationErrors.editingRule}
                      onRuleChange={(updates) => {
                        setEditingRule((prev) =>
                          prev ? { ...prev, ...updates } : null,
                        );
                      }}
                      onSave={() => {
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
                          setActiveIndex(null);
                        } catch (error) {
                          const errorMessage =
                            error instanceof Error
                              ? error.message
                              : 'Failed to save rule';
                          setValidationErrors({ editingRule: errorMessage });
                        }
                      }}
                      onCancel={() => {
                        setEditingRule(null);
                        setEditingIndex(null);
                        setActiveIndex(null);
                      }}
                    />
                  </Segment>
                )}
              </Accordion.Content>,
            ];
          })}
        </Accordion>
      ) : null}
    </div>
  );
};
