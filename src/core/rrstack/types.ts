import type { RRStackJson } from '@karmaniverous/rrstack';
import type { FieldPathByValue, FieldValues } from 'react-hook-form';

export type RRStackJsonRule = NonNullable<RRStackJson['rules']>[number];

export type RRStackJsonRuleOptions = NonNullable<RRStackJsonRule['options']>;

export type HookFormRRStackRuleOptionsData = Omit<
  RRStackJsonRuleOptions,
  'byhour' | 'byminute' | 'bymonthday' | 'ends' | 'freq' | 'starts'
> & {
  byhour?: string;
  byminute?: string;
  bymonthday?: string;
  ends?: Date | null;
  freq: NonNullable<RRStackJsonRuleOptions['freq']> | 'span';
  starts?: Date | null;
};

export type HookFormRRStackRuleData = Omit<RRStackJsonRule, 'options'> & {
  options: HookFormRRStackRuleOptionsData;
};

export type HookFormRRStackData = Omit<RRStackJson, 'rules'> & {
  rules: HookFormRRStackRuleData[];
};

export type HookFormRRStackPath<TFieldValues extends FieldValues> =
  FieldPathByValue<TFieldValues, HookFormRRStackData>;
