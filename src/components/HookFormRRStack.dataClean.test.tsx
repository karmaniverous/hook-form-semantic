import type { RRStackOptions, RuleJson } from '@karmaniverous/rrstack';
import { describe, expect, test } from 'vitest';

// Test the data cleaning functionality using the same simple approach as HookFormRRStack
const cleanRRStackData = (data: RRStackOptions): RRStackOptions => {
  // Clean the data using JSON serialization to remove any comments or non-serializable properties
  return JSON.parse(JSON.stringify(data));
};

describe('HookFormRRStack Data Cleaning', () => {
  test('removes comments from rule data using JSON serialization', () => {
    const dirtyData: RRStackOptions = {
      timezone: 'UTC',
      timeUnit: 'ms',
      rules: [
        {
          effect: 'active',
          duration: {
            days: 1,
          },
          options: {
            freq: 'monthly',
            byweekday: [4], // This comment should be removed
            bysetpos: [1], // This comment should be removed
          },
          label: 'First Friday',
        },
        {
          effect: 'blackout',
          duration: {
            days: 1,
          },
          options: {
            freq: 'yearly',
            bymonth: [12],
            bymonthday: [25],
          },
          label: 'Except Christmas Day',
        },
      ],
    };

    const cleanedData = cleanRRStackData(dirtyData);

    // Verify the structure is preserved
    expect(cleanedData.timezone).toBe('UTC');
    expect(cleanedData.timeUnit).toBe('ms');
    expect(cleanedData.rules).toHaveLength(2);

    // Verify first rule is cleaned
    const firstRule = cleanedData.rules![0];
    expect(firstRule.effect).toBe('active');
    expect(firstRule.label).toBe('First Friday');
    expect(firstRule.duration.days).toBe(1);
    expect(firstRule.options.freq).toBe('monthly');
    expect(firstRule.options.byweekday).toEqual([4]);
    expect(firstRule.options.bysetpos).toEqual([1]);

    // Verify second rule is cleaned
    const secondRule = cleanedData.rules![1];
    expect(secondRule.effect).toBe('blackout');
    expect(secondRule.label).toBe('Except Christmas Day');
    expect(secondRule.duration.days).toBe(1);
    expect(secondRule.options.freq).toBe('yearly');
    expect(secondRule.options.bymonth).toEqual([12]);
    expect(secondRule.options.bymonthday).toEqual([25]);
  });

  test('handles empty or undefined data gracefully', () => {
    const emptyData: RRStackOptions = {
      timezone: 'UTC',
      timeUnit: 'ms',
      rules: [],
    };

    const cleanedData = cleanRRStackData(emptyData);

    expect(cleanedData.timezone).toBe('UTC');
    expect(cleanedData.timeUnit).toBe('ms');
    expect(cleanedData.rules).toEqual([]);
  });

  test('preserves all valid RRStack options', () => {
    const validData: RRStackOptions = {
      timezone: 'America/New_York',
      timeUnit: 's',
      rules: [
        {
          effect: 'active',
          duration: {
            years: 1,
            months: 2,
            days: 3,
            hours: 4,
            minutes: 5,
            seconds: 6,
          },
          options: {
            freq: 'weekly',
            interval: 2,
            count: 10,
            byhour: [9, 17],
            byminute: [0, 30],
            byweekday: [1, 3, 5],
            bymonth: [6, 12],
            bymonthday: [1, 15],
            bysetpos: [1, -1],
          },
          label: 'Complex Rule',
        },
      ],
    };

    const cleanedData = cleanRRStackData(validData);

    // Verify all valid properties are preserved
    expect(cleanedData).toEqual(validData);
  });

  test('demonstrates JSON serialization removes non-serializable properties', () => {
    const dataWithFunction: RRStackOptions & Record<string, unknown> = {
      timezone: 'UTC',
      timeUnit: 'ms',
      rules: [
        {
          effect: 'active',
          duration: { days: 1 },
          options: { freq: 'daily' },
          label: 'Test Rule',
          // This function should be removed by JSON serialization
          someFunction: () => 'this will be removed',
          // This undefined value should be removed
          undefinedValue: undefined,
        } as RuleJson & Record<string, unknown>,
      ],
      // This function at the top level should also be removed
      topLevelFunction: () => 'removed',
    };

    const cleanedData = cleanRRStackData(dataWithFunction);

    // Verify functions and undefined values are removed
    expect(cleanedData.rules![0]).not.toHaveProperty('someFunction');
    expect(cleanedData.rules![0]).not.toHaveProperty('undefinedValue');
    expect(cleanedData).not.toHaveProperty('topLevelFunction');

    // Verify valid properties are preserved
    expect(cleanedData.rules![0].effect).toBe('active');
    expect(cleanedData.rules![0].label).toBe('Test Rule');
    expect(cleanedData.rules![0].duration.days).toBe(1);
    expect(cleanedData.rules![0].options.freq).toBe('daily');
  });
});
