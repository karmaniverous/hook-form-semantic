import type {
  RuleJson,
  TimeZoneId,
  UnixTimeUnit,
} from '@karmaniverous/rrstack';
import { type DescribeConfig, describeRule } from '@karmaniverous/rrstack';
import type { JSX } from 'react';
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  useMemo,
} from 'react';
import { type FieldPath, type FieldValues, useWatch } from 'react-hook-form';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import { concatClassNames } from '@/utils/concatClassNames';
import { getRootName } from '@/utils/getRootName';

import { rhfrule2rrstackrule } from './rhf2rrstack';
import type { HookFormRRStackRuleData } from './types';

export interface HookFormRRStackRuleDescriptionPropsBase<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName> {
  describeConfig: DescribeConfig;
  fallback?: React.ReactNode;
  endDatesInclusive?: boolean;
}

type HookFormRRStackRuleDescriptionProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  T extends ElementType = 'span',
> = HookFormRRStackRuleDescriptionPropsBase<TFieldValues, TName> &
  Omit<
    ComponentPropsWithoutRef<T>,
    keyof HookFormRRStackRuleDescriptionPropsBase<TFieldValues, TName> | 'as'
  > & {
    as?: T;
  };

export const HookFormRRStackRuleDescription = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  T extends ElementType = 'span',
>(
  props: HookFormRRStackRuleDescriptionProps<TFieldValues, TName, T>,
) => {
  const {
    deprefixed: {
      hook: { control, name },
    },
    rest: {
      as,
      className,
      describeConfig,
      endDatesInclusive = false,
      fallback = null,
      ...rest
    },
    watched,
  } = useHookForm({ props });

  const As = (as ?? 'span') as ElementType;

  const rootName = useMemo(() => getRootName(name, 2), [name]);

  const [timezone, timeUnit] = useWatch({
    control,
    name: [`${rootName}.timezone`, `${rootName}.timeUnit`],
  }) as [TimeZoneId, UnixTimeUnit];

  const text = useMemo(() => {
    const rule = rhfrule2rrstackrule(
      watched as unknown as HookFormRRStackRuleData,
      timezone,
      timeUnit,
      endDatesInclusive,
    );

    if (watched && timezone) {
      return describeRule(
        rule as RuleJson,
        timezone as unknown as TimeZoneId,
        timeUnit,
        describeConfig,
      );
    } else return null;
  }, [describeConfig, endDatesInclusive, timeUnit, timezone, watched]);

  return text ? (
    <As
      className={concatClassNames(
        className,
        'hook-form-rrstack-rule-description',
      )}
      {...rest}
    >
      {text}
    </As>
  ) : (
    (fallback as JSX.Element | null)
  );
};
