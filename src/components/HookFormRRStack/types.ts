export type Effect = 'active' | 'blackout';

export type FrequencyUI =
  | 'span'
  | 'yearly'
  | 'monthly'
  | 'weekly'
  | 'daily'
  | 'hourly'
  | 'minutely'
  | 'secondly';

export type FrequencyEngine =
  | 'yearly'
  | 'monthly'
  | 'weekly'
  | 'daily'
  | 'hourly'
  | 'minutely'
  | 'secondly';

export interface UIDuration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface UIRuleOptionsUI {
  freq?: FrequencyUI;
  starts?: Date | null;
  ends?: Date | null;
  interval?: number;
  count?: number;
  bymonth?: number[];
  byweekday?: number[];
  bysetpos?: number[];
  bymonthdayText?: string;
  byhourText?: string;
  byminuteText?: string;
}

export interface UIRuleUI {
  label?: string;
  effect: Effect;
  duration?: UIDuration;
  options: UIRuleOptionsUI;
}

export interface UISchedule {
  timezone: string;
  rules: UIRuleUI[];
}

export interface EngineRuleOptions {
  freq?: FrequencyEngine;
  starts?: number;
  ends?: number;
  interval?: number;
  count?: number;
  bymonth?: number[];
  byweekday?: number[];
  bysetpos?: number[];
  bymonthday?: number[];
  byhour?: number[];
  byminute?: number[];
}

export interface EngineRule {
  label?: string;
  effect: Effect;
  duration?: UIDuration;
  options: EngineRuleOptions;
}

export interface EngineSchedule {
  timezone: string;
  rules: EngineRule[];
}
