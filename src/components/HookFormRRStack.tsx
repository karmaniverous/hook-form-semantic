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
}

const createDefaultRule = (): RuleJson => ({
  effect: 'active',
  duration: undefined,
  options: {},
  label: '',
});

export const HookFormRRStack = <T extends FieldValues>({
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
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

  const currentValue: RRStackOptions = value || {
    timezone,
    rules: [],
  };

  // rrstack hook with proper debouncing
  const { rrstack } = useRRStack(
    currentValue,
    (s) => {
      // Debounced autosave to react-hook-form
      hookFieldOnChange({ target: { value: s.toJson() } } as {
        target: { value: RRStackOptions };
      });
    },
    {
      // Use resetKey to recreate instance when form value changes externally
      resetKey: JSON.stringify(currentValue),
      // Autosave: coalesce onChange calls to react-hook-form (faster updates)
      changeDebounce: { delay: 400 },
      // UI → rrstack: stage frequent input changes and commit once per window (faster staging)
      mutateDebounce: { delay: 100, leading: true },
      // rrstack → UI: coalesce paints to reduce repaint churn (~60fps updates)
      renderDebounce: { delay: 16, leading: true },
    },
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    timezone?: string;
  }>({});

  // Use selector for derived values to optimize re-renders
  const rulesCount = useRRStackSelector(rrstack, (s) => s.rules.length);
  const rules = useRRStackSelector(rrstack, (s) => s.rules);

  // Use selector for rule descriptions to make them reactive to RRStack changes
  const ruleDescriptions = useRRStackSelector(rrstack, (s) =>
    s.rules.map((_, index) => {
      try {
        // Ensure the index is within bounds before calling describeRule
        if (s && index >= 0 && index < s.rules.length) {
          return s.describeRule(index) || 'Invalid rule';
        } else {
          return 'Rule index out of range';
        }
      } catch (error) {
        console.warn(`Error describing rule at index ${index}:`, error);
        return 'Error describing rule';
      }
    }),
  );

  // Validate timezone using RRStack's built-in validation
  const validateTimezone = useCallback((tz: string): string | undefined => {
    if (!RRStack.isValidTimeZone(tz)) {
      return `Invalid timezone: ${tz}`;
    }
    return undefined;
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

      // Direct assignment to rrstack - staged via mutateDebounce
      rrstack.timezone = value;
      setValidationErrors((prev) => ({ ...prev, timezone: undefined }));
    },
    [rrstack, validateTimezone],
  );

  // State to track validation errors for each rule
  const [ruleValidationErrors, setRuleValidationErrors] = useState<{
    [index: number]: string;
  }>({});

  // Handle rule updates using rrstack as single source of truth
  const handleRuleUpdate = useCallback(
    (index: number, updates: Partial<RuleJson>) => {
      try {
        // Bounds check before updating
        if (index < 0 || index >= rrstack.rules.length) {
          console.warn(`Cannot update rule at index ${index}: out of bounds`);
          return;
        }

        // Update the rule directly in rrstack - staged via mutateDebounce
        const currentRules = [...rrstack.rules];
        const updatedRule = { ...currentRules[index], ...updates };
        currentRules[index] = updatedRule;
        rrstack.rules = currentRules;

        // Clear any previous validation error for this rule
        setRuleValidationErrors((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`Error updating rule at index ${index}:`, error);

        // Set validation error for this rule
        setRuleValidationErrors((prev) => ({
          ...prev,
          [index]: errorMessage,
        }));
      }
    },
    [rrstack],
  );

  const handleAddRule = useCallback(() => {
    const newRule = createDefaultRule();
    rrstack.addRule(newRule);

    // Open the newly added rule for editing
    setActiveIndex(rrstack.rules.length - 1);
  }, [rrstack]);

  const handleAccordionClick = useCallback(
    (index: number, isActive: boolean) => {
      setActiveIndex(isActive ? null : index);
    },
    [],
  );

  const handleRuleMove = useCallback(
    (index: number, direction: 'top' | 'up' | 'down' | 'bottom') => {
      try {
        // Bounds check before moving
        if (index < 0 || index >= rrstack.rules.length) {
          console.warn(`Cannot move rule at index ${index}: out of bounds`);
          return;
        }

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
      } catch (error) {
        console.error(`Error moving rule at index ${index}:`, error);
      }
    },
    [rrstack, rulesCount],
  );

  const handleRuleDelete = useCallback(
    (index: number) => {
      try {
        // Bounds check before deleting
        if (index < 0 || index >= rrstack.rules.length) {
          console.warn(`Cannot delete rule at index ${index}: out of bounds`);
          return;
        }

        rrstack.removeRule(index);

        // Close accordion if we deleted the active rule
        if (activeIndex === index) {
          setActiveIndex(null);
        } else if (activeIndex !== null && activeIndex > index) {
          // Adjust active index if we deleted a rule above it
          setActiveIndex(activeIndex - 1);
        }
      } catch (error) {
        console.error(`Error deleting rule at index ${index}:`, error);
      }
    },
    [rrstack, activeIndex],
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
            value={rrstack.timezone}
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

            // Get rule description from reactive selector
            const ruleDescription = ruleDescriptions[index] || 'Invalid rule';

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
                    fontWeight: 'normal',
                    marginTop: 4,
                    marginLeft: 16,
                  }}
                >
                  {ruleDescription}
                </div>
              </Accordion.Title>,
              <Accordion.Content key={`content-${index}`} active={isActive}>
                <Segment basic style={{ fontSize: '0.9em', padding: 0 }}>
                  <RRStackRuleForm
                    rule={rule}
                    rrstack={rrstack as unknown as RRStack}
                    validationError={ruleValidationErrors[index]}
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
