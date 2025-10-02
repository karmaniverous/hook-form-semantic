import type { FieldValues, Path } from 'react-hook-form';
import { Form, Header, Input, Segment } from 'semantic-ui-react';

import { HookFormField } from '@/components/HookFormField';
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

import { InfoLabel } from './InfoLabel';

type HookFormRRStackRuleTimeProps<T extends FieldValues = FieldValues> =
  HookFormProps<T>;

export const HookFormRRStackRuleTime = <T extends FieldValues = FieldValues>(
  props: HookFormRRStackRuleTimeProps<T>,
) => {
  const {
    deprefixed: {
      hook: { name, control },
    },
  } = useHookForm({ props });

  return (
    <Segment>
      <Header size="tiny">Time</Header>
      <Form.Group widths="equal" style={{ marginBottom: 0 }}>
        <HookFormField<T, { value: string }>
          control={Input}
          hookControl={control}
          hookName={`${name}.options.byhourText` as Path<T>}
          label={
            <InfoLabel
              text="Hours"
              help="Comma-separated hours (0–23) when events should occur. Example: 9, 13, 17"
            />
          }
          placeholder="9, 13, 17"
          size="small"
        />
        <HookFormField<T, { value: string }>
          control={Input}
          hookControl={control}
          hookName={`${name}.options.byminuteText` as Path<T>}
          label={
            <InfoLabel
              text="Minutes"
              help="Comma-separated minutes (0–59). Example: 0, 30"
            />
          }
          placeholder="0, 30"
          size="small"
        />
      </Form.Group>
    </Segment>
  );
};
