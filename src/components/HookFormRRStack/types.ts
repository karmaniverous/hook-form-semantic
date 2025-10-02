import type {
  FrequencyStr,
  RRStackOptions,
  RuleJson,
  RuleOptionsJson,
} from '@karmaniverous/rrstack';
import type { FieldPathByValue, FieldValues } from 'react-hook-form';
import { H } from 'vitest/dist/chunks/environment.d.cL3nLXbE.js';

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

export type HookFormRRStackData = Omit<RRStackOptions, 'rules'> & {
  rules: HookFormRRStackRuleData[];
};

export type HookFormRRStackPath<TFieldValues extends FieldValues> =
  FieldPathByValue<TFieldValues, HookFormRRStackData>;
