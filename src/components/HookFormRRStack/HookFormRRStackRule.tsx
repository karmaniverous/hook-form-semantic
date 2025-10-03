import type { DescribeOptions } from '@karmaniverous/rrstack';
import { useCallback } from 'react';
import type {
  FieldPath,
  FieldValues,
  UseFieldArrayReturn,
} from 'react-hook-form';
import type { AccordionTitleProps } from 'semantic-ui-react';
import { Accordion, Button, Icon, Label, Segment } from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';

import { HookFormRRStackRuleDescription } from './HookFormRRStackRuleDescription';
import { HookFormRRStackRuleForm } from './HookFormRRStackRuleForm';
import type { HookFormRRStackRuleData } from './types';

export interface HookFormRRStackRuleProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    Pick<AccordionTitleProps, 'onClick'>,
    PrefixProps<DescribeOptions, 'describe'>,
    PrefixProps<
      Pick<UseFieldArrayReturn<TFieldValues>, 'move' | 'remove' | 'update'>,
      'fieldArray'
    > {
  activeIndex: number | null;
  count: number;
  index: number;
  setActiveIndex: (index: number | null) => void;
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
      fieldArray: { move, remove, update },
      hook: { name, control },
    },
    rest: { activeIndex, count, index, logger, onClick, setActiveIndex },
  } = useHookForm({ props, prefixes: ['describe', 'fieldArray'] as const });

  const handleUp = useCallback(() => {
    if (index > 0) {
      move(index, index - 1);
      if (activeIndex === index) setActiveIndex(index - 1);
      else if (activeIndex === index - 1) setActiveIndex(index);
    }
  }, [index, move, activeIndex, setActiveIndex]);

  const handleDown = useCallback(() => {
    if (index < count - 1) {
      move(index, index + 1);
      if (activeIndex === index) setActiveIndex(index + 1);
      else if (activeIndex === index + 1) setActiveIndex(index);
    }
  }, [index, count, move, activeIndex, setActiveIndex]);

  const handleTop = useCallback(() => {
    if (index > 0) {
      move(index, 0);
      if (activeIndex === index) setActiveIndex(0);
      else if (activeIndex !== null && activeIndex < index)
        setActiveIndex(activeIndex + 1);
    }
  }, [index, move, activeIndex, setActiveIndex]);

  const handleBottom = useCallback(() => {
    if (index < count - 1) {
      move(index, count - 1);
      if (activeIndex === index) setActiveIndex(count - 1);
      else if (activeIndex !== null && activeIndex > index)
        setActiveIndex(activeIndex - 1);
    }
  }, [index, count, move, activeIndex, setActiveIndex]);

  const handleDelete = useCallback(() => {
    remove(index);
    if (activeIndex === index) setActiveIndex(null);
    else if (activeIndex !== null && activeIndex > index)
      setActiveIndex(activeIndex - 1);
  }, [remove, index, activeIndex, setActiveIndex]);

  // Safely access current rule and key attributes
  console.log('rule:', { name, value });
  const { effect, label } = value as HookFormRRStackRuleData;

  return (
    <>
      <Accordion.Title
        key={`title-${index}`}
        active={index === activeIndex}
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
                disabled={index === 0}
                icon="angle double up"
                onClick={handleTop}
                size="mini"
                title="Move to top"
                type="button"
              />

              <Button
                disabled={index === 0}
                icon="angle up"
                onClick={handleUp}
                size="mini"
                title="Move up"
                type="button"
              />

              <Button
                disabled={index === count - 1}
                icon="angle down"
                onClick={handleDown}
                size="mini"
                title="Move down"
                type="button"
              />

              <Button
                disabled={index === count - 1}
                icon="angle double down"
                onClick={handleBottom}
                size="mini"
                title="Move to bottom"
                type="button"
              />
            </Button.Group>

            <Button
              color="red"
              icon="delete"
              onClick={handleDelete}
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
          {...describeProps}
        />
      </Accordion.Title>

      <Accordion.Content
        key={`content-${index}`}
        active={index === activeIndex}
      >
        <Segment basic style={{ fontSize: '0.9em', padding: 0 }}>
          <HookFormRRStackRuleForm<TFieldValues, TName>
            fieldArrayUpdate={update}
            hookControl={control}
            hookName={name}
            logger={logger}
          />
        </Segment>
      </Accordion.Content>
    </>
  );
};
