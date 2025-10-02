import type { FieldValues, Path } from 'react-hook-form';
import { Dropdown, Form, Header, Segment } from 'semantic-ui-react';

import { HookFormField } from '@/components/HookFormField';
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

import { InfoLabel } from './InfoLabel';

const WEEKDAY_OPTIONS = [
  { key: 0, text: 'Mon', value: 0 },
  { key: 1, text: 'Tue', value: 1 },
  { key: 2, text: 'Wed', value: 2 },
  { key: 3, text: 'Thu', value: 3 },
  { key: 4, text: 'Fri', value: 4 },
  { key: 5, text: 'Sat', value: 5 },
  { key: 6, text: 'Sun', value: 6 },
];

const POSITION_OPTIONS = [
  { key: 1, text: '1st', value: 1 },
  { key: 2, text: '2nd', value: 2 },
  { key: 3, text: '3rd', value: 3 },
  { key: 4, text: '4th', value: 4 },
  { key: -1, text: 'Last', value: -1 },
];

type HookFormRRStackRuleWeekdaysProps<T extends FieldValues = FieldValues> =
  HookFormProps<T>;

export const HookFormRRStackRuleWeekdays = <
  T extends FieldValues = FieldValues,
>(
  props: HookFormRRStackRuleWeekdaysProps<T>,
) => {
  const {
    deprefixed: {
      hook: { name, control },
    },
  } = useHookForm({ props });

  return (
    <Segment>
      <Header size="tiny">Weekdays</Header>

      <Form.Group widths="equal" style={{ marginBottom: '-5px' }}>
        <HookFormField<T, { value: number[] }>
          compact
          control={Dropdown}
          hookControl={control}
          hookName={`${name}.options.byweekday` as Path<T>}
          label={
            <InfoLabel
              text="Weekdays"
              help="Select days of the week for recurrences within periods."
            />
          }
          multiple
          options={WEEKDAY_OPTIONS}
          search
          selection
        />

        <HookFormField<T, { value: number[] }>
          compact
          control={Dropdown}
          hookControl={control}
          hookName={`${name}.options.bysetpos` as Path<T>}
          label={
            <InfoLabel
              text="Position"
              help="Select nth occurrence within the period (e.g., 1st, 2nd, Last). Requires weekdays to be selected."
            />
          }
          multiple
          options={POSITION_OPTIONS}
          selection
        />
      </Form.Group>
    </Segment>
  );
};
