import type { FieldPath, FieldValues, Path } from 'react-hook-form';
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
        <HookFormNumeric<TFieldValues>
          hookControl={control}
          hookName={`${name}.years` as Path<TFieldValues>}
          label={
            <InfoLabel text="Years" help="Duration years component (0+)." />
          }
          numericDecimalScale={0}
        />

        <HookFormNumeric<TFieldValues>
          hookControl={control}
          hookName={`${name}.months` as Path<TFieldValues>}
          label={
            <InfoLabel text="Months" help="Duration months component (0+)." />
          }
          numericDecimalScale={0}
        />

        <HookFormNumeric<TFieldValues>
          hookControl={control}
          hookName={`${name}.days` as Path<TFieldValues>}
          label={<InfoLabel text="Days" help="Duration days component (0+)." />}
          numericDecimalScale={0}
        />

        <HookFormNumeric<TFieldValues>
          hookControl={control}
          hookName={`${name}.hours` as Path<TFieldValues>}
          label={
            <InfoLabel text="Hours" help="Duration hours component (0+)." />
          }
          numericDecimalScale={0}
        />

        <HookFormNumeric<TFieldValues>
          hookControl={control}
          hookName={`${name}.minutes` as Path<TFieldValues>}
          numericDecimalScale={0}
          label={
            <InfoLabel text="Min" help="Duration minutes component (0+)." />
          }
        />

        <HookFormNumeric<TFieldValues>
          hookControl={control}
          hookName={`${name}.seconds` as Path<TFieldValues>}
          numericDecimalScale={0}
          label={
            <InfoLabel text="Sec" help="Duration seconds component (0+)." />
          }
        />
      </Form.Group>
    </Segment>
  );
};
