import {
  useRRStack,
  type UseRRStackOutput,
  type UseRRStackProps,
} from '@karmaniverous/rrstack/react';
import { omit } from 'radash';
import { useCallback, useMemo, useState } from 'react';
import { type FieldValues, type Path, useWatch } from 'react-hook-form';
import {
  Accordion,
  Button,
  Dropdown,
  Form,
  type FormFieldProps,
  Header,
  Icon,
  Message,
  Segment,
} from 'semantic-ui-react';

import { HookFormField } from '@/components/HookFormField';
import { rhf2rrstack } from '@/components/HookFormRRStack/rhf2rrstack';
import { rrstack2rhf } from '@/components/HookFormRRStack/rrstack2rhf';
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import { reprefix } from '@/types/PrefixedPartial';
import type { PrefixProps } from '@/types/PrefixProps';
import { concatClassNames } from '@/utils/concatClassNames';

import { HookFormRRStackRule } from './HookFormRRStackRule';
import type { HookFormRRStackRuleDescriptionPropsBase } from './HookFormRRStackRuleDescription';
import { timezoneOptions } from './timezoneOptions';
import type { HookFormRRStackPath } from './types';

export interface HookFormRRStackProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends
    HookFormRRStackPath<TFieldValues> = HookFormRRStackPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
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
      Omit<HookFormRRStackRuleDescriptionPropsBase, 'index' | 'rrstack'>,
      'describe'
    >,
    PrefixProps<Omit<UseRRStackProps, 'json' | 'timezone'>, 'rrstack'> {
  timestampFormat?: string;
}

export const HookFormRRStack = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends
    HookFormRRStackPath<TFieldValues> = HookFormRRStackPath<TFieldValues>,
>(
  props: HookFormRRStackProps<TFieldValues, TName>,
) => {
  const {
    controller: {
      field: { onChange: hookFieldOnChange, ...hookFieldProps },
      fieldState: { error },
    },
    deprefixed: {
      describe: describeProps,
      hook: { control, name },
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
    (rrstack: UseRRStackOutput['rrstack']) => {
      rrstackOnChange?.(rrstack);
      hookFieldOnChange({ target: { value: rrstack2rhf(rrstack.toJson()) } });
    },
    [hookFieldOnChange, rrstackOnChange],
  );

  const json = useWatch({ control, name, compute: (v) => rhf2rrstack(v) });

  const { rrstack } = useRRStack({
    json,
    onChange: handleChange,
    ...rrstackProps,
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { starts, ends } = useMemo(() => {
    const formatTimestamp = (ts: number | null | undefined) =>
      ts ? rrstack.formatInstant(ts, { format: timestampFormat }) : 'Not Set';

    const { start, end } = rrstack.getEffectiveBounds();

    return {
      starts: formatTimestamp(start),
      ends: formatTimestamp(end),
    };
  }, [rrstack.rules, rrstack.timezone, timestampFormat]);

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
          <HookFormField<TFieldValues, { value: string }, TName>
            control={Dropdown}
            hookControl={control}
            hookName={`${name}.timezone` as TName}
            label="Timezone"
            placeholder="Select timezone"
            fluid
            search
            selection
            options={timezoneOptions}
          />

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
            <HookFormRRStackRule<TFieldValues>
              {...reprifixedDescribeProps}
              activeIndex={activeIndex}
              index={index}
              key={index}
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
              rrstack={rrstack}
              setActiveIndex={setActiveIndex}
              hookControl={control}
              hookName={`${name}.rules.${index}` as Path<TFieldValues>}
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
