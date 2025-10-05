import type { TimeZoneId, UnixTimeUnit } from '@karmaniverous/rrstack';
import { type DescribeOptions, describeRule } from '@karmaniverous/rrstack';
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  useMemo,
} from 'react';
import { type FieldPath, type FieldValues, useWatch } from 'react-hook-form';

import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import { concatClassNames } from '@/utils/concatClassNames';

import { rhfrule2rrstackrule } from './rhf2rrstack';
import type { HookFormRRStackRuleData } from './types';

export interface HookFormRRStackRuleDescriptionPropsBase<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    DescribeOptions {
  fallback?: React.ReactNode;
  timeUnit: UnixTimeUnit;
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
      boundsFormat,
      className,
      fallback = null,
      formatTimeZone,
      includeBounds,
      includeTimeZone,
      timeUnit,
      endDatesInclusive = false,
      ...rest
    },
    watched,
  } = useHookForm({ props });

  const As = (as ?? 'span') as ElementType;

  const rootName = useMemo(() => (name as string).split(/\./)[0], [name]);

  const timezone: TimeZoneId = useWatch({
    control,
    name: `${rootName}.timezone`,
  });

  const text = useMemo(() => {
    if (watched && timezone) {
      const rule = rhfrule2rrstackrule(
        watched as unknown as HookFormRRStackRuleData,
        timezone,
        timeUnit,
        endDatesInclusive,
      );

      return describeRule(rule, timezone, timeUnit, {
        boundsFormat,
        includeBounds,
        includeTimeZone,
        formatTimeZone,
      });
    } else return null;
  }, [
    watched,
    timezone,
    timeUnit,
    boundsFormat,
    includeBounds,
    includeTimeZone,
    formatTimeZone,
    endDatesInclusive,
  ]);

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
    fallback
  );
};
