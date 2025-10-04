import type { DescribeOptions, UnixTimeUnit } from '@karmaniverous/rrstack';
import { useEffect } from 'react';
import type {
  ArrayPath,
  FieldArray,
  FieldPath,
  FieldValues,
  UseFieldArrayReturn,
} from 'react-hook-form';
import type { AccordionTitleProps } from 'semantic-ui-react';
import { Accordion, Button, Icon, Label, Segment } from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';

import { conformRule } from './conformRule';
import { HookFormRRStackRuleDescription } from './HookFormRRStackRuleDescription';
import { HookFormRRStackRuleForm } from './HookFormRRStackRuleForm';
import type { HookFormRRStackRuleData } from './types';

type RuleMutation = (index: number) => void;

export interface HookFormRRStackRuleProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    Pick<AccordionTitleProps, 'onClick'>,
    PrefixProps<DescribeOptions, 'describe'>,
    PrefixProps<
      Pick<UseFieldArrayReturn<TFieldValues>, 'update'>,
      'fieldArray'
    > {
  active?: boolean;
  index: number;
  onRuleBottom?: RuleMutation;
  onRuleDelete?: RuleMutation;
  onRuleDown?: RuleMutation;
  onRuleTop?: RuleMutation;
  onRuleUp?: RuleMutation;
  timeUnit: UnixTimeUnit;
  endDatesInclusive?: boolean;
}

export const HookFormRRStackRule = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormRRStackRuleProps<TFieldValues, TName>,
) => {
  const {
    controller: {
      field: { value },
    },
    deprefixed: {
      describe: describeProps,
      fieldArray: { update },
      hook: { name, control },
    },
    rest: {
      active,
      index,
      logger,
      onClick,
      onRuleBottom,
      onRuleDelete,
      onRuleDown,
      onRuleTop,
      onRuleUp,
      timeUnit,
      endDatesInclusive,
    },
  } = useHookForm({ props, prefixes: ['describe', 'fieldArray'] as const });

  useEffect(() => {
    const { changed, conformedRule } = conformRule(value);

    if (changed)
      update(
        index,
        conformedRule as FieldArray<TFieldValues, ArrayPath<TFieldValues>>,
      );
  }, [update, index, value.options.freq, value]);

  // Safely access current rule and key attributes
  const { effect, label } = value as HookFormRRStackRuleData;

  return (
    <>
      <Accordion.Title
        key={`${name}.title`}
        active={active}
        index={index}
        onClick={onClick}
        style={{ fontSize: '0.9em', padding: '0.8em 1em' }}
      >
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="dropdown" />
            <Label color={effect === 'active' ? 'green' : 'red'} size="mini">
              {effect.toUpperCase()}
            </Label>
            <span style={{ fontSize: '0.9em' }}>
              {label ?? `Rule ${index + 1}`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <Button.Group size="mini">
              <Button
                disabled={!onRuleTop}
                icon="angle double up"
                onClick={(e) => {
                  if (onRuleTop) {
                    e.stopPropagation();
                    onRuleTop(index);
                  }
                }}
                size="mini"
                title="Move to top"
                type="button"
              />

              <Button
                disabled={!onRuleUp}
                icon="angle up"
                onClick={(e) => {
                  if (onRuleUp) {
                    e.stopPropagation();
                    onRuleUp(index);
                  }
                }}
                size="mini"
                title="Move up"
                type="button"
              />

              <Button
                disabled={!onRuleDown}
                icon="angle down"
                onClick={(e) => {
                  if (onRuleDown) {
                    e.stopPropagation();
                    onRuleDown(index);
                  }
                }}
                size="mini"
                title="Move down"
                type="button"
              />

              <Button
                disabled={!onRuleBottom}
                icon="angle double down"
                onClick={(e) => {
                  if (onRuleBottom) {
                    e.stopPropagation();
                    onRuleBottom(index);
                  }
                }}
                size="mini"
                title="Move to bottom"
                type="button"
              />
            </Button.Group>

            <Button
              color="red"
              disabled={!onRuleDelete}
              icon="delete"
              onClick={(e) => {
                if (onRuleDelete) {
                  e.stopPropagation();
                  onRuleDelete(index);
                }
              }}
              size="mini"
              title="Delete rule"
              type="button"
            />
          </div>
        </div>

        <HookFormRRStackRuleDescription<TFieldValues, TName, 'label'>
          as="label"
          hookControl={control}
          hookName={name}
          style={{ fontWeight: 'normal', marginTop: 4, marginLeft: 16 }}
          timeUnit={timeUnit}
          endDatesInclusive={endDatesInclusive}
          {...describeProps}
        />
      </Accordion.Title>

      <Accordion.Content key={`${name}.content`} active={active}>
        <Segment basic style={{ fontSize: '0.9em', padding: 0 }}>
          <HookFormRRStackRuleForm<TFieldValues, TName>
            hookControl={control}
            hookName={name}
            logger={logger}
          />
        </Segment>
      </Accordion.Content>
    </>
  );
};
