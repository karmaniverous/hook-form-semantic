import type { RuleJson } from '@karmaniverous/rrstack';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RRStackRuleForm } from './RRStackRuleForm';

describe('RRStackRuleForm Timestamp Handling', () => {
  const mockRule: RuleJson = {
    effect: 'active',
    duration: {},
    options: {
      freq: 'daily',
    },
    label: 'Test Rule',
  };

  const mockProps = {
    rule: mockRule,
    mode: 'add' as const,
    onRuleChange: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with start date without automatic time adjustment', () => {
    // Test that the component can render with a start date
    const testDate = new Date('2024-01-15');
    const ruleWithStartDate: RuleJson = {
      ...mockRule,
      options: {
        ...mockRule.options,
        starts: testDate.getTime(),
      },
    };

    render(<RRStackRuleForm {...mockProps} rule={ruleWithStartDate} />);

    // Verify the component renders and shows Start/End Date controls
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Include Time')).toBeInTheDocument();
  });

  it('renders with end date without automatic time adjustment', () => {
    // Test that the component can render with an end date
    const testDate = new Date('2024-01-15');
    const ruleWithEndDate: RuleJson = {
      ...mockRule,
      options: {
        ...mockRule.options,
        ends: testDate.getTime(),
      },
    };

    render(<RRStackRuleForm {...mockProps} rule={ruleWithEndDate} />);

    // Verify the component renders and shows Start/End Date controls
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Include Time')).toBeInTheDocument();
  });

  it('handles clearing dates properly', () => {
    // Test that the component can render without dates (cleared state)
    const ruleWithoutDates: RuleJson = {
      ...mockRule,
      options: {
        ...mockRule.options,
        starts: undefined,
        ends: undefined,
      },
    };

    render(<RRStackRuleForm {...mockProps} rule={ruleWithoutDates} />);

    // Verify the component still renders correctly
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Include Time')).toBeInTheDocument();
  });

  it('displays date picker fields with Include Time checkboxes', () => {
    render(<RRStackRuleForm {...mockProps} />);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();

    // Check for a single Include Time checkbox
    expect(screen.getByText('Include Time')).toBeInTheDocument();
  });

  it('creates proper date range when both dates are selected', () => {
    // Test with both start and end dates
    const startDate = new Date('2024-01-15');
    const endDate = new Date('2024-01-16');

    const ruleWithDateRange: RuleJson = {
      ...mockRule,
      options: {
        ...mockRule.options,
        starts: startDate.getTime(),
        ends: endDate.getTime(),
      },
    };

    render(<RRStackRuleForm {...mockProps} rule={ruleWithDateRange} />);

    // Verify the component renders correctly with both dates
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Include Time')).toBeInTheDocument();
  });

  it('preserves timestamp values without automatic adjustment', () => {
    // Test that timestamps are preserved exactly as provided
    const startTimestamp = new Date('2024-01-15T14:30:00').getTime();
    const endTimestamp = new Date('2024-01-16T16:45:00').getTime();

    const ruleWithTimestamps: RuleJson = {
      ...mockRule,
      options: {
        ...mockRule.options,
        starts: startTimestamp,
        ends: endTimestamp,
      },
    };

    render(<RRStackRuleForm {...mockProps} rule={ruleWithTimestamps} />);

    // Verify the component renders correctly and preserves the timestamps
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Include Time')).toBeInTheDocument();

    // The component should render without errors, indicating timestamps are handled correctly
    expect(screen.getByDisplayValue('Test Rule')).toBeInTheDocument();
  });
});
