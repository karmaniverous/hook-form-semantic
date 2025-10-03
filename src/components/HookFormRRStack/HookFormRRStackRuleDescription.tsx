import type { DescribeOptions } from '@karmaniverous/rrstack';
import { type UseRRStackOutput } from '@karmaniverous/rrstack/react';
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  useMemo,
} from 'react';

export interface HookFormRRStackRuleDescriptionPropsBase
  extends DescribeOptions {
  fallback?: React.ReactNode; // displayed if rule index is out of range
  index: number;
  rrstack: UseRRStackOutput['rrstack'];
}

type HookFormRRStackRuleDescriptionProps<T extends ElementType> =
  HookFormRRStackRuleDescriptionPropsBase &
    Omit<
      ComponentPropsWithoutRef<T>,
      keyof HookFormRRStackRuleDescriptionPropsBase | 'as'
    > & {
      as?: T;
    };

export const HookFormRRStackRuleDescription = <T extends ElementType = 'span'>({
  as,
  className,
  fallback = null,
  formatTimeZone,
  includeBounds,
  includeTimeZone,
  index,
  rrstack,
  ...rest
}: HookFormRRStackRuleDescriptionProps<T>) => {
  const As = (as ?? 'span') as ElementType;

  const text = useMemo(
    () =>
      index > 0 && index < rrstack.rules.length
        ? rrstack.describeRule(index, {
            includeBounds,
            includeTimeZone,
            formatTimeZone,
          })
        : null,
    [index, rrstack, includeBounds, includeTimeZone, formatTimeZone],
  );

  return text ? (
    <As className={className} {...rest}>
      {text}
    </As>
  ) : (
    fallback
  );
};
