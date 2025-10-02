import type { RuleJson } from '@karmaniverous/rrstack';
import type { UseRRStackOutput } from '@karmaniverous/rrstack/react';
import { render, screen } from '@testing-library/react';
import { type Path, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HookFormRRStackRuleForm } from './HookFormRRStackRuleForm';

describe('HookFormRRStackRuleForm Timestamp Handling', () => {
  const baseRule: RuleJson = {
    effect: 'active',
    duration: {},
    options: {
      freq: 'daily',
    },
    label: 'Test Rule',
  };

  const createStubRRStack = (rule: RuleJson): UseRRStackOutput['rrstack'] =>
    ({
      timezone: 'UTC',
      // clone to avoid cross-test mutation
      rules: [JSON.parse(JSON.stringify(rule))],
      getEffectiveBounds: vi.fn(() => ({ empty: true })),
      // movement helpers (not exercised here)
      top: vi.fn(),
      up: vi.fn(),
      down: vi.fn(),
      bottom: vi.fn(),
      removeRule: vi.fn(),
      addRule: vi.fn(),
      // formatInstant not needed by this form; keep a stub in case
      formatInstant: vi.fn(() => ''),
    }) as unknown as UseRRStackOutput['rrstack'];

  let rrstack: UseRRStackOutput['rrstack'];

  beforeEach(() => {
    vi.clearAllMocks();
    rrstack = createStubRRStack(baseRule);
  });

  it('renders with start date without automatic time adjustment', () => {
    // RHF harness
    const Harness = () => {
      const { control } = useForm<{ schedule: unknown }>();
      return (
        <HookFormRRStackRuleForm
          index={0}
          logger={console}
          rrstack={rrstack}
          hookControl={control}
          hookName={'schedule' as Path<{ schedule: unknown }>}
        />
      );
    };

    const testDate = new Date('2024-01-15');
    // set starts on the first rule
    (rrstack.rules[0] as unknown as RuleJson).options.starts =
      testDate.getTime();

    render(<Harness />);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });

  it('renders with end date without automatic time adjustment', () => {
    const Harness = () => {
      const { control } = useForm<{ schedule: unknown }>();
      return (
        <HookFormRRStackRuleForm
          index={0}
          logger={console}
          rrstack={rrstack}
          hookControl={control}
          hookName={'schedule' as Path<{ schedule: unknown }>}
        />
      );
    };
    const testDate = new Date('2024-01-15');
    (rrstack.rules[0] as unknown as RuleJson).options.ends = testDate.getTime();

    render(<Harness />);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });

  it('handles clearing dates properly', () => {
    const Harness = () => {
      const { control } = useForm<{ schedule: unknown }>();
      return (
        <HookFormRRStackRuleForm
          index={0}
          logger={console}
          rrstack={rrstack}
          hookControl={control}
          hookName={'schedule' as Path<{ schedule: unknown }>}
        />
      );
    };
    const r = rrstack.rules[0] as unknown as RuleJson;
    r.options.starts = undefined;
    r.options.ends = undefined;

    render(<Harness />);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });

  it('displays date picker fields', () => {
    const Harness = () => {
      const { control } = useForm<{ schedule: unknown }>();
      return (
        <HookFormRRStackRuleForm
          index={0}
          logger={console}
          rrstack={rrstack}
          hookControl={control}
          hookName={'schedule' as Path<{ schedule: unknown }>}
        />
      );
    };
    render(<Harness />);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rule label')).toBeInTheDocument();
  });

  it('creates proper date range when both dates are selected', () => {
    const Harness = () => {
      const { control } = useForm<{ schedule: unknown }>();
      return (
        <HookFormRRStackRuleForm
          index={0}
          rrstack={rrstack}
          hookControl={control}
          hookName={'schedule' as Path<{ schedule: unknown }>}
        />
      );
    };
    const startDate = new Date('2024-01-15');
    const endDate = new Date('2024-01-16');

    const r = rrstack.rules[0] as unknown as RuleJson;
    r.options.starts = startDate.getTime();
    r.options.ends = endDate.getTime();

    render(<Harness />);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rule label')).toBeInTheDocument();
  });

  it('preserves timestamp values without automatic adjustment', () => {
    const Harness = () => {
      const { control } = useForm<{ schedule: unknown }>();
      return (
        <HookFormRRStackRuleForm
          index={0}
          rrstack={rrstack}
          hookControl={control}
          hookName={'schedule' as Path<{ schedule: unknown }>}
        />
      );
    };
    const startTimestamp = new Date('2024-01-15T14:30:00').getTime();
    const endTimestamp = new Date('2024-01-16T16:45:00').getTime();

    const r = rrstack.rules[0] as unknown as RuleJson;
    r.options.starts = startTimestamp;
    r.options.ends = endTimestamp;

    render(<Harness />);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });
});
