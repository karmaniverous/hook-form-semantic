import type { UseRRStackOutput } from '@karmaniverous/rrstack/react';
import {
  type FieldPath,
  type FieldValues,
  type Path,
  useWatch,
} from 'react-hook-form';
import { Container, Grid } from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

import { HookFormRRStackRuleDuration } from './HookFormRRStackRuleDuration';
import { HookFormRRStackRuleEffect } from './HookFormRRStackRuleEffect';
import { HookFormRRStackRuleMonthdays } from './HookFormRRStackRuleMonthdays';
import { HookFormRRStackRuleRange } from './HookFormRRStackRuleRange';
import { HookFormRRStackRuleTime } from './HookFormRRStackRuleTime';
import { HookFormRRStackRuleWeekdays } from './HookFormRRStackRuleWeekdays';

interface HookFormRRStackRuleFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName> {
  index: number;
  rrstack: UseRRStackOutput['rrstack'];
}

export const HookFormRRStackRuleForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormRRStackRuleFormProps<TFieldValues, TName>,
) => {
  const {
    deprefixed: {
      hook: { name, control },
    },
  } = useHookForm({ props });

  const freq = useWatch({
    control,
    name: `${name}.options.freq` as Path<TFieldValues>,
  });

  return (
    <Container>
      <HookFormRRStackRuleEffect<TFieldValues, TName>
        hookControl={control}
        hookName={name}
      />

      <HookFormRRStackRuleRange<TFieldValues, TName>
        hookControl={control}
        hookName={`${name}.options` as Path<TFieldValues>}
      />

      {freq && freq !== 'span' && (
        <>
          <Grid columns={3} stackable style={{ margin: 0, padding: 0 }}>
            <Grid.Column style={{ paddingLeft: 0 }}>
              <HookFormRRStackRuleMonthdays<TFieldValues, TName>
                hookControl={control}
                hookName={name as Path<TFieldValues>}
              />
            </Grid.Column>

            <Grid.Column style={{ paddingLeft: 0 }}>
              <HookFormRRStackRuleWeekdays<TFieldValues, TName>
                hookControl={control}
                hookName={name as Path<TFieldValues>}
              />
            </Grid.Column>

            <Grid.Column style={{ paddingLeft: 0, paddingRight: 0 }}>
              <HookFormRRStackRuleTime<TFieldValues, TName>
                hookControl={control}
                hookName={name as Path<TFieldValues>}
              />
            </Grid.Column>
          </Grid>
        </>
      )}

      <HookFormRRStackRuleDuration<TFieldValues, TName>
        hookControl={control}
        hookName={`${name}.duration` as Path<TFieldValues>}
      />
    </Container>
  );
};
