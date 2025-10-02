import { type FieldValues, type Path, useWatch } from 'react-hook-form';
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

type HookFormRRStackRuleRangeProps<T extends FieldValues = FieldValues> =
  HookFormProps<T>;

export const HookFormRRStackRuleRange = <T extends FieldValues = FieldValues>(
  props: HookFormRRStackRuleRangeProps<T>,
) => {
  const {
    deprefixed: {
      hook: { name, control },
    },
  } = useHookForm({ props });

  const freq = useWatch({
    control,
    name: `${name}.freq` as Path<T>,
  });

  return (
    <Segment style={{ marginBottom: 0, paddingBottom: 0 }}>
      <Header size="tiny">Valid Range</Header>

      <Form.Group style={{ alignItems: 'flex-end' }}>
        <HookFormDatePicker<T>
          hookControl={control}
          hookName={`${name}.starts` as Path<T>}
          label="Start Date"
          width={5}
        />

        <HookFormDatePicker<T>
          hookControl={control}
          hookName={`${name}.ends` as Path<T>}
          label="End Date"
          width={5}
        />

        <HookFormField<T, { value: string }>
          compact
          control={Dropdown}
          hookControl={control}
          hookName={`${name}.freq` as Path<T>}
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
            <HookFormNumeric<T>
              hookControl={control}
              hookName={`${name}.interval` as Path<T>}
              label={
                <InfoLabel
                  text="Interval"
                  help="Number of frequency units to skip between occurrences. Example: every 2 weeks."
                />
              }
              numericDecimalScale={0}
              width={2}
            />

            <HookFormNumeric<T>
              hookControl={control}
              hookName={`${name}.count` as Path<T>}
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
