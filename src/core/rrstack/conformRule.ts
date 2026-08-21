import type { HookFormRRStackRuleData } from './types';

export const conformRule = (rule: HookFormRRStackRuleData) => {
  const { duration, options, ...restRule } = rule;

  const { ends, freq, starts, ...recurOptions } = options;

  const hasDuration = Object.values(duration ?? {}).some(Boolean);

  const hasRecurOptions = Object.values(recurOptions).some(Boolean);

  const conformedRule: HookFormRRStackRuleData = {
    ...restRule,
    ...(freq === 'span'
      ? {}
      : { duration: hasDuration ? duration : { days: 1 } }),
    options: {
      ends,
      freq,
      starts,
      ...(freq === 'span' ? {} : recurOptions),
    },
  };

  const changed =
    freq === 'span' ? hasDuration || hasRecurOptions : !hasDuration;

  return { conformedRule, changed };
};
