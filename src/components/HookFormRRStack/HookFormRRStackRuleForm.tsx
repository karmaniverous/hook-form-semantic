import { useEffect, useMemo } from 'react';
import type {
  ArrayPath,
  FieldArray,
  UseFieldArrayReturn,
} from 'react-hook-form';
import {
  type FieldPath,
  type FieldValues,
  type Path,
  useWatch,
} from 'react-hook-form';
import { Container, Grid } from 'semantic-ui-react';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PrefixProps } from '@/types/PrefixProps';
import { path2index } from '@/utils/path2index';

import { HookFormRRStackRuleDuration } from './HookFormRRStackRuleDuration';
import { HookFormRRStackRuleEffect } from './HookFormRRStackRuleEffect';
import { HookFormRRStackRuleMonthdays } from './HookFormRRStackRuleMonthdays';
import { HookFormRRStackRuleRange } from './HookFormRRStackRuleRange';
import { HookFormRRStackRuleTime } from './HookFormRRStackRuleTime';
import { HookFormRRStackRuleWeekdays } from './HookFormRRStackRuleWeekdays';
import type { HookFormRRStackRuleData } from './types';

interface HookFormRRStackRuleFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    PrefixProps<
      Pick<UseFieldArrayReturn<TFieldValues>, 'update'>,
      'fieldArray'
    > {}

export const HookFormRRStackRuleForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormRRStackRuleFormProps<TFieldValues, TName>,
) => {
  const {
    deprefixed: {
      fieldArray: { update },
      hook: { name, control },
    },
    rest: { logger },
  } = useHookForm({ props, prefixes: ['fieldArray'] });

  const index = useMemo(() => path2index(name), [name]);

  const rule = useWatch({
    control,
    name: name as Path<TFieldValues>,
  }) as FieldArray<
    TFieldValues,
    ArrayPath<TFieldValues>
  > extends HookFormRRStackRuleData
    ? FieldArray<TFieldValues, ArrayPath<TFieldValues>>
    : never;

  const { duration, options: { freq } = {} } = useMemo(
    () => rule ?? {},
    [rule],
  );

  useEffect(() => {
    if (
      index &&
      freq &&
      freq !== 'span' &&
      !Object.values(duration ?? {}).some(Boolean)
    )
      update(index, { ...rule, duration: { days: 1 } }) as FieldArray<
        TFieldValues,
        ArrayPath<TFieldValues>
      >;
  }, [rule, update, index, freq, duration]);

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
