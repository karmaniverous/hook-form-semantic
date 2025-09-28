import type { UseRRStackOutput } from '@karmaniverous/rrstack/react';
import { useCallback, useMemo } from 'react';
import type { AccordionTitleProps } from 'semantic-ui-react';
import { Accordion, Button, Icon, Label, Segment } from 'semantic-ui-react';

import {
  deprefix,
  type PrefixedPartial,
} from '../../lib/utils/PrefixedPartial';
import type { RRStackRuleDescriptionPropsBase } from './RRStackRuleDescription';
import { RRStackRuleDescription } from './RRStackRuleDescription';
import { RRStackRuleForm } from './RRStackRuleForm';
interface HookFormRRStackRuleProps
  extends Pick<AccordionTitleProps, 'onClick'>,
    PrefixedPartial<
      Omit<RRStackRuleDescriptionPropsBase, 'index' | 'rrstack'>,
      'describe'
    > {
  activeIndex: number | null;
  index: number;
  rrstack: UseRRStackOutput['rrstack'];
  setActiveIndex: (index: number | null) => void;
}

export const HookFormRRStackRule = (props: HookFormRRStackRuleProps) => {
  const {
    describe: describeProps,
    rest: { activeIndex, index, onClick, rrstack, setActiveIndex },
  } = useMemo(() => deprefix(props, ['describe']), [props]);

  console.log('describeProps', describeProps);

  const handleMoveRule = useCallback(
    (direction: 'top' | 'up' | 'down' | 'bottom') => {
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
            if (index < rrstack.rules.length - 1) rrstack.down(index);
            break;
          case 'bottom':
            if (index < rrstack.rules.length - 1) rrstack.bottom(index);
            break;
        }
      } catch (error) {
        console.error(`Error moving rule at index ${index}:`, error);
      }
    },
    [index, rrstack],
  );

  const handleDeleteRule = useCallback(
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
          <div
            style={{ display: 'flex', gap: 2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button.Group size="mini">
              <Button
                type="button"
                icon="angle double up"
                onClick={() => handleMoveRule('top')}
                disabled={index === 0}
                title="Move to top"
                size="mini"
              />
              <Button
                type="button"
                icon="angle up"
                onClick={() => handleMoveRule('up')}
                disabled={index === 0}
                title="Move up"
                size="mini"
              />
              <Button
                type="button"
                icon="angle down"
                onClick={() => handleMoveRule('down')}
                disabled={index === rrstack.rules.length - 1}
                title="Move down"
                size="mini"
              />
              <Button
                type="button"
                icon="angle double down"
                onClick={() => handleMoveRule('bottom')}
                disabled={index === rrstack.rules.length - 1}
                title="Move to bottom"
                size="mini"
              />
            </Button.Group>
            <Button
              type="button"
              icon="delete"
              onClick={() => handleDeleteRule(index)}
              title="Delete rule"
              color="red"
              size="mini"
            />
          </div>
        </div>
        <RRStackRuleDescription
          as="div"
          data-testid={`rule-description-${index}`}
          index={index}
          rrstack={rrstack}
          style={{ fontWeight: 'normal', marginTop: 4, marginLeft: 16 }}
          {...describeProps}
        />
      </Accordion.Title>
      ,
      <Accordion.Content
        key={`content-${index}`}
        active={index === activeIndex}
      >
        <Segment basic style={{ fontSize: '0.9em', padding: 0 }}>
          <RRStackRuleForm index={index} rrstack={rrstack} />
        </Segment>
      </Accordion.Content>
      ,
    </>
  );
};
