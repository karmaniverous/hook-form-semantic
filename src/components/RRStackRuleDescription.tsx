import type { DescribeOptions } from '@karmaniverous/rrstack';
import type { UseRRStackOutput } from '@karmaniverous/rrstack/react';
import { useRRStackSelector } from '@karmaniverous/rrstack/react';
import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { useMemo } from 'react';

interface OwnProps extends DescribeOptions {
  fallback?: React.ReactNode; // displayed if rule index is out of range
  index: number;
  rrstack: UseRRStackOutput['rrstack'];
}

type RRStackRuleDescriptionProps<T extends ElementType> = OwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof OwnProps | 'as'> & {
    as?: T;
  };

export const RRStackRuleDescription = <T extends ElementType = 'span'>({
  as,
  className,
  fallback = null,
  formatTimeZone,
  includeBounds,
  includeTimeZone,
  index,
  rrstack,
}: RRStackRuleDescriptionProps<T>) => {
  const As = (as ?? 'span') as ElementType;

  // Select only the atoms needed for this description
  const {
    selection: [ruleRef, tz],
  } = useRRStackSelector({
    rrstack,
    selector: (s) => [s.rules[index], s.timezone] as const,
    // Suppress renders unless the referenced rule object OR timezone actually changed.
    isEqual: (a, b) => a[0] === b[0] && a[1] === b[1],
  });

  const text = useMemo(() => {
    if (!ruleRef) return '';
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
    ruleRef,
    tz,
    rrstack,
    index,
    includeBounds,
    includeTimeZone,
    formatTimeZone,
  ]);

  if (!ruleRef) return fallback as JSX.Element | null;

  return <As className={className}>{text}</As>;
};
