import { type FieldPath, type FieldValues, type Path } from 'react-hook-form';
import { Container, Grid } from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

import { HookFormRRStackRuleDuration } from './HookFormRRStackRuleDuration';
import { HookFormRRStackRuleEffect } from './HookFormRRStackRuleEffect';
import { HookFormRRStackRuleMonthdays } from './HookFormRRStackRuleMonthdays';
import { HookFormRRStackRuleRange } from './HookFormRRStackRuleRange';
import { HookFormRRStackRuleTime } from './HookFormRRStackRuleTime';
import { HookFormRRStackRuleWeekdays } from './HookFormRRStackRuleWeekdays';
import type { HookFormRRStackRuleData } from './types';

type HookFormRRStackRuleFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = HookFormProps<TFieldValues, TName>;

export const HookFormRRStackRuleForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormRRStackRuleFormProps<TFieldValues, TName>,
) => {
  const {
    controller: {
      field: { value },
    },
    deprefixed: {
      hook: { name, control },
    },
    rest: { logger },
  } = useHookForm({ props, prefixes: ['fieldArray'] });

  // Safely access current rule and key attributes
  const { options: { freq } = {} } = value as HookFormRRStackRuleData;

  return (
    <Container>
      <HookFormRRStackRuleEffect<TFieldValues>
        hookControl={control}
        hookName={name}
        logger={logger}
      />

      <HookFormRRStackRuleRange<TFieldValues>
        hookControl={control}
        hookName={`${name}.options` as Path<TFieldValues>}
        logger={logger}
      />

      {freq && freq !== 'span' && (
        <>
          <Grid columns={3} stackable style={{ margin: 0, padding: 0 }}>
            <Grid.Column style={{ paddingLeft: 0 }}>
              <HookFormRRStackRuleMonthdays<TFieldValues>
                hookControl={control}
                hookName={`${name}.options` as Path<TFieldValues>}
                logger={logger}
              />
            </Grid.Column>

            <Grid.Column style={{ paddingLeft: 0 }}>
              <HookFormRRStackRuleWeekdays<TFieldValues>
                hookControl={control}
                hookName={`${name}.options` as Path<TFieldValues>}
                logger={logger}
              />
            </Grid.Column>

            <Grid.Column style={{ paddingLeft: 0, paddingRight: 0 }}>
              <HookFormRRStackRuleTime<TFieldValues>
                hookControl={control}
                hookName={`${name}.options` as Path<TFieldValues>}
                logger={logger}
              />
            </Grid.Column>
          </Grid>

          <HookFormRRStackRuleDuration<TFieldValues>
            hookControl={control}
            hookName={`${name}.duration` as Path<TFieldValues>}
            logger={logger}
          />
        </>
      )}
    </Container>
  );
};
