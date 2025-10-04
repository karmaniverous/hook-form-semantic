import type { DescribeOptions, RRStackOptions } from '@karmaniverous/rrstack';
import { useRRStack, type UseRRStackProps } from '@karmaniverous/rrstack/react';
import { omit } from 'radash';
import { useCallback, useMemo, useState } from 'react';
import type { ArrayPath, FieldArray } from 'react-hook-form';
import {
  type FieldValues,
  type Path,
  useFieldArray,
  useWatch,
} from 'react-hook-form';
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
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';
import { concatClassNames } from '@/utils/concatClassNames';
import { prefixProps } from '@/utils/prefixProps';

import { HookFormRRStackRule } from './HookFormRRStackRule';
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
    PrefixProps<DescribeOptions, 'describe'>,
    PrefixProps<
      Omit<UseRRStackProps, 'json' | 'timezone'> &
        Pick<RRStackOptions, 'defaultEffect' | 'timeUnit'>,
      'rrstack'
    > {
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
      field: hookFieldProps,
      fieldState: { error },
    },
    deprefixed: {
      describe: describeProps,
      hook: { control, name },
      rrstack: { defaultEffect, timeUnit = 'ms', ...rrstackProps },
    },
    rest: {
      className,
      label,
      timestampFormat = 'yyyy-MM-dd HH:mm:ss',
      logger,
      ...fieldProps
    },
  } = useHookForm({ props, prefixes: ['describe', 'rrstack'] as const });

  const reprifixedDescribeProps = useMemo(
    () => prefixProps(describeProps, 'describe'),
    [describeProps],
  );

  const json = useWatch({
    control,
    name,
    compute: (v) => {
      const next = rhf2rrstack(v);
      logger?.debug?.('rhf2rrstack', { name, rhf: v, rrstack: next });
      return next;
    },
  });

  const { rrstack, version } = useRRStack({
    json: { ...json, defaultEffect, timeUnit },
    ...rrstackProps,
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { starts, ends } = useMemo(() => {
    void version;

    const formatTimestamp = (ts: number | null | undefined) =>
      ts ? rrstack.formatInstant(ts, { format: timestampFormat }) : 'Not Set';

    const { start, end } = rrstack.getEffectiveBounds();

    return {
      starts: formatTimestamp(start),
      ends: formatTimestamp(end),
    };
  }, [rrstack, timestampFormat, version]);

  const { append, fields, insert, move, remove, update } = useFieldArray({
    control,
    name: `${name}.rules` as ArrayPath<TFieldValues>,
  });

  const handleRuleAdd = useCallback(() => {
    const defaultRule = {
      effect: 'active',
      options: { freq: 'span' },
    } as FieldArray<TFieldValues, ArrayPath<TFieldValues>>;

    if (activeIndex !== null && activeIndex < fields.length - 1)
      insert(activeIndex + 1, defaultRule);
    else append(defaultRule);

    setActiveIndex((activeIndex ?? fields.length - 1) + 1);
  }, [activeIndex, append, fields.length, insert]);

  const handleRuleDelete = useCallback(
    (index: number) => {
      remove(index);

      setActiveIndex(
        activeIndex === null || fields.length <= 1
          ? null
          : activeIndex === fields.length - 1
            ? activeIndex - 1
            : activeIndex,
      );
    },
    [remove, activeIndex, fields.length],
  );

  const handleRuleUp = useCallback(
    (index: number) => {
      if (index > 0) {
        move(index, index - 1);

        if (activeIndex === index) setActiveIndex(index - 1);
        else if (activeIndex === index - 1) setActiveIndex(index);
      }
    },
    [move, activeIndex, setActiveIndex],
  );

  const handleRuleDown = useCallback(
    (index: number) => {
      if (index < fields.length - 1) {
        move(index, index + 1);

        if (activeIndex === index) setActiveIndex(index + 1);
        else if (activeIndex === index + 1) setActiveIndex(index);
      }
    },
    [fields.length, move, activeIndex],
  );

  const handleRuleTop = useCallback(
    (index: number) => {
      if (index > 0) {
        move(index, 0);

        if (activeIndex === index) setActiveIndex(0);
        else if (activeIndex !== null && activeIndex < index)
          setActiveIndex(activeIndex + 1);
      }
    },
    [move, activeIndex, setActiveIndex],
  );

  const handleRuleBottom = useCallback(
    (index: number) => {
      if (index < fields.length - 1) {
        move(index, fields.length - 1);

        if (activeIndex === index) setActiveIndex(fields.length - 1);
        else if (activeIndex !== null && activeIndex > index)
          setActiveIndex(activeIndex - 1);
      }
    },
    [fields.length, move, activeIndex, setActiveIndex],
  );

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
          <HookFormField<TFieldValues, { value: string }>
            control={Dropdown}
            hookControl={control}
            logger={logger}
            hookName={`${name}.timezone` as Path<TFieldValues>}
            label="Timezone"
            placeholder="Select timezone"
            fluid
            search
            selection
            options={timezoneOptions}
          />

          <Form.Field label="Starts">{starts}</Form.Field>

          <Form.Field label="Ends">{ends}</Form.Field>
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
        <Header size="small">Rules ({fields.length})</Header>

        <Button type="button" primary onClick={handleRuleAdd} size="small">
          <Icon name="plus" />
          Add Rule
        </Button>
      </Segment>

      {fields.length ? (
        <Accordion fluid styled>
          {fields.map((field, index) => (
            <HookFormRRStackRule<TFieldValues>
              active={activeIndex === index}
              fieldArrayUpdate={update}
              index={index}
              hookControl={control}
              hookName={`${name}.rules.${index}` as Path<TFieldValues>}
              key={field.id}
              logger={logger}
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
              onRuleBottom={
                index < fields.length - 1 ? handleRuleBottom : undefined
              }
              onRuleDelete={handleRuleDelete}
              onRuleDown={
                index < fields.length - 1 ? handleRuleDown : undefined
              }
              onRuleTop={index > 0 ? handleRuleTop : undefined}
              onRuleUp={index > 0 ? handleRuleUp : undefined}
              timeUnit={timeUnit}
              {...reprifixedDescribeProps}
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
