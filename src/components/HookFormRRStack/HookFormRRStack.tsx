import { RRStack } from '@karmaniverous/rrstack';
import {
  useRRStack,
  type UseRRStackOutput,
  type UseRRStackProps,
} from '@karmaniverous/rrstack/react';
import { omit } from 'radash';
import { useCallback, useMemo, useState } from 'react';
import { type FieldValues } from 'react-hook-form';
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

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import { reprefix } from '@/types/PrefixedPartial';
import type { PrefixProps } from '@/types/PrefixProps';
import { concatClassNames } from '@/utils/concatClassNames';

import { HookFormRRStackRule } from './HookFormRRStackRule';
import type { RRStackRuleDescriptionPropsBase } from './RRStackRuleDescription';
import { timezoneOptions } from './timezoneOptions';

export interface HookFormRRStackProps<T extends FieldValues>
  extends HookFormProps<T>,
    Omit<
      FormFieldProps,
      | 'as'
      | 'children'
      | 'content'
      | 'control'
      | 'checked'
      | 'disabled'
      | 'error'
      | 'inline'
      | 'name'
      | 'onBlur'
      | 'onChange'
      | 'ref'
      | 'type'
      | 'value'
    >,
    PrefixProps<
      Omit<RRStackRuleDescriptionPropsBase, 'index' | 'rrstack'>,
      'describe'
    >,
    PrefixProps<Omit<UseRRStackProps, 'json' | 'timezone'>, 'rrstack'> {
  timestampFormat?: string;
}

export const HookFormRRStack = <T extends FieldValues>(
  props: HookFormRRStackProps<T>,
) => {
  const {
    controller: {
      field: { onChange: hookFieldOnChange, value, ...hookFieldProps },
      fieldState: { error },
    },
    deprefixed: {
      describe: describeProps,
      rrstack: { onChange: rrstackOnChange, ...rrstackProps },
    },
    rest: {
      className,
      label,
      timestampFormat = 'yyyy-MM-dd HH:mm:ss',
      ...fieldProps
    },
  } = useHookForm({ props, prefixes: ['describe', 'rrstack'] as const });

  const reprifixedDescribeProps = useMemo(
    () => reprefix(describeProps, 'describe'),
    [describeProps],
  );

  const handleChange = useCallback(
    (stack: UseRRStackOutput['rrstack']) => {
      rrstackOnChange?.(stack);

      // Conform to RHF expectations by passing a minimal event-like payload
      hookFieldOnChange({ target: { value: stack.toJson() } });
    },
    [hookFieldOnChange, rrstackOnChange],
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [validationErrors, setValidationErrors] = useState<{
    timezone?: string;
  }>({});

  const { rrstack } = useRRStack({
    json: value,
    onChange: handleChange,
    ...rrstackProps,
  });

  const { starts, ends } = useMemo(() => {
    const formatTimestamp = (ts: number | null | undefined) =>
      ts ? rrstack.formatInstant(ts, { format: timestampFormat }) : 'Not Set';

    const { start, end } = rrstack.getEffectiveBounds();

    return {
      starts: formatTimestamp(start),
      ends: formatTimestamp(end),
    };
  }, [rrstack.rules, rrstack.timezone, timestampFormat]);

  const handleTimezoneChange = useCallback(
    (value: string) => {
      // Validate timezone before setting it
      const timezoneError = RRStack.isValidTimeZone(value)
        ? undefined
        : `Invalid timezone: ${value}`;

      if (!timezoneError) rrstack.timezone = value;
      setValidationErrors((prev) => ({ ...prev, timezone: timezoneError }));
    },
    [rrstack],
  );

  const handleAddRule = useCallback(() => {
    rrstack.addRule();
    setActiveIndex(rrstack.rules.length - 1);
  }, [rrstack]);

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
    <Form.Field
      {...fieldProps}
      {...omit(hookFieldProps as Record<string, unknown>, ['ref'])}
      className={concatClassNames(className, 'hook-form-rrstack')}
    >
      {label && <label>{label}</label>}

      {/* Display validation errors */}
      {error?.message && (
        <Message negative size="small" style={{ marginBottom: 16 }}>
          <Message.Header>Validation Error</Message.Header>
          <Message.Content>{error.message}</Message.Content>
        </Message>
      )}

      <Segment basic style={{ padding: '0 0 1em 0' }}>
        <Form.Group widths={'equal'}>
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

          <Form.Field>
            <label>Starts</label>
            {starts}
          </Form.Field>

          <Form.Field>
            <label>Ends</label>
            {ends}
          </Form.Field>
        </Form.Group>
      </Segment>

      <Segment
        basic
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Header size="small">Rules ({rrstack.rules.length})</Header>
        <Button type="button" primary onClick={handleAddRule} size="small">
          <Icon name="plus" />
          Add Rule
        </Button>
      </Segment>

      {rrstack.rules.length ? (
        <Accordion fluid styled>
          {rrstack.rules.map((rule, index) => (
            <HookFormRRStackRule
              {...reprifixedDescribeProps}
              activeIndex={activeIndex}
              index={index}
              key={index}
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
              rrstack={rrstack}
              setActiveIndex={setActiveIndex}
            />
          ))}
        </Accordion>
      ) : (
        <Message info size="small">
          <Message.Header>No rules defined</Message.Header>
          <Message.Content>
            Add your first rule to start building your schedule.
          </Message.Content>
        </Message>
      )}
    </Form.Field>
  );
};
