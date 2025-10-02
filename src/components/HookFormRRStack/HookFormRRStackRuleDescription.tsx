import type { DescribeOptions } from '@karmaniverous/rrstack';
import {
  type UseRRStackOutput,
  useRRStackSelector,
} from '@karmaniverous/rrstack/react';
import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { useMemo } from 'react';

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

  // Select only the atoms needed for this description
  const {
    selection: [rules, tz],
  } = useRRStackSelector({
    rrstack,
    // IMPORTANT: depend on the rules array identity (and timezone).
    // HookFormRRStackRuleForm mutates the rule object and replaces the array
    // (rrstack.rules = [...]), so the array identity changes even if the
    // element reference does not. This ensures we re-render on edits.
    selector: (s) => [s.rules, s.timezone] as const,
    isEqual: (a, b) => a[0] === b[0] && a[1] === b[1],
  });

  const text = useMemo(() => {
    const inRange = index >= 0 && index < rules.length;
    if (!inRange) return '';
    try {
      return rrstack.describeRule(index, {
        includeBounds,
        includeTimeZone,
        formatTimeZone, // NEW: customize timezone label
      });
    } catch {
      // describeRule throws if index is out of range; guard defensively
      return '';
    }
  }, [
    rules,
    tz,
    rrstack,
    index,
    includeBounds,
    includeTimeZone,
    formatTimeZone,
  ]);

  if (!(index >= 0 && index < rules.length))
    return fallback as JSX.Element | null;

  return (
    <As className={className} {...rest}>
      {text}
    </As>
  );
};
