import type { FieldPath, FieldValues, Path } from 'react-hook-form';
import { Form, Header, Input, Segment } from 'semantic-ui-react';

import { HookFormField } from '@/components/HookFormField';
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

import { InfoLabel } from './InfoLabel';

type HookFormRRStackRuleTimeProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = HookFormProps<TFieldValues, TName>;

export const HookFormRRStackRuleTime = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormRRStackRuleTimeProps<TFieldValues, TName>,
) => {
  const {
    deprefixed: {
      hook: { name, control },
    },
    rest: { logger },
  } = useHookForm({ props });

  return (
    <Segment>
      <Header size="tiny">Time</Header>
      <Form.Group widths="equal" style={{ marginBottom: 0 }}>
        <HookFormField<TFieldValues, { value: string }>
          control={Input}
          logger={logger}
          hookControl={control}
          hookName={`${name}.options.byhourText` as Path<TFieldValues>}
          label={
            <InfoLabel
              text="Hours"
              help="Comma-separated hours (0–23) when events should occur. Example: 9, 13, 17"
            />
          }
          placeholder="9, 13, 17"
          size="small"
        />
        <HookFormField<TFieldValues, { value: string }>
          control={Input}
          logger={logger}
          hookControl={control}
          hookName={`${name}.options.byminuteText` as Path<TFieldValues>}
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
