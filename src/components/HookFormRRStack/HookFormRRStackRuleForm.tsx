import type { UseRRStackOutput } from '@karmaniverous/rrstack/react';
import { type FieldValues, type Path, useWatch } from 'react-hook-form';
import { Container, Grid } from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

import { HookFormRRStackRuleDuration } from './HookFormRRStackRuleDuration';
import { HookFormRRStackRuleEffect } from './HookFormRRStackRuleEffect';
import { HookFormRRStackRuleMonthdays } from './HookFormRRStackRuleMonthdays';
import { HookFormRRStackRuleRange } from './HookFormRRStackRuleRange';
import { HookFormRRStackRuleTime } from './HookFormRRStackRuleTime';
import { HookFormRRStackRuleWeekdays } from './HookFormRRStackRuleWeekdays';

interface HookFormRRStackRuleFormProps<T extends FieldValues = FieldValues>
  extends HookFormProps<T> {
  index: number;
  rrstack: UseRRStackOutput['rrstack'];
}

export const HookFormRRStackRuleForm = <T extends FieldValues = FieldValues>(
  props: HookFormRRStackRuleFormProps<T>,
) => {
  const {
    deprefixed: {
      hook: { name, control },
    },
  } = useHookForm({ props });

  const freq = useWatch({
    control,
    name: `${name}.options.freq` as Path<T>,
  });

  return (
    <Container>
      <HookFormRRStackRuleEffect<T> hookControl={control} hookName={name} />

      <HookFormRRStackRuleRange<T>
        hookControl={control}
        hookName={`${name}.options` as Path<T>}
      />

      {freq && freq !== 'span' && (
        <>
          <Grid columns={3} stackable style={{ margin: 0, padding: 0 }}>
            <Grid.Column style={{ paddingLeft: 0 }}>
              <HookFormRRStackRuleMonthdays<T>
                hookControl={control}
                hookName={name as Path<T>}
              />
            </Grid.Column>

            <Grid.Column style={{ paddingLeft: 0 }}>
              <HookFormRRStackRuleWeekdays<T>
                hookControl={control}
                hookName={name as Path<T>}
              />
            </Grid.Column>

            <Grid.Column style={{ paddingLeft: 0, paddingRight: 0 }}>
              <HookFormRRStackRuleTime<T>
                hookControl={control}
                hookName={name as Path<T>}
              />
            </Grid.Column>
          </Grid>

          <HookFormRRStackRuleDuration<T>
            hookControl={control}
            hookName={`${name}.duration` as Path<T>}
          />
        </>
      )}
    </Container>
  );
};
