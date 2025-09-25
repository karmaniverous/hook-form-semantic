import type { RRStackOptions, RuleJson } from '@karmaniverous/rrstack';
import { RRStack } from '@karmaniverous/rrstack';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  duration: undefined,
  options: {},
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
  const [validationErrors, setValidationErrors] = useState<{
    timezone?: string;
  }>({});
  const [rrstack, setRRStack] = useState<RRStack | null>(null);

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

  // Initialize RRStack instance from form value
  useEffect(() => {
    try {
      const stack = new RRStack(currentValue);
      setRRStack(stack);
    } catch (error) {
      console.error('Failed to create RRStack:', error);
      setRRStack(null);
    }
  }, []);

  // Update form when rrstack changes (controlled component pattern)
  const updateFormFromRRStack = useCallback(() => {
    if (rrstack) {
      const newValue = rrstack.toJson();
      setValidationErrors({});
      hookFieldOnChange({ target: { value: newValue } } as {
        target: { value: RRStackOptions };
      });
    }
  }, [rrstack, hookFieldOnChange]);

  // Update rrstack when form value changes from external source
  useEffect(() => {
    if (rrstack && currentValue) {
      try {
        rrstack.updateOptions({
          timezone: currentValue.timezone,
          rules: currentValue.rules || [],
        });
      } catch (error) {
        console.error('Failed to update RRStack:', error);
      }
    }
  }, [currentValue.timezone, currentValue.rules]);

  // Get rules and count directly from form state (single source of truth)
  const rules = currentValue.rules || [];
  const rulesCount = rules.length;

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

      if (rrstack) {
        rrstack.timezone = value;
        setValidationErrors((prev) => ({ ...prev, timezone: undefined }));
        updateFormFromRRStack();
      }
    },
    [rrstack, validateTimezone, updateFormFromRRStack],
  );

  // Handle immediate rule updates - all changes flow through the form
  const handleRuleUpdate = useCallback(
    (index: number, updates: Partial<RuleJson>) => {
      if (!rrstack) return;

      const newRules = [...rules];
      const updatedRule = { ...newRules[index], ...updates };
      newRules[index] = updatedRule;

      // Always update form state first (single source of truth)
      const newValue = {
        ...currentValue,
        rules: newRules,
      };
      hookFieldOnChange({ target: { value: newValue } } as {
        target: { value: RRStackOptions };
      });

      // Try to sync with RRStack, but don't let compilation errors block the UI update
      try {
        rrstack.rules = newRules;
      } catch (error) {
        console.warn(
          'RRStack compilation error during edit (UI updated anyway):',
          error,
        );
        // RRStack is out of sync, but form state is correct - this is fine for interactive editing
      }
    },
    [rrstack, rules, currentValue, hookFieldOnChange],
  );

  const handleAddRule = useCallback(() => {
    if (!rrstack) return;

    const newRule = createDefaultRule();
    const newRules = [...rules, newRule];

    // Always update form state first (single source of truth)
    const newValue = {
      ...currentValue,
      rules: newRules,
    };
    hookFieldOnChange({ target: { value: newValue } } as {
      target: { value: RRStackOptions };
    });

    // Try to sync with RRStack, but don't let compilation errors block the UI update
    try {
      rrstack.addRule(newRule);
    } catch (error) {
      console.warn('Error adding rule to RRStack (UI updated anyway):', error);
      // RRStack is out of sync, but form state is correct - this is fine for interactive editing
    }

    // Open the newly added rule for editing
    setActiveIndex(newRules.length - 1);
  }, [rrstack, rules, currentValue, hookFieldOnChange]);

  const handleAccordionClick = useCallback(
    (index: number, isActive: boolean) => {
      setActiveIndex(isActive ? null : index);
    },
    [],
  );

  const handleRuleMove = useCallback(
    (index: number, direction: 'top' | 'up' | 'down' | 'bottom') => {
      if (!rrstack) return;

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
      updateFormFromRRStack();
    },
    [rrstack, rulesCount, updateFormFromRRStack],
  );

  const handleRuleDelete = useCallback(
    (index: number) => {
      if (!rrstack) return;
      rrstack.removeRule(index);
      updateFormFromRRStack();
      // Close accordion if we deleted the active rule
      if (activeIndex === index) {
        setActiveIndex(null);
      } else if (activeIndex !== null && activeIndex > index) {
        // Adjust active index if we deleted a rule above it
        setActiveIndex(activeIndex - 1);
      }
    },
    [rrstack, updateFormFromRRStack, activeIndex],
  );

  // Show loading state while RRStack is initializing
  if (!rrstack) {
    return (
      <Form.Field>
        {fieldProps.label && <label>{fieldProps.label}</label>}
        <Message info size="small">
          <Message.Header>Loading</Message.Header>
          <Message.Content>Initializing RRStack...</Message.Content>
        </Message>
      </Form.Field>
    );
  }

  return (
    <Form.Field>
      {fieldProps.label && <label>{fieldProps.label}</label>}

      {/* Display validation errors */}
      {error?.message && (
        <Message negative size="small" style={{ marginBottom: 16 }}>
          <Message.Header>Validation Error</Message.Header>
          <Message.Content>{error.message}</Message.Content>
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

      {rulesCount === 0 ? (
        <Message info size="small">
          <Message.Header>No rules defined</Message.Header>
          <Message.Content>
            Add your first rule to start building your schedule.
          </Message.Content>
        </Message>
      ) : (
        <Accordion fluid styled>
          {rules.map((rule: RuleJson, index: number) => {
            const isActive = activeIndex === index;
            const ruleDescription =
              rrstack?.describeRule?.(index) || 'Invalid rule';

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
                <Segment basic style={{ fontSize: '0.9em', padding: '1em 0' }}>
                  <RRStackRuleForm
                    rule={rule}
                    onRuleChange={(updates) => handleRuleUpdate(index, updates)}
                  />
                </Segment>
              </Accordion.Content>,
            ];
          })}
        </Accordion>
      )}
    </Form.Field>
  );
};
