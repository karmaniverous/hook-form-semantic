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

export interface HookFormRRStackRuleDescriptionPropsBase<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormProps<TFieldValues, TName>,
    DescribeOptions {
  fallback?: React.ReactNode;
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
    controller: {
      field: { value },
    },
    deprefixed: {
      hook: { control, name },
    },
    rest: {
      as,
      className,
      fallback = null,
      formatTimeZone,
      includeBounds,
      includeTimeZone,
      ...rest
    },
  } = useHookForm({ props });

  const As = (as ?? 'span') as ElementType;

  const rootName = useMemo(() => (name as string).split(/\./)[0], [name]);

  const [timezone, timeUnit]: [TimeZoneId, UnixTimeUnit] = useWatch({
    control,
    name: [`${rootName}.timezone`, `${rootName}.timeUnit`],
  });

  const text = useMemo(
    () =>
      value && timezone && timeUnit
        ? describeRule(value, timezone, timeUnit, {
            includeBounds,
            includeTimeZone,
            formatTimeZone,
          })
        : null,
    [value, timezone, timeUnit, includeBounds, includeTimeZone, formatTimeZone],
  );

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
