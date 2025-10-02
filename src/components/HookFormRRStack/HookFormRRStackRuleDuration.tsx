import type { FieldPath, FieldValues } from 'react-hook-form';
import { Form, Header, Segment } from 'semantic-ui-react';

import { HookFormNumeric } from '@/components/HookFormNumeric';
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

import { InfoLabel } from './InfoLabel';

type HookFormRRStackRuleDurationProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = HookFormProps<TFieldValues, TName>;

export const HookFormRRStackRuleDuration = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormRRStackRuleDurationProps<TFieldValues, TName>,
) => {
  const {
    deprefixed: {
      hook: { name, control },
    },
  } = useHookForm({ props });

  return (
    <Segment style={{ marginTop: 0, paddingBottom: 0 }}>
      <Header size="tiny" style={{ marginTop: 0 }}>
        Duration
      </Header>

      <Form.Group widths={6}>
        <HookFormNumeric<TFieldValues, TName>
          hookControl={control}
          hookName={`${name}.years` as TName}
          label={
            <InfoLabel text="Years" help="Duration years component (0+)." />
          }
          numericDecimalScale={0}
        />

        <HookFormNumeric<TFieldValues, TName>
          hookControl={control}
          hookName={`${name}.months` as TName}
          label={
            <InfoLabel text="Months" help="Duration months component (0+)." />
          }
          numericDecimalScale={0}
        />

        <HookFormNumeric<TFieldValues, TName>
          hookControl={control}
          hookName={`${name}.days` as TName}
          label={<InfoLabel text="Days" help="Duration days component (0+)." />}
          numericDecimalScale={0}
        />

        <HookFormNumeric<TFieldValues, TName>
          hookControl={control}
          hookName={`${name}.hours` as TName}
          label={
            <InfoLabel text="Hours" help="Duration hours component (0+)." />
          }
          numericDecimalScale={0}
        />

        <HookFormNumeric<TFieldValues, TName>
          hookControl={control}
          hookName={`${name}.minutes` as TName}
          numericDecimalScale={0}
          label={
            <InfoLabel text="Min" help="Duration minutes component (0+)." />
          }
        />

        <HookFormNumeric<TFieldValues, TName>
          hookControl={control}
          hookName={`${name}.seconds` as TName}
          numericDecimalScale={0}
          label={
            <InfoLabel text="Sec" help="Duration seconds component (0+)." />
          }
        />
      </Form.Group>
    </Segment>
  );
};
