import type { DescribeOptions } from '@karmaniverous/rrstack';
import { useRRStack, type UseRRStackProps } from '@karmaniverous/rrstack/react';
import { get } from 'radash';
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
  Label,
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
import type { HookFormRRStackData, HookFormRRStackPath } from './types';

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
    PrefixProps<Omit<UseRRStackProps, 'json' | 'timezone'>, 'rrstack'> {
  timestampFormat?: string;
  endDatesInclusive?: boolean;
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
      fieldState: { error },
    },
    deprefixed: {
      describe: describeProps,
      hook: { control, name },
      rrstack: rrstackProps,
    },
    rest: {
      endDatesInclusive = false,
      className,
      label,
      timestampFormat = 'yyyy-LL-dd HH:mm',
      logger,
      ...fieldProps
    },
  } = useHookForm({ props, prefixes: ['describe', 'rrstack'] as const });

  const reprifixedDescribeProps = useMemo(
    () => prefixProps(describeProps, 'describe'),
    [describeProps],
  );

  const { append, fields, insert, move, remove, update } = useFieldArray({
    control,
    name: `${name}.rules` as ArrayPath<TFieldValues>,
  });

  const rhf = useWatch({
    control,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    compute: (v) => get(v, name) as HookFormRRStackData,
  });

  const json = useMemo(() => {
    if (!rhf) return { timezone: 'UTC' };

    const rrstack = rhf2rrstack(rhf, { endDatesInclusive });

    logger?.debug?.('rhf2rrstack', { rhf, rrstack });

    return rrstack;
  }, [endDatesInclusive, logger, name, rhf]);

  const { rrstack, version } = useRRStack({ json, ...rrstackProps });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { starts, ends } = useMemo(() => {
    void version;

    const formatTimestamp = (ts: number | null | undefined) =>
      ts
        ? rrstack.formatInstant(ts, { format: timestampFormat })
        : 'Indefinite';

    const { start, end } = rrstack.getEffectiveBounds();

    console.log({ start, end });

    return {
      starts: formatTimestamp(start),
      ends: formatTimestamp(end),
    };
  }, [rrstack, timestampFormat, version]);

  const handleRuleAdd = useCallback(() => {
    const defaultRule = {
      effect: 'active',
      options: { freq: 'span' },
    } as FieldArray<TFieldValues, ArrayPath<TFieldValues>>;

    const newIndex = activeIndex === null ? fields.length : activeIndex + 1;

    if (newIndex === fields.length) append(defaultRule);
    else insert(newIndex, defaultRule);

    if (newIndex !== activeIndex) setActiveIndex(newIndex);
  }, [activeIndex, append, fields.length, insert]);

  const handleRuleDelete = useCallback(
    (index: number) => {
      remove(index);

      const newActiveIndex =
        activeIndex === null || activeIndex === index
          ? null
          : activeIndex > index
            ? activeIndex - 1
            : activeIndex;

      if (newActiveIndex !== activeIndex) setActiveIndex(newActiveIndex);
    },
    [remove, activeIndex],
  );

  const handleRuleUp = useCallback(
    (index: number) => {
      if (index > 0) {
        const newIndex = index - 1;

        move(index, newIndex);

        const newActiveIndex =
          activeIndex === index
            ? newIndex
            : activeIndex === newIndex
              ? index
              : activeIndex;

        if (newActiveIndex !== activeIndex) setActiveIndex(newActiveIndex);
      }
    },
    [move, activeIndex],
  );

  const handleRuleDown = useCallback(
    (index: number) => {
      if (index < fields.length - 1) {
        const newIndex = index + 1;

        const newActiveIndex =
          activeIndex === index
            ? newIndex
            : activeIndex === newIndex
              ? index
              : activeIndex;

        console.log({ index, newIndex, activeIndex, newActiveIndex });

        move(index, newIndex);

        if (newActiveIndex !== activeIndex) setActiveIndex(newActiveIndex);
      }
    },
    [fields.length, move, activeIndex],
  );

  const handleRuleTop = useCallback(
    (index: number) => {
      if (index > 0) {
        const newIndex = 0;

        move(index, newIndex);

        const newActiveIndex =
          activeIndex === index
            ? newIndex
            : activeIndex === null || activeIndex > index
              ? activeIndex
              : activeIndex + 1;

        if (newActiveIndex !== activeIndex) setActiveIndex(newActiveIndex);
      }
    },
    [move, activeIndex],
  );

  const handleRuleBottom = useCallback(
    (index: number) => {
      if (index < fields.length - 1) {
        const newIndex = fields.length - 1;

        move(index, newIndex);

        const newActiveIndex =
          activeIndex === index
            ? newIndex
            : activeIndex === null || activeIndex < index
              ? activeIndex
              : activeIndex - 1;

        if (newActiveIndex !== activeIndex) setActiveIndex(newActiveIndex);
      }
    },
    [fields.length, move, activeIndex],
  );

  return (
    <Form.Field
      {...fieldProps}
      className={concatClassNames(
        className as string | undefined,
        'hook-form-rrstack',
      )}
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
          <Form.Field control={Label} label="Starts">
            {starts}
          </Form.Field>

          <Form.Field control={Label} label="Ends">
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
              endDatesInclusive={endDatesInclusive}
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
