import type { DescribeOptions } from '@karmaniverous/rrstack';
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
import type { HookFormRRStackPath, HookFormRRStackRuleData } from './types';

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
      rrstack: rrstackProps,
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

  const { rrstack, version } = useRRStack({ json, ...rrstackProps });

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

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: `${name}.rules` as ArrayPath<TFieldValues>,
  });

  const handleAddRule = useCallback(() => {
    append({ effect: 'active', options: { freq: 'span' } } as FieldArray<
      TFieldValues,
      ArrayPath<TFieldValues>
    > extends HookFormRRStackRuleData
      ? FieldArray<TFieldValues, ArrayPath<TFieldValues>>
      : never);

    setActiveIndex(fields.length);
  }, [append, fields.length]);

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

        <Button type="button" primary onClick={handleAddRule} size="small">
          <Icon name="plus" />
          Add Rule
        </Button>
      </Segment>

      {fields.length ? (
        <Accordion fluid styled>
          {fields.map((field, index) => (
            <HookFormRRStackRule<TFieldValues>
              {...reprifixedDescribeProps}
              activeIndex={activeIndex}
              count={fields.length}
              fieldArrayMove={move}
              fieldArrayRemove={remove}
              fieldArrayUpdate={update}
              index={index}
              hookControl={control}
              hookName={`${name}.rules.${index}` as Path<TFieldValues>}
              key={field.id}
              logger={logger}
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
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
