import type {
  FrequencyStr,
  RRStackOptions,
  RuleJson,
  RuleOptionsJson,
} from '@karmaniverous/rrstack';
import type { FieldPathByValue, FieldValues } from 'react-hook-form';

export type HookFormRRStackRuleOptionsData = Omit<
  RuleOptionsJson,
  | 'byhour'
  | 'byminute'
  | 'bymonth'
  | 'bymonthday'
  | 'bysetpos'
  | 'byweekday'
  | 'ends'
  | 'freq'
  | 'starts'
> & {
  byhourText?: string;
  byminuteText?: string;
  bymonth?: number[];
  bymonthdayText?: string;
  bysetpos?: number[];
  byweekday?: number[];
  ends?: Date | null;
  freq?: FrequencyStr | 'span';
  starts?: Date | null;
};

export type HookFormRRStackRuleData = Omit<RuleJson, 'options'> & {
  options: HookFormRRStackRuleOptionsData;
};

export type HookFormRRStackData = Pick<RRStackOptions, 'timezone'> & {
  rules: HookFormRRStackRuleData[];
};

export type HookFormRRStackPath<TFieldValues extends FieldValues> =
  FieldPathByValue<TFieldValues, HookFormRRStackData>;
