import type { FieldPath } from 'react-hook-form';
import { type FieldValues, useWatch } from 'react-hook-form';
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
  } = useHookForm({ props });

  const freq = useWatch({
    control,
    name: `${name}.freq` as TName,
  });

  return (
    <Segment style={{ marginBottom: 0, paddingBottom: 0 }}>
      <Header size="tiny">Valid Range</Header>

      <Form.Group style={{ alignItems: 'flex-end' }}>
        <HookFormDatePicker<TFieldValues, TName>
          hookControl={control}
          hookName={`${name}.starts` as TName}
          label="Start Date"
          width={5}
        />

        <HookFormDatePicker<TFieldValues, TName>
          hookControl={control}
          hookName={`${name}.ends` as TName}
          label="End Date"
          width={5}
        />

        <HookFormField<TFieldValues, { value: string }, TName>
          compact
          control={Dropdown}
          hookControl={control}
          hookName={`${name}.freq` as TName}
          label={
            <InfoLabel
              text="Frequency"
              help="Span = a continuous time range (no recurrence). Yearly/Monthly/etc. define recurring schedules."
            />
          }
          options={FREQUENCY_OPTIONS}
          selection
          style={{ width: '100%', height: '42px' }}
          width={2}
        />

        {freq && freq !== 'span' && (
          <>
            <HookFormNumeric<TFieldValues, TName>
              hookControl={control}
              hookName={`${name}.interval` as TName}
              label={
                <InfoLabel
                  text="Interval"
                  help="Number of frequency units to skip between occurrences. Example: every 2 weeks."
                />
              }
              numericDecimalScale={0}
              width={2}
            />

            <HookFormNumeric<TFieldValues, TName>
              hookControl={control}
              hookName={`${name}.count` as TName}
              label={
                <InfoLabel
                  text="Count"
                  help="Maximum number of occurrences to generate for this rule."
                />
              }
              numericDecimalScale={0}
              width={2}
            />
          </>
        )}
      </Form.Group>
    </Segment>
  );
};
