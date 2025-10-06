import {
  type FieldPath,
  type FieldValues,
  type Path,
  useWatch,
} from 'react-hook-form';
import { Dropdown, Form, Header, Segment } from 'semantic-ui-react';

import { HookFormDatePicker } from '@/components/HookFormDatePicker';
import { HookFormField } from '@/components/HookFormField';
import { HookFormNumeric } from '@/components/HookFormNumeric';
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

import { InfoLabel } from './InfoLabel';

const FREQUENCY_OPTIONS = [
  { key: 'span', text: 'Span', value: 'span' },
  { key: 'yearly', text: 'Yearly', value: 'yearly' },
  { key: 'monthly', text: 'Monthly', value: 'monthly' },
  { key: 'weekly', text: 'Weekly', value: 'weekly' },
  { key: 'daily', text: 'Daily', value: 'daily' },
  { key: 'hourly', text: 'Hourly', value: 'hourly' },
  { key: 'minutely', text: 'Minutely', value: 'minutely' },
  { key: 'secondly', text: 'Secondly', value: 'secondly' },
];

type HookFormRRStackRuleRangeProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = HookFormProps<TFieldValues, TName>;

export const HookFormRRStackRuleRange = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormRRStackRuleRangeProps<TFieldValues, TName>,
) => {
  const {
    deprefixed: {
      hook: { name, control },
    },
    rest: { logger },
  } = useHookForm({ props });

  const freq = useWatch({
    control,
    name: `${name}.freq` as Path<TFieldValues>,
  });

  return (
    <Segment style={{ marginBottom: 0, paddingBottom: 0 }}>
      <Header size="tiny">Valid Range</Header>

      <Form.Group style={{ alignItems: 'flex-end' }} widths={3}>
        <HookFormDatePicker<TFieldValues>
          logger={logger}
          hookControl={control}
          hookName={`${name}.starts` as Path<TFieldValues>}
          label="Start Date"
          utc
        />

        <HookFormDatePicker<TFieldValues>
          logger={logger}
          hookControl={control}
          hookName={`${name}.ends` as Path<TFieldValues>}
          label="End Date"
          utc
        />

        <HookFormField<TFieldValues, { value: string }>
          control={Dropdown}
          fluid
          logger={logger}
          hookControl={control}
          hookName={`${name}.freq` as Path<TFieldValues>}
          label={
            <InfoLabel
              text="Frequency"
              help="Span = a continuous time range (no recurrence). Yearly/Monthly/etc. define recurring schedules."
            />
          }
          options={FREQUENCY_OPTIONS}
          selection
          style={{ width: '100%', height: '42px' }}
        />

        {freq && freq !== 'span' && (
          <>
            <HookFormNumeric<TFieldValues>
              fluid
              logger={logger}
              hookControl={control}
              hookName={`${name}.interval` as Path<TFieldValues>}
              label={
                <InfoLabel
                  text="Interval"
                  help="Number of frequency units to skip between occurrences. Example: every 2 weeks."
                />
              }
              numericDecimalScale={0}
            />

            <HookFormNumeric<TFieldValues>
              fluid
              logger={logger}
              hookControl={control}
              hookName={`${name}.count` as Path<TFieldValues>}
              label={
                <InfoLabel
                  text="Count"
                  help="Maximum number of occurrences to generate for this rule."
                />
              }
              numericDecimalScale={0}
            />
          </>
        )}
      </Form.Group>
    </Segment>
  );
};
