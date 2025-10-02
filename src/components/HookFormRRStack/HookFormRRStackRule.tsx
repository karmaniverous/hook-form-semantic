import type { UseRRStackOutput } from '@karmaniverous/rrstack/react';
import { useCallback } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import type { AccordionTitleProps } from 'semantic-ui-react';
import { Accordion, Button, Icon, Label, Segment } from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';

import {
  HookFormRRStackRuleDescription,
  type HookFormRRStackRuleDescriptionPropsBase,
} from './HookFormRRStackRuleDescription';
import { HookFormRRStackRuleForm } from './HookFormRRStackRuleForm';
interface HookFormRRStackRuleProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    Pick<AccordionTitleProps, 'onClick'>,
    PrefixProps<
      Omit<HookFormRRStackRuleDescriptionPropsBase, 'index' | 'rrstack'>,
      'describe'
    > {
  activeIndex: number | null;
  index: number;
  rrstack: UseRRStackOutput['rrstack'];
  setActiveIndex: (index: number | null) => void;
}

export const HookFormRRStackRule = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormRRStackRuleProps<TFieldValues, TName>,
) => {
  const {
    deprefixed: {
      describe: describeProps,
      hook: { name, control },
    },
    rest: { activeIndex, index, logger, onClick, rrstack, setActiveIndex },
  } = useHookForm({ props, prefixes: ['describe'] as const });

  const handleUp = useCallback(() => {
    if (index > 0) {
      rrstack.up(index);
      if (activeIndex === index) {
        setActiveIndex(index - 1);
      } else if (activeIndex === index - 1) {
        setActiveIndex(index);
      }
    }
  }, [index, rrstack, activeIndex, setActiveIndex]);

  const handleDown = useCallback(() => {
    if (index < rrstack.rules.length - 1) {
      rrstack.down(index);
      if (activeIndex === index) {
        setActiveIndex(index + 1);
      } else if (activeIndex === index + 1) {
        setActiveIndex(index);
      }
    }
  }, [index, rrstack, activeIndex, setActiveIndex]);

  const handleTop = useCallback(() => {
    if (index > 0) {
      rrstack.top(index);
      if (activeIndex === index) {
        setActiveIndex(0);
      } else if (activeIndex !== null && activeIndex < index) {
        setActiveIndex(activeIndex + 1);
      }
    }
  }, [index, rrstack, activeIndex, setActiveIndex]);

  const handleBottom = useCallback(() => {
    if (index < rrstack.rules.length - 1) {
      rrstack.bottom(index);
      if (activeIndex === index) {
        setActiveIndex(rrstack.rules.length - 1);
      } else if (activeIndex !== null && activeIndex > index) {
        setActiveIndex(activeIndex - 1);
      }
    }
  }, [index, rrstack, activeIndex, setActiveIndex]);

  const handleDelete = useCallback(() => {
    rrstack.removeRule(index);
    if (activeIndex === index) {
      setActiveIndex(null);
    } else if (activeIndex !== null && activeIndex > index) {
      setActiveIndex(activeIndex - 1);
    }
  }, [index, rrstack, activeIndex, setActiveIndex]);

  // Safely access current rule and key attributes
  const ruleAtIndex = rrstack.rules[index];
  const effect = (ruleAtIndex?.effect ?? 'active') as 'active' | 'blackout';
  const ruleLabel = ruleAtIndex?.label || `Rule ${index + 1}`;
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
            <span style={{ fontSize: '0.9em' }}>{ruleLabel}</span>
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
                disabled={index === rrstack.rules.length - 1}
                icon="angle down"
                onClick={handleDown}
                size="mini"
                title="Move down"
                type="button"
              />

              <Button
                disabled={index === rrstack.rules.length - 1}
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

        <HookFormRRStackRuleDescription
          as="div"
          data-testid={`rule-description-${index}`}
          index={index}
          rrstack={rrstack}
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
            index={index}
            hookControl={control}
            hookName={name}
            logger={logger}
            rrstack={rrstack}
          />
        </Segment>
      </Accordion.Content>
    </>
  );
};
