import type { FieldValues, Path } from 'react-hook-form';
import { Dropdown, Form, Header, Input, Segment } from 'semantic-ui-react';

import { HookFormField } from '@/components/HookFormField';
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

import { InfoLabel } from './InfoLabel';

const MONTH_OPTIONS = [
  { key: 1, text: 'Jan', value: 1 },
  { key: 2, text: 'Feb', value: 2 },
  { key: 3, text: 'Mar', value: 3 },
  { key: 4, text: 'Apr', value: 4 },
  { key: 5, text: 'May', value: 5 },
  { key: 6, text: 'Jun', value: 6 },
  { key: 7, text: 'Jul', value: 7 },
  { key: 8, text: 'Aug', value: 8 },
  { key: 9, text: 'Sep', value: 9 },
  { key: 10, text: 'Oct', value: 10 },
  { key: 11, text: 'Nov', value: 11 },
  { key: 12, text: 'Dec', value: 12 },
];

type HookFormRRStackRuleMonthdaysProps<T extends FieldValues = FieldValues> =
  HookFormProps<T>;

export const HookFormRRStackRuleMonthdays = <
  T extends FieldValues = FieldValues,
>(
  props: HookFormRRStackRuleMonthdaysProps<T>,
) => {
  const {
    deprefixed: {
      hook: { name, control },
    },
  } = useHookForm({ props });

  return (
    <Segment>
      <Header size="tiny">Months</Header>
      <Form.Group widths="equal" style={{ marginBottom: 0 }}>
        <HookFormField<T, { value: number[] }>
          compact
          control={Dropdown}
          hookControl={control}
          hookName={`${name}.options.bymonth` as Path<T>}
          label={
            <InfoLabel
              text="Months"
              help="Restrict recurrences to specific months."
            />
          }
          multiple
          options={MONTH_OPTIONS}
          search
          selection
        />

        <HookFormField<T, { value: string }>
          control={Input}
          hookControl={control}
          hookName={`${name}.options.bymonthdayText` as Path<T>}
          label={
            <InfoLabel
              text="DoM"
              help="Comma-separated days within the month for recurrences (e.g., 1, 15, 31)."
            />
          }
          placeholder="25 (for 25th)"
          size="small"
        />
      </Form.Group>{' '}
    </Segment>
  );
};
